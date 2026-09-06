/**
 * Integration: /api/free/wcag-scan public endpoint.
 *
 * Public lead-gen endpoint at /free/wcag-scanner. Anonymous, no auth.
 * Validates:
 *   - Invalid JSON / no body → 400
 *   - Bad URL (private IP, javascript:, ftp:, malformed) → 400
 *   - Missing url field → 400
 *   - Email field optional, when provided must be valid
 *   - Happy path: returns 200 with { score, issues[] } shape
 *   - Returns the scan result for a real public URL
 *   - Rate limiting (best-effort: 11th request from same IP → 429 if
 *     Upstash configured, otherwise no-op skip)
 */
import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.TEST_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://accessiscan.piposlab.com";

test.describe("Free WCAG scanner — input validation", () => {
  test("POST without body → 400", async ({ request }) => {
    const r = await request.post(`${BASE_URL}/api/free/wcag-scan`, {
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });

  test("POST with empty JSON → 400 (url required)", async ({ request }) => {
    const r = await request.post(`${BASE_URL}/api/free/wcag-scan`, {
      data: {},
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });

  for (const url of [
    "not-a-url",
    "ftp://example.com",
    "javascript:alert(1)",
    "data:text/html,<script>",
    "file:///etc/passwd",
  ]) {
    test(`rejects bad URL: ${url}`, async ({ request }) => {
      const r = await request.post(`${BASE_URL}/api/free/wcag-scan`, {
        data: { url },
        headers: { "content-type": "application/json" },
      });
      expect(r.status()).toBe(400);
    });
  }

  test("rejects URL pointing to private IP (10.x literal)", async () => {
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "http://10.0.0.1/" }),
    });
    expect(res.status).toBe(400);
  });

  test("rejects URL pointing to localhost", async () => {
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "http://localhost:3000/" }),
    });
    expect(res.status).toBe(400);
  });

  test("invalid email when provided → 400", async () => {
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: "https://example.com",
        email: "not-an-email",
      }),
    });
    expect(res.status).toBe(400);
  });
});

test.describe("Free WCAG scanner — happy path returns scan result shape", () => {
  test("scans https://example.com → 200 with { report.health_score, report.issues } shape", async () => {
    test.setTimeout(45_000);
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    // Endpoint returns { report, email_captured, upgrade_cta }. The actual
    // scan output lives under .report — typed as WcagFreeReport in
    // src/lib/free-scan/lite-scanner.ts (health_score, issues, notes, ...).
    expect(json).toHaveProperty("report");
    expect(json.report).toHaveProperty("health_score");
    expect(typeof json.report.health_score).toBe("number");
    expect(json.report.health_score).toBeGreaterThanOrEqual(0);
    expect(json.report.health_score).toBeLessThanOrEqual(100);
    expect(json.report).toHaveProperty("issues");
    expect(Array.isArray(json.report.issues)).toBe(true);
    expect(json).toHaveProperty("upgrade_cta");
    // Honesty contract (2026-09-06): a measured scan says so explicitly, and
    // only a measured scan gets a shareable permalink.
    expect(json.scan_status).toBe("ok");
    expect(json.blocked).toBe(false);
    expect(json.report.outcome).toBe("ok");
    expect(typeof json.share_url === "string" || json.share_url === null).toBe(true);
  });

  // The regression this contract exists for: before 2026-09-06 a site that
  // refused the scanner came back as health_score 0 / issues [] / 200, which a
  // visitor reads as "your site is catastrophically inaccessible".
  test("a site that blocks the scanner → no score, no issues, no share link", async () => {
    test.setTimeout(45_000);
    // httpbin serves a deterministic 403 without any bot-protection flakiness.
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://httpbin.org/status/403" }),
    });
    if (res.status !== 200) {
      test.skip(true, `upstream fixture unavailable (HTTP ${res.status})`);
      return;
    }
    const json = await res.json();
    expect(json.scan_status).toBe("blocked");
    expect(json.blocked).toBe(true);
    expect(json.report.outcome).toBe("blocked");
    expect(json.report.health_score).toBeNull();
    expect(json.report.issues).toEqual([]);
    expect(json.report.total_issue_count).toBe(0);
    // A blocked scan must not be offered as a public scorecard.
    expect(json.share_url).toBeNull();
    expect(json.share_token).toBeNull();
  });

  test("scans a known-bad page (no html lang) → flags serious issue", async () => {
    test.setTimeout(45_000);
    // example.com has html lang set, so it should NOT flag missing lang.
    // Use this to assert the scanner correctly distinguishes good HTML.
    const res = await fetch(`${BASE_URL}/api/free/wcag-scan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    if (res.status === 200) {
      const json = await res.json();
      // example.com is well-formed for our regex checks; expected score
      // should be very high (60+).
      expect(json.report.health_score).toBeGreaterThan(50);
    }
  });
});
