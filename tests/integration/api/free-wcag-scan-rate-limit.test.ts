/**
 * Regression coverage for the rate limiter wired into
 * /api/free/wcag-scan — our most expensive public endpoint (every call
 * runs a real crawl). This route calls rlAllowed(clientIpKey(req,
 * "freescan"), 6, 60) BEFORE parsing the request body.
 *
 * Before this file existed, NOTHING asserted that wiring: the only 429
 * assertions in the repo (tests/e2e/*) are about REMOTE hosts refusing
 * OUR scanner, the opposite direction. A comment on the E2E spec used to
 * claim "11th request from same IP -> 429" coverage that did not exist.
 * The limiter could have been deleted and every test would have stayed
 * green.
 *
 * This is a unit/integration test (route handler invoked directly, all
 * collaborators mocked) rather than an E2E spec that hammers the live
 * endpoint — hammering it self-throttles and produces flaky 429s in
 * OTHER specs sharing the same IP budget (see
 * tests/e2e/integration-free-wcag-scan.spec.ts).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const rlAllowedMock = vi.fn();
const clientIpKeyMock = vi.fn((_req: Request, scope: string) => `${scope}:1.2.3.4`);

vi.mock("@/lib/security/supabase-rate-limit", () => ({
  rlAllowed: rlAllowedMock,
  clientIpKey: clientIpKeyMock,
}));

vi.mock("@/lib/security/url-validator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/url-validator")>();
  return {
    ...actual,
    validateResolvedIP: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("@/lib/free-scan/lite-scanner", () => ({
  scanUrlLite: vi.fn().mockResolvedValue({
    outcome: "ok",
    health_score: 100,
    issues: [],
    total_issue_count: 0,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  })),
}));

vi.mock("@/lib/free/funnel-events", () => ({
  logFreeToolEvent: vi.fn(),
  countBySeverity: vi.fn().mockReturnValue(0),
}));

function makeRequest(bodyJsonSpy?: ReturnType<typeof vi.fn>): NextRequest {
  const req = new NextRequest("https://example.com/api/free/wcag-scan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://target-site.example.com" }),
  });
  if (bodyJsonSpy) {
    // Spy on req.json() to prove it is (or isn't) called, without changing
    // its real behaviour.
    const original = req.json.bind(req);
    req.json = (async () => {
      bodyJsonSpy();
      return original();
    }) as typeof req.json;
  }
  return req;
}

describe("POST /api/free/wcag-scan — rate limit wiring", () => {
  beforeEach(() => {
    rlAllowedMock.mockReset();
    clientIpKeyMock.mockClear();
  });

  it("calls rlAllowed with the route's exact budget: 6 requests / 60s, keyed per-IP under 'freescan'", async () => {
    rlAllowedMock.mockResolvedValue(true);
    const { POST } = await import("@/app/api/free/wcag-scan/route");

    await POST(makeRequest());

    expect(clientIpKeyMock).toHaveBeenCalledWith(expect.anything(), "freescan");
    expect(rlAllowedMock).toHaveBeenCalledWith("freescan:1.2.3.4", 6, 60);
  });

  it("returns 429 when rlAllowed denies the request", async () => {
    rlAllowedMock.mockResolvedValue(false);
    const { POST } = await import("@/app/api/free/wcag-scan/route");

    const res = await POST(makeRequest());

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many scans/i);
  });

  it("does NOT parse the request body when the rate limit denies (limiter runs first)", async () => {
    rlAllowedMock.mockResolvedValue(false);
    const jsonSpy = vi.fn();
    const { POST } = await import("@/app/api/free/wcag-scan/route");

    await POST(makeRequest(jsonSpy));

    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("DOES proceed to parse the body and run the scan when rlAllowed permits", async () => {
    rlAllowedMock.mockResolvedValue(true);
    const jsonSpy = vi.fn();
    const { POST } = await import("@/app/api/free/wcag-scan/route");

    const res = await POST(makeRequest(jsonSpy));

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scan_status).toBe("ok");
  });

  it("a 6th call within the window still passes through when rlAllowed keeps saying yes, and the 7th (denied) call gets 429 — proves the boundary is enforced by the limiter's return value, not a hardcoded count in the route", async () => {
    const { POST } = await import("@/app/api/free/wcag-scan/route");

    for (let i = 0; i < 6; i++) {
      rlAllowedMock.mockResolvedValueOnce(true);
      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
    }

    rlAllowedMock.mockResolvedValueOnce(false);
    const seventh = await POST(makeRequest());
    expect(seventh.status).toBe(429);
    expect(rlAllowedMock).toHaveBeenCalledTimes(7);
  });
});
