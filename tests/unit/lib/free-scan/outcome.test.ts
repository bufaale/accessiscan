import { describe, it, expect } from "vitest";
import {
  BLOCKING_HTTP_STATUSES,
  deriveScanOutcome,
  displayHealthScore,
  isBlockingHttpStatus,
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
