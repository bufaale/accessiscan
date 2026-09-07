import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("rlAllowed", () => {
  const ORIGINAL_ENV = { ...process.env };
  const ORIGINAL_FETCH = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake-project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-role-key";
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    vi.restoreAllMocks();
  });

  it("fails OPEN (returns true) when Supabase env vars are not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const fetchSpy = vi.spyOn(global, "fetch");
    const result = await rlAllowed("k", 5, 60);
    expect(result).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the rl_hit RPC with the key, max, and window, and returns true when allowed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => true,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const result = await rlAllowed("freescan:1.2.3.4", 6, 60);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://fake-project.supabase.co/rest/v1/rpc/rl_hit");
    expect(init.method).toBe("POST");
    expect(init.headers.apikey).toBe("fake-service-role-key");
    expect(init.headers.Authorization).toBe("Bearer fake-service-role-key");
    const body = JSON.parse(init.body);
    expect(body).toEqual({ p_key: "freescan:1.2.3.4", p_max: 6, p_window_sec: 60 });
  });

  it("returns false (BLOCK) when the RPC says the limit was exceeded", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => false,
    }) as unknown as typeof fetch;

    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const result = await rlAllowed("freescan:1.2.3.4", 6, 60);
    expect(result).toBe(false);
  });

  it("fails OPEN when the RPC responds with a non-OK HTTP status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("should not be called");
      },
    }) as unknown as typeof fetch;

    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const result = await rlAllowed("k", 6, 60);
    expect(result).toBe(true);
  });

  it("fails OPEN when fetch throws (network error / timeout)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error")) as unknown as typeof fetch;
    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const result = await rlAllowed("k", 6, 60);
    expect(result).toBe(true);
  });

  it("treats a non-boolean-true RPC response as NOT allowed (strict equality to true)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => "true", // string, not boolean — must not coerce
    }) as unknown as typeof fetch;
    const { rlAllowed } = await import("@/lib/security/supabase-rate-limit");
    const result = await rlAllowed("k", 6, 60);
    expect(result).toBe(false);
  });
});

describe("clientIpKey", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("builds 'scope:ip' from the first x-forwarded-for entry", async () => {
    const { clientIpKey } = await import("@/lib/security/supabase-rate-limit");
    const req = new Request("https://example.com/api/free/wcag-scan", {
      headers: { "x-forwarded-for": "198.51.100.7, 10.0.0.1" },
    });
    expect(clientIpKey(req, "freescan")).toBe("freescan:198.51.100.7");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    const { clientIpKey } = await import("@/lib/security/supabase-rate-limit");
    const req = new Request("https://example.com/x", {
      headers: { "x-real-ip": "203.0.113.44" },
    });
    expect(clientIpKey(req, "freescan")).toBe("freescan:203.0.113.44");
  });

  it("falls back to 'unknown' when neither header is present", async () => {
    const { clientIpKey } = await import("@/lib/security/supabase-rate-limit");
    const req = new Request("https://example.com/x");
    expect(clientIpKey(req, "freescan")).toBe("freescan:unknown");
  });

  it("trims whitespace around the extracted IP", async () => {
    const { clientIpKey } = await import("@/lib/security/supabase-rate-limit");
    const req = new Request("https://example.com/x", {
      headers: { "x-forwarded-for": "  198.51.100.7  , 10.0.0.1" },
    });
    expect(clientIpKey(req, "freescan")).toBe("freescan:198.51.100.7");
  });
});
