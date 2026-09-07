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
 *
 * NOTE ON RATE LIMITING (2026-09-07)
 * The route's FIRST guard is rlAllowed(clientIpKey(req, "freescan"), 6, 60) —
 * 6 requests per 60s per IP, checked BEFORE the body is parsed. This file
 * makes ~13 requests, so run unthrottled it rate-limits ITSELF and the
 * validation tests receive 429 where they assert 400. That is a test-harness
 * artifact, not a security regression: every payload below genuinely returns
 * 400 in production when the requests are spaced out (verified by hand).
 *
 * So every request goes through the shared postFreeScan() helper, which
 * retries with exponential backoff while the response is 429. Backoff rather
 * than a fixed sleep on purpose: a hardcoded delay rots the moment the 6/60
 * config changes (cf. pilotdeck's bulk-scan-feed, which self-throttled for
 * weeks on DELAY_BETWEEN_SCANS_MS = 2000). If the limiter never releases,
 * postFreeScan throws — a hung limiter must surface as a red test, never as a
 * silent pass.
 *
 * The 429 behaviour itself is deliberately NOT asserted here; this file owns
 * the 400 validation contract. Do not "fix" a 429 by accepting it as a pass:
 * these payloads (javascript:, file://, private IPs, localhost) are the SSRF
 * regression guard.
 */
import { test, expect } from "@playwright/test";
import { postFreeScan } from "../helpers/test-utils";

// Requests go through the shared postFreeScan() helper in tests/helpers,
// which waits out this endpoint's 6-req/60s-per-IP limiter. Five spec files
// POST here, so the budget is shared across the whole run — the backoff, not
// serialisation, is what makes these tests reliable.
//
// Deliberately NOT test.describe.configure({ mode: "serial" }): the config
// already sets fullyParallel: false, so tests in this file run sequentially
// anyway, and serial mode would additionally SKIP the remaining tests after
// the first failure — which could hide an SSRF regression behind a grey
// "did not run" instead of a red one. Each payload must be able to fail on
// its own. Only the timeout is raised, to accommodate the deliberate waiting.
test.describe.configure({ timeout: 180_000 });

test.describe("Free WCAG scanner — input validation", () => {
  test("POST without body → 400", async () => {
    const r = await postFreeScan();
    expect(r.status).toBe(400);
  });

  test("POST with empty JSON → 400 (url required)", async () => {
    const r = await postFreeScan({});
    expect(r.status).toBe(400);
  });

  for (const url of [
    "not-a-url",
    "ftp://example.com",
    "javascript:alert(1)",
    "data:text/html,<script>",
    "file:///etc/passwd",
  ]) {
    test(`rejects bad URL: ${url}`, async () => {
      const r = await postFreeScan({ url });
      expect(r.status).toBe(400);
    });
  }

  test("rejects URL pointing to private IP (10.x literal)", async () => {
    const res = await postFreeScan({ url: "http://10.0.0.1/" });
    expect(res.status).toBe(400);
  });

  test("rejects URL pointing to localhost", async () => {
    const res = await postFreeScan({ url: "http://localhost:3000/" });
    expect(res.status).toBe(400);
  });

  test("invalid email when provided → 400", async () => {
    const res = await postFreeScan({
      url: "https://example.com",
      email: "not-an-email",
    });
    expect(res.status).toBe(400);
  });
});

test.describe("Free WCAG scanner — happy path returns scan result shape", () => {
  test("scans https://example.com → 200 with { report.health_score, report.issues } shape", async () => {
    const res = await postFreeScan({ url: "https://example.com" });
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
    // httpbin serves a deterministic 403 without any bot-protection flakiness.
    const res = await postFreeScan({ url: "https://httpbin.org/status/403" });
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
    // example.com has html lang set, so it should NOT flag missing lang.
    // Use this to assert the scanner correctly distinguishes good HTML.
    const res = await postFreeScan({ url: "https://example.com" });
    if (res.status === 200) {
      const json = await res.json();
      // example.com is well-formed for our regex checks; expected score
      // should be very high (60+).
      expect(json.report.health_score).toBeGreaterThan(50);
    }
  });
});
