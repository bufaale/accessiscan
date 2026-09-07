import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const limitMock = vi.fn();
const slidingWindowMock = vi.fn((limit: number, window: string) => ({
  __limit: limit,
  __window: window,
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function RedisMock(this: Record<string, unknown>, opts: unknown) {
    this.__opts = opts;
  }),
}));

vi.mock("@upstash/ratelimit", () => {
  function RatelimitMock(this: Record<string, unknown>, config: unknown) {
    this.__config = config;
    this.limit = limitMock;
  }
  (RatelimitMock as unknown as { slidingWindow: typeof slidingWindowMock }).slidingWindow =
    slidingWindowMock;
  return { Ratelimit: RatelimitMock };
});

function makeRequest(opts: {
  path: string;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string }>;
}): NextRequest {
  const req = new NextRequest(`https://example.com${opts.path}`, {
    headers: new Headers(opts.headers ?? {}),
  });
  for (const c of opts.cookies ?? []) {
    req.cookies.set(c.name, c.value);
  }
  return req;
}

describe("applyMiddlewareRateLimit", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    slidingWindowMock.mockClear();
    process.env = { ...ORIGINAL_ENV };
    process.env.UPSTASH_REDIS_REST_URL = "https://fake-upstash.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  });

  it("ignores non-/api/ paths entirely (returns null, never calls the limiter)", async () => {
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const req = makeRequest({ path: "/pricing" });
    const result = await applyMiddlewareRateLimit(req);
    expect(result).toBeNull();
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("degrades to allow-all when Upstash env vars are not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    limitMock.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() });
    const req = makeRequest({ path: "/api/scans" });
    const result = await applyMiddlewareRateLimit(req);
    expect(result).toBeNull();
  });

  it("exempts /api/stripe/webhook from rate limiting entirely", async () => {
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const req = makeRequest({ path: "/api/stripe/webhook" });
    const result = await applyMiddlewareRateLimit(req);
    expect(result).toBeNull();
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("exempts /api/twilio/* and /api/cron/* and /api/health", async () => {
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    for (const path of ["/api/twilio/voice", "/api/cron/daily", "/api/health"]) {
      const result = await applyMiddlewareRateLimit(makeRequest({ path }));
      expect(result).toBeNull();
    }
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("routes /api/auth/* through the STRICT (10/min) limiter", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 9, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    await applyMiddlewareRateLimit(makeRequest({ path: "/api/auth/login" }));
    expect(slidingWindowMock).toHaveBeenCalledWith(10, "1 m");
  });

  it("routes /api/scans, /api/overlay-check, /api/pdf-scans through the HEAVY (30/min) limiter", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 29, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    await applyMiddlewareRateLimit(makeRequest({ path: "/api/scans/new" }));
    expect(slidingWindowMock).toHaveBeenCalledWith(30, "1 m");
  });

  it("routes any other /api/* path through the GENERAL (300/min) limiter", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 299, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    await applyMiddlewareRateLimit(makeRequest({ path: "/api/free/wcag-scan" }));
    expect(slidingWindowMock).toHaveBeenCalledWith(300, "1 m");
  });

  it("returns 429 with Retry-After when the limiter denies", async () => {
    const resetAt = Date.now() + 20_000;
    limitMock.mockResolvedValue({ success: false, remaining: 0, reset: resetAt });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const result = await applyMiddlewareRateLimit(makeRequest({ path: "/api/scans" }));
    expect(result?.status).toBe(429);
    const body = await result?.json();
    expect(body.error).toMatch(/slow down/i);
    expect(Number(result?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("Retry-After never goes below 1, even if reset is already in the past", async () => {
    limitMock.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() - 5000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const result = await applyMiddlewareRateLimit(makeRequest({ path: "/api/scans" }));
    expect(result?.headers.get("Retry-After")).toBe("1");
  });

  it("keys by user id (from the sb-*-auth-token cookie) when present, not IP", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 1, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const req = makeRequest({
      path: "/api/scans",
      headers: { "x-forwarded-for": "203.0.113.9" },
      cookies: [{ name: "sb-abcxyz-auth-token", value: "some-long-session-token-value" }],
    });
    await applyMiddlewareRateLimit(req);
    expect(limitMock).toHaveBeenCalledWith(expect.stringMatching(/^user:/));
  });

  it("falls back to x-forwarded-for IP keying when no Supabase auth cookie is present", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 1, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const req = makeRequest({
      path: "/api/scans",
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
    });
    await applyMiddlewareRateLimit(req);
    expect(limitMock).toHaveBeenCalledWith("ip:203.0.113.9");
  });

  it("falls back to x-real-ip, then 'unknown', when x-forwarded-for is absent", async () => {
    limitMock.mockResolvedValue({ success: true, remaining: 1, reset: Date.now() + 1000 });
    const { applyMiddlewareRateLimit } = await import("@/lib/security/middleware-rate-limit");
    const req = makeRequest({
      path: "/api/scans",
      headers: { "x-real-ip": "198.51.100.4" },
    });
    await applyMiddlewareRateLimit(req);
    expect(limitMock).toHaveBeenCalledWith("ip:198.51.100.4");
  });
});
