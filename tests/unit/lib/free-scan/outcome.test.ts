import { describe, it, expect } from "vitest";
import {
  BLOCKING_HTTP_STATUSES,
  deriveScanOutcome,
  displayHealthScore,
  isBlockingHttpStatus,
  isUnusableHtml,
  unmeasuredHeadline,
} from "@/lib/free-scan/outcome";

describe("isBlockingHttpStatus", () => {
  it("treats 401 / 403 / 429 as the host refusing an automated request", () => {
    for (const status of [401, 403, 429]) {
      expect(isBlockingHttpStatus(status)).toBe(true);
    }
  });

  it("does not treat a broken page as a block", () => {
    for (const status of [200, 301, 404, 410, 500, 503]) {
      expect(isBlockingHttpStatus(status)).toBe(false);
    }
  });

  it("handles missing statuses", () => {
    expect(isBlockingHttpStatus(null)).toBe(false);
    expect(isBlockingHttpStatus(undefined)).toBe(false);
  });

  it("stays in sync with the exported list the Pilotdeck cron mirrors", () => {
    expect([...BLOCKING_HTTP_STATUSES].sort()).toEqual([401, 403, 429]);
  });
});

describe("deriveScanOutcome", () => {
  it("trusts an explicit outcome when the report carries one", () => {
    expect(deriveScanOutcome({ outcome: "ok" })).toBe("ok");
    expect(deriveScanOutcome({ outcome: "blocked" })).toBe("blocked");
    expect(deriveScanOutcome({ outcome: "failed" })).toBe("failed");
  });

  it("ignores a garbage outcome and falls back to the evidence", () => {
    expect(deriveScanOutcome({ outcome: "totally-fine", fetched_status: 403 })).toBe("blocked");
  });

  // The regression this whole change exists for: months of rows were persisted
  // as health_score 0 / issues [] / error "Fetch returned 403".
  it("classifies a LEGACY 403 row as blocked, not as a real scan", () => {
    const legacy = {
      fetched_status: 403,
      error: "Fetch returned 403",
      health_score: 0,
    };
    expect(deriveScanOutcome(legacy)).toBe("blocked");
    expect(displayHealthScore(legacy)).toBeNull();
  });

  it("classifies a legacy DNS/timeout row as failed", () => {
    const legacy = { fetched_status: null, error: "fetch failed", health_score: 0 };
    expect(deriveScanOutcome(legacy)).toBe("failed");
    expect(displayHealthScore(legacy)).toBeNull();
  });

  it("classifies a legacy 404 row as failed, not blocked", () => {
    expect(deriveScanOutcome({ fetched_status: 404, error: "Fetch returned 404" })).toBe("failed");
  });

  it("treats a clean 200 report as ok", () => {
    expect(deriveScanOutcome({ fetched_status: 200, health_score: 71 })).toBe("ok");
  });

  it("treats a missing report as failed rather than a perfect score", () => {
    expect(deriveScanOutcome(null)).toBe("failed");
    expect(deriveScanOutcome(undefined)).toBe("failed");
    expect(displayHealthScore(null)).toBeNull();
  });
});

describe("displayHealthScore", () => {
  it("returns the real score for a measured scan, including a genuine 0", () => {
    expect(displayHealthScore({ outcome: "ok", fetched_status: 200, health_score: 0 })).toBe(0);
    expect(displayHealthScore({ outcome: "ok", fetched_status: 200, health_score: 88 })).toBe(88);
  });

  it("returns null when the scan measured nothing", () => {
    expect(displayHealthScore({ outcome: "blocked", health_score: null })).toBeNull();
    expect(displayHealthScore({ outcome: "failed", health_score: null })).toBeNull();
  });

  it("returns null when a measured report somehow has no numeric score", () => {
    expect(displayHealthScore({ outcome: "ok", health_score: null })).toBeNull();
  });
});

describe("unmeasuredHeadline", () => {
  it("names bot protection for a blocked scan and reachability for a failure", () => {
    expect(unmeasuredHeadline("blocked")).toMatch(/blocks automated scanners/i);
    expect(unmeasuredHeadline("failed")).toMatch(/couldn't reach/i);
  });

  it("never implies a score or an issue count", () => {
    for (const outcome of ["blocked", "failed"] as const) {
      expect(unmeasuredHeadline(outcome)).not.toMatch(/\d+\s*\/\s*100|0 issues|no violations/i);
    }
  });
});

/**
 * Regression for the 2026-09-08 defect: two large Shopify storefronts returned
 * HTTP 200 and we published scores derived from a TRUNCATED body — Allbirds
 * 33/100 with 66 issues, when the complete page has 2 images, none missing alt.
 * The same URL returned 6,924 bytes once and 671,217 minutes later. A cut-off
 * document reads as a catastrophically broken one, so the bad number looks
 * entirely plausible. A 403 announces itself; this does not.
 */
describe("isUnusableHtml", () => {
  it("accepts a complete document, however small", () => {
    // Size is not the test. This page is tiny and entirely legitimate.
    expect(
      isUnusableHtml("<html lang='en'><body><h1>Hi</h1></body></html>"),
    ).toBe(false);
  });

  it("rejects a document that opened <html> and never closed it", () => {
    const truncated =
      "<!doctype html><html lang='en'><head><title>Shop</title></head><body>" +
      "<img src='a.png'>".repeat(200);
    expect(truncated.length).toBeGreaterThan(3000);
    expect(isUnusableHtml(truncated)).toBe(true);
  });

  it("rejects a body-less fragment", () => {
    expect(isUnusableHtml("<html><head><title>x</title></head>")).toBe(true);
  });

  it.each([
    "Just a moment...",
    "Checking your browser before accessing",
    "Please enable JavaScript and cookies to continue",
    "captcha-delivery.com",
  ])("rejects a complete but interstitial page carrying %j", (marker) => {
    expect(isUnusableHtml(`<html><body>${marker}</body></html>`)).toBe(true);
  });

  it("does not reject a real page that merely mentions javascript", () => {
    expect(
      isUnusableHtml(
        "<html lang='en'><body><h1>Docs</h1><p>Our javascript SDK is here.</p></body></html>",
      ),
    ).toBe(false);
  });
});
