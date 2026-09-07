import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/redis and @upstash/ratelimit so we control both "is Redis
// configured" and "did the limit call allow/deny" without a real network.
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

describe("rate-limit.ts", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    slidingWindowMock.mockClear();
    limitMock.mockReset();
    process.env = { ...ORIGINAL_ENV };
  });

  describe("when Upstash is NOT configured (no UPSTASH_REDIS_REST_URL)", () => {
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it("createApiLimiter returns null (degrades gracefully)", async () => {
      const { createApiLimiter } = await import("@/lib/security/rate-limit");
      expect(createApiLimiter()).toBeNull();
    });

    it("createAiLimiter, createAuthLimiter, createWebhookLimiter all return null", async () => {
      const mod = await import("@/lib/security/rate-limit");
      expect(mod.createAiLimiter("free")).toBeNull();
      expect(mod.createAuthLimiter()).toBeNull();
      expect(mod.createWebhookLimiter()).toBeNull();
    });

    it("applyRateLimit with a null limiter allows the request (returns null)", async () => {
      const { applyRateLimit } = await import("@/lib/security/rate-limit");
      const result = await applyRateLimit("some-id", null);
      expect(result).toBeNull();
      expect(limitMock).not.toHaveBeenCalled();
    });
  });

  describe("when Upstash IS configured", () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = "https://fake-upstash.example.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    });

    it("createApiLimiter builds a 60/1m sliding window under the 'rl:api' prefix", async () => {
      const { createApiLimiter } = await import("@/lib/security/rate-limit");
      const limiter = createApiLimiter();
      expect(limiter).not.toBeNull();
      expect(slidingWindowMock).toHaveBeenCalledWith(60, "1 m");
      expect((limiter as unknown as { __config: { prefix: string } }).__config.prefix).toBe(
        "rl:api",
      );
    });

    it("createAuthLimiter builds a 5/1m sliding window under 'rl:auth' (brute-force cap)", async () => {
      const { createAuthLimiter } = await import("@/lib/security/rate-limit");
      createAuthLimiter();
      expect(slidingWindowMock).toHaveBeenCalledWith(5, "1 m");
    });

    it("createWebhookLimiter builds a 100/1m sliding window under 'rl:webhook'", async () => {
      const { createWebhookLimiter } = await import("@/lib/security/rate-limit");
      createWebhookLimiter();
      expect(slidingWindowMock).toHaveBeenCalledWith(100, "1 m");
    });

    it("createAiLimiter gives the FREE plan only 10 req/min under 'rl:ai:free'", async () => {
      const { createAiLimiter } = await import("@/lib/security/rate-limit");
      const limiter = createAiLimiter("free");
      expect(slidingWindowMock).toHaveBeenCalledWith(10, "1 m");
      expect((limiter as unknown as { __config: { prefix: string } }).__config.prefix).toBe(
        "rl:ai:free",
      );
    });

    it("createAiLimiter treats an empty/falsy plan as free (10 req/min)", async () => {
      const { createAiLimiter } = await import("@/lib/security/rate-limit");
      createAiLimiter("");
      expect(slidingWindowMock).toHaveBeenCalledWith(10, "1 m");
    });

    it("createAiLimiter gives ANY paid plan 60 req/min under 'rl:ai:paid'", async () => {
      const { createAiLimiter } = await import("@/lib/security/rate-limit");
      const limiter = createAiLimiter("pro");
      expect(slidingWindowMock).toHaveBeenCalledWith(60, "1 m");
      expect((limiter as unknown as { __config: { prefix: string } }).__config.prefix).toBe(
        "rl:ai:paid",
      );
    });

    it("applyRateLimit allows the request through when under the limit (returns null)", async () => {
      limitMock.mockResolvedValue({ success: true, remaining: 5, reset: Date.now() + 1000 });
      const { createApiLimiter, applyRateLimit } = await import("@/lib/security/rate-limit");
      const limiter = createApiLimiter();
      const result = await applyRateLimit("client-1", limiter);
      expect(result).toBeNull();
      expect(limitMock).toHaveBeenCalledWith("client-1");
    });

    it("applyRateLimit returns a 429 with rate-limit headers when the limiter denies", async () => {
      const resetAt = Date.now() + 15_000;
      limitMock.mockResolvedValue({ success: false, remaining: 0, reset: resetAt });
      const { createApiLimiter, applyRateLimit } = await import("@/lib/security/rate-limit");
      const limiter = createApiLimiter();
      const result = await applyRateLimit("client-2", limiter);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
      expect(result?.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(result?.headers.get("X-RateLimit-Reset")).toBe(resetAt.toString());
      const retryAfter = Number(result?.headers.get("Retry-After"));
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(15);

      const body = await result?.json();
      expect(body.error).toMatch(/too many requests/i);
    });
  });
});
