import { describe, it, expect, afterEach } from "vitest";
import {
  analyzeHtml,
  computeHealthScore,
  scanUrlLite,
  type WcagFreeIssue,
} from "@/lib/free-scan/lite-scanner";

describe("analyzeHtml", () => {
  it("returns no issues for a perfectly accessible minimal page", () => {
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hi</title>
</head>
<body>
<h1>Welcome</h1>
<h2>Section</h2>
<p>Some text.</p>
</body>
</html>`;
    const issues = analyzeHtml(html);
    expect(issues).toEqual([]);
  });

  it("detects images without alt attribute (critical)", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>X</h1>
<img src="hero.png">
<img src="other.jpg">
</body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "Images without alt attribute");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
    expect(hit!.count).toBe(2);
    expect(hit!.example).toContain("img");
  });

  it("does NOT flag images that already have alt", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>X</h1>
<img src="a.png" alt="A logo">
<img alt="" src="decor.png">
</body></html>`;
    const issues = analyzeHtml(html);
    expect(issues.find((i) => i.rule === "Images without alt attribute")).toBeUndefined();
  });

  it("flags orphan inputs with no label, aria-label, or aria-labelledby", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>X</h1>
<input type="text" name="orphan">
<input type="email" name="email2" aria-label="Email">
<input type="text" id="x">
<label for="x">X</label>
<input type="hidden" name="csrf">
<input type="submit">
</body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "Form inputs without label");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("critical");
    // Only the first orphan should count.
    expect(hit!.count).toBe(1);
  });

  it("flags missing <html lang>", () => {
    const html = `<html><head><meta name="viewport" content="x"></head><body><h1>X</h1></body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule.includes("lang"));
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("serious");
    expect(hit!.count).toBe(1);
  });

  it("flags missing viewport meta tag (moderate)", () => {
    const html = `<html lang="en"><head></head><body><h1>X</h1></body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "Missing viewport meta tag");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("moderate");
  });

  it("flags missing <h1>", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h2>Sub-only</h2>
<p>text</p>
</body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "No <h1> heading on page");
    expect(hit).toBeDefined();
    expect(hit!.severity).toBe("serious");
  });

  it("flags multiple <h1> headings", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>One</h1>
<h1>Two</h1>
<h1>Three</h1>
</body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "Multiple <h1> headings on page");
    expect(hit).toBeDefined();
    expect(hit!.count).toBe(3);
    expect(hit!.severity).toBe("moderate");
  });

  it("flags heading-level skips (h1 -> h3)", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>H1</h1>
<h3>H3 (skipped h2)</h3>
<h5>H5 (skipped h4)</h5>
</body></html>`;
    const issues = analyzeHtml(html);
    const hit = issues.find((i) => i.rule === "Heading-level skips");
    expect(hit).toBeDefined();
    expect(hit!.count).toBe(2);
  });

  it("does NOT flag well-formed heading order h1 -> h2 -> h3", () => {
    const html = `<html lang="en"><head><meta name="viewport" content="x"></head><body>
<h1>H1</h1>
<h2>H2</h2>
<h3>H3</h3>
<h2>Back up to h2</h2>
<h3>And down again</h3>
</body></html>`;
    const issues = analyzeHtml(html);
    // No upward skips at all — going down (h3 -> h2) is fine.
    expect(issues.find((i) => i.rule === "Heading-level skips")).toBeUndefined();
  });
});

describe("computeHealthScore", () => {
  it("returns 100 for empty issues array", () => {
    expect(computeHealthScore([])).toBe(100);
  });

  it("decrements score by ~8 for one critical issue with count=1", () => {
    const issues: WcagFreeIssue[] = [
      {
        rule: "x",
        severity: "critical",
        count: 1,
        wcag_ref: "x",
        fix_hint: "x",
      },
    ];
    // weight 8 * log2(2) = 8 * 1 = 8. Score = 100 - 8 = 92.
    expect(computeHealthScore(issues)).toBe(92);
  });

  it("caps each issue's penalty at 30 points", () => {
    const issues: WcagFreeIssue[] = [
      {
        rule: "many",
        severity: "critical",
        count: 1_000_000,
        wcag_ref: "x",
        fix_hint: "x",
      },
    ];
    expect(computeHealthScore(issues)).toBe(70);
  });

  it("never goes below 0", () => {
    const issues: WcagFreeIssue[] = Array.from({ length: 10 }, () => ({
      rule: "x",
      severity: "critical" as const,
      count: 1_000_000,
      wcag_ref: "x",
      fix_hint: "x",
    }));
    expect(computeHealthScore(issues)).toBe(0);
  });

  it("weights moderate < serious < critical", () => {
    const moderate: WcagFreeIssue[] = [
      { rule: "x", severity: "moderate", count: 1, wcag_ref: "x", fix_hint: "x" },
    ];
    const serious: WcagFreeIssue[] = [
      { rule: "x", severity: "serious", count: 1, wcag_ref: "x", fix_hint: "x" },
    ];
    const critical: WcagFreeIssue[] = [
      { rule: "x", severity: "critical", count: 1, wcag_ref: "x", fix_hint: "x" },
    ];
    expect(computeHealthScore(moderate)).toBeGreaterThan(computeHealthScore(serious));
    expect(computeHealthScore(serious)).toBeGreaterThan(computeHealthScore(critical));
  });
});

describe("scanUrlLite — what happens when we never get the page", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  function respondWith(status: number, body = ""): void {
    globalThis.fetch = (async () =>
      new Response(body, { status })) as unknown as typeof globalThis.fetch;
  }

  it("reports a 403 as BLOCKED with no score and no issues (never 0/100)", async () => {
    respondWith(403, "Forbidden");
    const report = await scanUrlLite("https://example.gov/");

    expect(report.outcome).toBe("blocked");
    expect(report.fetched_status).toBe(403);
    expect(report.health_score).toBeNull();
    expect(report.issues).toEqual([]);
    expect(report.total_issue_count).toBe(0);
    expect(report.error).toContain("403");
  });

  it("reports 401 and 429 as blocked too", async () => {
    for (const status of [401, 429]) {
      respondWith(status);
      const report = await scanUrlLite("https://example.gov/");
      expect(report.outcome).toBe("blocked");
      expect(report.health_score).toBeNull();
    }
  });

  it("reports a 404 as FAILED, not blocked", async () => {
    respondWith(404);
    const report = await scanUrlLite("https://example.gov/missing");
    expect(report.outcome).toBe("failed");
    expect(report.health_score).toBeNull();
  });

  it("reports a thrown fetch (DNS / timeout) as failed with the real reason", async () => {
    globalThis.fetch = (async () => {
      throw new Error("getaddrinfo ENOTFOUND www.notarealdomain.gov");
    }) as unknown as typeof globalThis.fetch;

    const report = await scanUrlLite("https://www.notarealdomain.gov/");
    expect(report.outcome).toBe("failed");
    expect(report.health_score).toBeNull();
    expect(report.error).toContain("ENOTFOUND");
  });

  it("still scores a page it actually reads", async () => {
    respondWith(
      200,
      `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width">` +
        `<title>Hi</title></head><body><a href="#main">Skip</a><h1>Hi</h1><img src="a.png"></body></html>`,
    );
    const report = await scanUrlLite("https://example.gov/");
    expect(report.outcome).toBe("ok");
    expect(typeof report.health_score).toBe("number");
    expect(report.health_score).toBeLessThan(100);
    expect(report.issues.length).toBeGreaterThan(0);
  });
});
