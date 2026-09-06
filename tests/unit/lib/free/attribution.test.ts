import { describe, it, expect } from "vitest";
import { parseAttribution } from "@/lib/free/attribution";
import { countBySeverity } from "@/lib/free/funnel-events";

describe("parseAttribution", () => {
  it("keeps the three UTM fields and nothing else", () => {
    const parsed = parseAttribution({
      url: "https://example.gov",
      email: "someone@example.gov",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "wcag_scan_test",
      gclid: "abc123",
    });
    expect(parsed).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "wcag_scan_test",
    });
  });

  it("trims whitespace", () => {
    expect(parseAttribution({ utm_source: "  reddit  " })).toEqual({ utm_source: "reddit" });
  });

  it("drops empty strings — ?utm_source= means absent, not a blank campaign", () => {
    expect(parseAttribution({ utm_source: "", utm_medium: "   " })).toEqual({});
  });

  // The whole point: attribution must never be able to break the scanner.
  it("drops a single oversized field without discarding the valid ones", () => {
    const parsed = parseAttribution({
      utm_source: "x".repeat(500),
      utm_campaign: "wcag_scan_test",
    });
    expect(parsed.utm_source).toBeUndefined();
    expect(parsed.utm_campaign).toBe("wcag_scan_test");
  });

  it("drops non-string values instead of throwing", () => {
    expect(parseAttribution({ utm_source: 42, utm_medium: null, utm_campaign: { a: 1 } })).toEqual({});
  });

  it("returns {} for anything that isn't an object", () => {
    for (const input of [null, undefined, "utm_source=google", 7, []]) {
      expect(parseAttribution(input)).toEqual({});
    }
  });
});

describe("countBySeverity", () => {
  it("sums occurrences, not issue rows", () => {
    const issues = [
      { severity: "critical", count: 12 },
      { severity: "critical", count: 3 },
      { severity: "serious", count: 5 },
    ];
    expect(countBySeverity(issues, "critical")).toBe(15);
    expect(countBySeverity(issues, "serious")).toBe(5);
    expect(countBySeverity(issues, "moderate")).toBe(0);
  });

  it("survives a blocked scan's empty / missing issue list", () => {
    expect(countBySeverity([], "critical")).toBe(0);
    expect(countBySeverity(null, "critical")).toBe(0);
    expect(countBySeverity(undefined, "critical")).toBe(0);
  });

  it("treats a missing count as zero rather than NaN", () => {
    expect(countBySeverity([{ severity: "critical" }], "critical")).toBe(0);
  });
});
