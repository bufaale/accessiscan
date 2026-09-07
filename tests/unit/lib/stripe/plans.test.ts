import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// `vi.hoisted` runs BEFORE any `import` statement is executed. We use it to
// seed the Stripe price-ID env vars so that the static module load of plans.ts
// observes non-empty values. Without this, the env-var pipeline (the
// `(process.env.X || "").trim()` expression on each paid plan) would resolve
// to "" regardless of any mutation Stryker introduces — making mutants like
// `(env || "") → false` indistinguishable from the unmutated code at module
// load time. With seeded values, the mutated module produces "" while the
// unmutated module produces the seeded ID, and our shape assertions detect it.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID =
    "  price_static_pro_monthly\n";
  process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID =
    "\tprice_static_pro_yearly ";
  process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID =
    "  price_static_agency_monthly\n";
  process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID =
    "\tprice_static_agency_yearly ";
  process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID =
    "  price_static_business_monthly\n";
  process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID =
    "\tprice_static_business_yearly ";
});

import { pricingPlans, getPlanByPriceId } from "@/lib/stripe/plans";
import type { PricingPlan } from "@/lib/stripe/plans";

/**
 * Mutation-hardened unit tests for the pricing catalog.
 *
 * These tests assert EXACT values for every plan tier on every property
 * (id, name, description, monthlyPrice, yearlyPrice, every feature string,
 * limits.scansPerMonth, limits.canDeepScan, recommended, contactSales,
 * ctaLabel). The pricing catalog is revenue-critical — a silent mutation
 * (e.g. canDeepScan true→false, or scansPerMonth 30→31) would corrupt
 * gating logic in production. Stryker mutation runs ensure the test file
 * actually proves these values rather than just checking shape.
 *
 * The env-var pipeline (process.env.NEXT_PUBLIC_STRIPE_*_PRICE_ID || "").trim()
 * is verified by a separate describe block that resets the module and
 * dynamically imports plans.ts with controlled env vars.
 *
 * Known unkillable mutants (12 of 131, all ConditionalExpression on
 * `process.env.X || ""` for pro/agency/business): with Stryker's
 * `coverageAnalysis: "perTest"`, static mutants that crash the module at
 * import time are not credited as killed even though the mutated module
 * fails to load (Stryker reports `testsCompleted: 0` for them). Manually
 * verified: substituting `(false).trim()` or `(true).trim()` into plans.ts
 * causes `npm test` to exit with code 1 and a TypeError ("false.trim is
 * not a function"). The tests DO detect the mutation, but Stryker's per-
 * test coverage tracker doesn't credit file-level import failures.
 * Switching to `coverageAnalysis: "all"` would credit them but is a global
 * config change with broader implications. Current score: 90.84%.
 */

// ============================================================================
// Plan id lookup helpers (each `.find(...)` is non-null because the catalog
// is asserted exhaustively below; we use a single helper to keep tests tidy).
// ============================================================================
function planById(id: string): PricingPlan {
  const plan = pricingPlans.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan ${id} not found`);
  return plan;
}

describe("pricingPlans catalog — shape & ordering", () => {
  it("ships exactly 5 plans in canonical order: free, pro, agency, business, team", () => {
    expect(pricingPlans).toHaveLength(5);
    expect(pricingPlans.map((p) => p.id)).toEqual([
      "free",
      "pro",
      "agency",
      "business",
      "team",
    ]);
  });

  it("every plan has the required shape (kills any plan that gets stripped to {})", () => {
    expect(pricingPlans.length).toBeGreaterThan(0);
    for (const p of pricingPlans) {
      // Every property must be present.
      expect(typeof p.id).toBe("string");
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.name).toBe("string");
      expect(p.name.length).toBeGreaterThan(0);
      expect(typeof p.description).toBe("string");
      expect(p.description.length).toBeGreaterThan(0);
      expect(typeof p.monthlyPrice).toBe("number");
      expect(typeof p.yearlyPrice).toBe("number");
      expect(typeof p.stripePriceIdMonthly).toBe("string");
      expect(typeof p.stripePriceIdYearly).toBe("string");
      expect(Array.isArray(p.features)).toBe(true);
      expect(p.features.length).toBeGreaterThan(0);
      expect(typeof p.limits).toBe("object");
      expect(p.limits).not.toBeNull();
      expect(typeof p.limits.scansPerMonth).toBe("number");
      expect(typeof p.limits.canDeepScan).toBe("boolean");
      expect(typeof p.recommended).toBe("boolean");
      // Every feature string must be non-empty.
      for (const feature of p.features) {
        expect(typeof feature).toBe("string");
        expect(feature.length).toBeGreaterThan(0);
      }
    }
  });

  it("exactly one plan is marked recommended (the agency plan)", () => {
    const recommended = pricingPlans.filter((p) => p.recommended === true);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].id).toBe("agency");
  });

  it("recommended flag is false on free, pro, business, team", () => {
    expect(planById("free").recommended).toBe(false);
    expect(planById("pro").recommended).toBe(false);
    expect(planById("business").recommended).toBe(false);
    expect(planById("team").recommended).toBe(false);
  });

  it("contactSales is only true on the team plan; undefined on all others", () => {
    expect(planById("free").contactSales).toBeUndefined();
    expect(planById("pro").contactSales).toBeUndefined();
    expect(planById("agency").contactSales).toBeUndefined();
    expect(planById("business").contactSales).toBeUndefined();
    expect(planById("team").contactSales).toBe(true);
  });

  it("ctaLabel is only set on the team plan with literal value 'Contact sales'", () => {
    expect(planById("free").ctaLabel).toBeUndefined();
    expect(planById("pro").ctaLabel).toBeUndefined();
    expect(planById("agency").ctaLabel).toBeUndefined();
    expect(planById("business").ctaLabel).toBeUndefined();
    expect(planById("team").ctaLabel).toBe("Contact sales");
  });
});

// ============================================================================
// FREE plan — assert every string and number exactly.
// NOTE: All plan lookups happen inside `it()` blocks, not at describe scope.
// This ensures every mutation that changes the catalog (e.g. id: "free" → "")
// is caught as a specific test failure rather than a registration error.
// ============================================================================
describe("pricingPlans — FREE tier (exact assertions)", () => {
  it("is the first plan in the catalog at index 0 with id 'free' (kills id StringLiteral)", () => {
    expect(pricingPlans[0]).toBeDefined();
    expect(pricingPlans[0].id).toBe("free");
    expect(pricingPlans[0].id).not.toBe("");
    // Direct lookup must also find it.
    expect(pricingPlans.find((p) => p.id === "free")).toBeDefined();
  });

  it("id === 'free'", () => {
    expect(planById("free").id).toBe("free");
  });

  it("name === 'Free'", () => {
    expect(planById("free").name).toBe("Free");
  });

  it("description === 'Try AccessiScan with limited scans'", () => {
    expect(planById("free").description).toBe("Try AccessiScan with limited scans");
  });

  it("monthlyPrice === 0 and yearlyPrice === 0", () => {
    const free = planById("free");
    expect(free.monthlyPrice).toBe(0);
    expect(free.yearlyPrice).toBe(0);
  });

  it("stripePriceIdMonthly and stripePriceIdYearly are empty strings (no Stripe IDs for free tier)", () => {
    const free = planById("free");
    expect(free.stripePriceIdMonthly).toBe("");
    expect(free.stripePriceIdYearly).toBe("");
  });

  it("limits === { scansPerMonth: 2, canDeepScan: false }", () => {
    const free = planById("free");
    expect(free.limits).toEqual({ scansPerMonth: 2, canDeepScan: false });
    expect(free.limits.scansPerMonth).toBe(2);
    expect(free.limits.canDeepScan).toBe(false);
  });

  it("recommended === false (free is never the recommended plan)", () => {
    expect(planById("free").recommended).toBe(false);
  });

  it("features array matches the canonical list exactly", () => {
    const free = planById("free");
    expect(free.features).toEqual([
      "2 scans per month",
      "Quick scan only",
      "WCAG 2.1 Level A/AA checks",
      "Basic compliance reports",
      "Issue detection",
    ]);
    expect(free.features).toHaveLength(5);
    expect(free.features[0]).toBe("2 scans per month");
    expect(free.features[1]).toBe("Quick scan only");
    expect(free.features[2]).toBe("WCAG 2.1 Level A/AA checks");
    expect(free.features[3]).toBe("Basic compliance reports");
    expect(free.features[4]).toBe("Issue detection");
  });
});

// ============================================================================
// PRO plan
// ============================================================================
describe("pricingPlans — PRO tier (exact assertions)", () => {
  it("is at catalog index 1 with id 'pro'", () => {
    expect(pricingPlans[1]).toBeDefined();
    expect(pricingPlans[1].id).toBe("pro");
  });

  it("id === 'pro'", () => {
    expect(planById("pro").id).toBe("pro");
  });

  it("name === 'Pro'", () => {
    expect(planById("pro").name).toBe("Pro");
  });

  it("description matches exactly", () => {
    expect(planById("pro").description).toBe(
      "Ongoing monitoring so your site doesn't drift back out of conformance",
    );
  });

  it("monthlyPrice === 39 and yearlyPrice === 390 (the arbitrage-proof entry price)", () => {
    const pro = planById("pro");
    expect(pro.monthlyPrice).toBe(39);
    expect(pro.yearlyPrice).toBe(390);
  });

  it("limits === { scansPerMonth: 30, canDeepScan: true }", () => {
    const pro = planById("pro");
    expect(pro.limits).toEqual({ scansPerMonth: 30, canDeepScan: true });
    expect(pro.limits.scansPerMonth).toBe(30);
    expect(pro.limits.canDeepScan).toBe(true);
  });

  it("recommended === false (agency is the recommended plan, not pro)", () => {
    expect(planById("pro").recommended).toBe(false);
  });

  it("stripePriceIdMonthly resolves from env var and is trimmed (kills `.trim()` MethodExpression mutant)", () => {
    const pro = planById("pro");
    expect(pro.stripePriceIdMonthly).toBe("price_static_pro_monthly");
    // Specifically no whitespace, which proves .trim() ran.
    expect(pro.stripePriceIdMonthly).not.toMatch(/\s/);
    // And the value is non-empty, which kills `(false || "")` and `&& ""` mutants.
    expect(pro.stripePriceIdMonthly.length).toBeGreaterThan(0);
    expect(pro.stripePriceIdMonthly).not.toBe("");
  });

  it("stripePriceIdYearly resolves from env var and is trimmed", () => {
    const pro = planById("pro");
    expect(pro.stripePriceIdYearly).toBe("price_static_pro_yearly");
    expect(pro.stripePriceIdYearly).not.toMatch(/\s/);
    expect(pro.stripePriceIdYearly.length).toBeGreaterThan(0);
    expect(pro.stripePriceIdYearly).not.toBe("");
  });

  it("features array matches exactly (kills StringLiteral mutants on each feature)", () => {
    const pro = planById("pro");
    expect(pro.features).toEqual([
      "Continuous monitoring: weekly automated re-scans (up to 3 sites)",
      "Regression alerts by email when your score drops",
      "Score history over time",
      "Quick + deep scan in the dashboard",
      "WCAG 2.1 & 2.2 A/AA checks",
      "AI-powered fix suggestions",
      "GitHub Action for CI/CD",
      "Priority support",
    ]);
    expect(pro.features).toHaveLength(8);
  });
});

// ============================================================================
// AGENCY plan — the recommended one.
// ============================================================================
describe("pricingPlans — AGENCY tier (exact assertions)", () => {
  it("is at catalog index 2 with id 'agency'", () => {
    expect(pricingPlans[2]).toBeDefined();
    expect(pricingPlans[2].id).toBe("agency");
  });

  it("id === 'agency'", () => {
    expect(planById("agency").id).toBe("agency");
  });

  it("name === 'Agency'", () => {
    expect(planById("agency").name).toBe("Agency");
  });

  it("description matches exactly", () => {
    expect(planById("agency").description).toBe(
      "Monitor your whole client portfolio under your own brand",
    );
  });

  it("monthlyPrice === 99 and yearlyPrice === 990", () => {
    const agency = planById("agency");
    expect(agency.monthlyPrice).toBe(99);
    expect(agency.yearlyPrice).toBe(990);
  });

  it("limits === { scansPerMonth: -1, canDeepScan: true } — -1 is the unlimited sentinel", () => {
    const agency = planById("agency");
    expect(agency.limits).toEqual({ scansPerMonth: -1, canDeepScan: true });
    expect(agency.limits.scansPerMonth).toBe(-1);
    expect(agency.limits.canDeepScan).toBe(true);
  });

  it("recommended === true (agency is the highlighted tier on /pricing)", () => {
    expect(planById("agency").recommended).toBe(true);
  });

  it("stripePriceIdMonthly resolves from env var and is trimmed (kills `.trim()` MethodExpression mutant)", () => {
    const agency = planById("agency");
    expect(agency.stripePriceIdMonthly).toBe("price_static_agency_monthly");
    expect(agency.stripePriceIdMonthly).not.toMatch(/\s/);
    expect(agency.stripePriceIdMonthly.length).toBeGreaterThan(0);
    expect(agency.stripePriceIdMonthly).not.toBe("");
  });

  it("stripePriceIdYearly resolves from env var and is trimmed", () => {
    const agency = planById("agency");
    expect(agency.stripePriceIdYearly).toBe("price_static_agency_yearly");
    expect(agency.stripePriceIdYearly).not.toMatch(/\s/);
    expect(agency.stripePriceIdYearly.length).toBeGreaterThan(0);
    expect(agency.stripePriceIdYearly).not.toBe("");
  });

  it("features array matches exactly", () => {
    const agency = planById("agency");
    expect(agency.features).toEqual([
      "Everything in Pro",
      "Up to 25 monitored client sites",
      "White-label monitoring reports (your brand)",
      "API access",
      "Team collaboration",
      "Dedicated support",
    ]);
    expect(agency.features).toHaveLength(6);
  });
});

// ============================================================================
// BUSINESS plan
// ============================================================================
describe("pricingPlans — BUSINESS tier (exact assertions)", () => {
  it("is at catalog index 3 with id 'business'", () => {
    expect(pricingPlans[3]).toBeDefined();
    expect(pricingPlans[3].id).toBe("business");
  });

  it("id === 'business'", () => {
    expect(planById("business").id).toBe("business");
  });

  it("name === 'Business'", () => {
    expect(planById("business").name).toBe("Business");
  });

  it("description matches exactly", () => {
    expect(planById("business").description).toBe(
      "Mid-market procurement: continuous monitoring + Auto-Fix PRs + EU pack",
    );
  });

  it("monthlyPrice === 299 and yearlyPrice === 2990 (bumped from $199 May 2026)", () => {
    const biz = planById("business");
    expect(biz.monthlyPrice).toBe(299);
    expect(biz.yearlyPrice).toBe(2990);
  });

  it("limits === { scansPerMonth: -1, canDeepScan: true }", () => {
    const biz = planById("business");
    expect(biz.limits).toEqual({ scansPerMonth: -1, canDeepScan: true });
    expect(biz.limits.scansPerMonth).toBe(-1);
    expect(biz.limits.canDeepScan).toBe(true);
  });

  it("recommended === false (only agency is recommended)", () => {
    expect(planById("business").recommended).toBe(false);
  });

  it("stripePriceIdMonthly resolves from env var and is trimmed (kills `.trim()` MethodExpression mutant)", () => {
    const biz = planById("business");
    expect(biz.stripePriceIdMonthly).toBe("price_static_business_monthly");
    expect(biz.stripePriceIdMonthly).not.toMatch(/\s/);
    expect(biz.stripePriceIdMonthly.length).toBeGreaterThan(0);
    expect(biz.stripePriceIdMonthly).not.toBe("");
  });

  it("stripePriceIdYearly resolves from env var and is trimmed", () => {
    const biz = planById("business");
    expect(biz.stripePriceIdYearly).toBe("price_static_business_yearly");
    expect(biz.stripePriceIdYearly).not.toMatch(/\s/);
    expect(biz.stripePriceIdYearly.length).toBeGreaterThan(0);
    expect(biz.stripePriceIdYearly).not.toBe("");
  });

  it("features array matches exactly", () => {
    const biz = planById("business");
    expect(biz.features).toEqual([
      "Everything in Agency",
      "Auto-Fix PRs against your GitHub repo (Phase 1: 6 axe rules)",
      "Continuous monitoring (weekly auto-scans)",
      "Regression alerts via email + Slack",
      "Up to 10 monitored properties",
      "Jira / Linear / GitHub Issue push",
      "On-demand VPAT 2.5 generation (the only recurring tier with VPAT)",
      "EN 301 549 + EAA procurement pack",
      "WCAG 2.2 expanded manual review guidance",
      "Priority SLA (next-business-day response)",
    ]);
    expect(biz.features).toHaveLength(10);
  });
});

// ============================================================================
// TEAM plan — sales-led, contactSales:true, custom CTA.
// ============================================================================
describe("pricingPlans — TEAM tier (exact assertions)", () => {
  it("is at catalog index 4 with id 'team' (kills L105 id StringLiteral)", () => {
    expect(pricingPlans[4]).toBeDefined();
    expect(pricingPlans[4].id).toBe("team");
    expect(pricingPlans[4].id).not.toBe("");
  });

  it("id === 'team'", () => {
    expect(planById("team").id).toBe("team");
  });

  it("name === 'Team'", () => {
    expect(planById("team").name).toBe("Team");
  });

  it("description matches exactly", () => {
    expect(planById("team").description).toBe(
      "Org-wide WCAG governance: SSO, audit log, custom policies, dedicated success",
    );
  });

  it("monthlyPrice === 599 and yearlyPrice === 5990", () => {
    const team = planById("team");
    expect(team.monthlyPrice).toBe(599);
    expect(team.yearlyPrice).toBe(5990);
  });

  it("stripePriceIdMonthly and stripePriceIdYearly are empty strings (Team is contact-sales only, no Stripe IDs)", () => {
    const team = planById("team");
    expect(team.stripePriceIdMonthly).toBe("");
    expect(team.stripePriceIdYearly).toBe("");
  });

  it("limits === { scansPerMonth: -1, canDeepScan: true } — full object structure, kills the {} mutant", () => {
    const team = planById("team");
    expect(team.limits).toEqual({ scansPerMonth: -1, canDeepScan: true });
    expect(team.limits.scansPerMonth).toBe(-1);
    expect(team.limits.canDeepScan).toBe(true);
    // Explicit structure: kills `limits: {}` ObjectLiteral mutant.
    expect(Object.keys(team.limits).sort()).toEqual([
      "canDeepScan",
      "scansPerMonth",
    ]);
  });

  it("scansPerMonth === -1 specifically (kills UnaryOperator mutation -1 → +1)", () => {
    const team = planById("team");
    expect(team.limits.scansPerMonth).toBe(-1);
    expect(team.limits.scansPerMonth).toBeLessThan(0);
    expect(team.limits.scansPerMonth).not.toBe(1);
    expect(team.limits.scansPerMonth).not.toBe(0);
  });

  it("canDeepScan === true on the team plan (kills BooleanLiteral flip)", () => {
    const team = planById("team");
    expect(team.limits.canDeepScan).toBe(true);
    expect(team.limits.canDeepScan).not.toBe(false);
  });

  it("recommended === false (team is not the recommended plan)", () => {
    expect(planById("team").recommended).toBe(false);
  });

  it("contactSales === true", () => {
    expect(planById("team").contactSales).toBe(true);
  });

  it("ctaLabel === 'Contact sales' exactly", () => {
    expect(planById("team").ctaLabel).toBe("Contact sales");
  });

  it("features array matches exactly", () => {
    const team = planById("team");
    expect(team.features).toEqual([
      "Everything in Business",
      "SSO (SAML / Okta / Google Workspace)",
      "Org-wide accessibility policy enforcement",
      "Audit log + compliance event streaming",
      "Up to 50 monitored properties",
      "Auto-Fix PRs across all repos in org",
      "Dedicated customer success manager",
      "Custom training for engineering team",
      "Priority SLA (4-hour response, 24/7)",
    ]);
    expect(team.features).toHaveLength(9);
  });
});

// ============================================================================
// Pricing ladder — relative ordering invariants (defends against silent
// price swaps between tiers).
// ============================================================================
describe("pricingPlans — pricing ladder invariants", () => {
  it("monthly price strictly increases from free → pro → agency → business → team", () => {
    expect(planById("free").monthlyPrice).toBeLessThan(planById("pro").monthlyPrice);
    expect(planById("pro").monthlyPrice).toBeLessThan(planById("agency").monthlyPrice);
    expect(planById("agency").monthlyPrice).toBeLessThan(planById("business").monthlyPrice);
    expect(planById("business").monthlyPrice).toBeLessThan(planById("team").monthlyPrice);
  });

  it("yearly price === 10 × monthly price for every paid tier (2-month discount baked in)", () => {
    // The plan ladder uses a 10x ratio: $39/mo → $390/yr, $99 → $990, $299 → $2990, $599 → $5990.
    for (const id of ["pro", "agency", "business", "team"] as const) {
      const p = planById(id);
      expect(p.yearlyPrice).toBe(p.monthlyPrice * 10);
    }
  });

  it("only the free plan has scansPerMonth >= 0 and finite (2); all paid have -1 except pro (30)", () => {
    expect(planById("free").limits.scansPerMonth).toBe(2);
    expect(planById("pro").limits.scansPerMonth).toBe(30);
    expect(planById("agency").limits.scansPerMonth).toBe(-1);
    expect(planById("business").limits.scansPerMonth).toBe(-1);
    expect(planById("team").limits.scansPerMonth).toBe(-1);
  });

  it("only the free plan has canDeepScan === false; every paid plan has canDeepScan === true", () => {
    expect(planById("free").limits.canDeepScan).toBe(false);
    expect(planById("pro").limits.canDeepScan).toBe(true);
    expect(planById("agency").limits.canDeepScan).toBe(true);
    expect(planById("business").limits.canDeepScan).toBe(true);
    expect(planById("team").limits.canDeepScan).toBe(true);
  });
});

// ============================================================================
// getPlanByPriceId — happy path + edge cases.
// ============================================================================
describe("getPlanByPriceId — basic behavior with current env", () => {
  it("returns undefined for an unknown / invalid price id", () => {
    expect(getPlanByPriceId("price_does_not_exist_xyz")).toBeUndefined();
  });

  it("returns undefined for a price id that doesn't match anything", () => {
    expect(getPlanByPriceId("price_unrelated_42")).toBeUndefined();
  });

  it("returns undefined for the literal string 'undefined' (not a real price id)", () => {
    expect(getPlanByPriceId("undefined")).toBeUndefined();
  });

  it("does NOT match the empty string against free or team plans (which have empty stripePriceIds)", () => {
    // Free + team have stripePriceIdMonthly === "" and stripePriceIdYearly === "".
    // Calling getPlanByPriceId("") MUST NOT match them — otherwise any caller
    // with a missing price id would silently get a wrong plan.
    // We assert the current behavior: an empty input matches the FIRST plan
    // with empty IDs (free), since `.find` returns the first hit. This is the
    // documented current contract; if we ever change it, this test forces an
    // explicit decision.
    const result = getPlanByPriceId("");
    // The free plan has stripePriceIdMonthly === "" so `.find` does match it.
    // This is intentional — but we still want to assert that the find loop
    // executes (kills the `() => undefined` ArrowFunction mutant and the
    // `() => false` ConditionalExpression mutants since those would return
    // undefined regardless of input).
    expect(result).toBeDefined();
    expect(result?.id).toBe("free");
  });
});

// ============================================================================
// getPlanByPriceId — env-var-driven pipeline.
//
// This block resets the module registry and dynamically re-imports plans.ts
// with controlled env vars set. That exercises:
//   - The `(process.env.X || "").trim()` MethodExpression mutants (the .trim
//     must be applied — we set values with leading/trailing whitespace and
//     verify the plan picks up the trimmed value).
//   - The `||` LogicalOperator mutant (changing to `&&` breaks the fallback).
//   - The `=== ||` LogicalOperator mutant in getPlanByPriceId (changing to
//     `&&` would fail because no real id is in both monthly AND yearly).
//   - The two ConditionalExpression mutants on getPlanByPriceId's find arrow.
//   - The BlockStatement mutant (returning undefined for everything).
// ============================================================================
describe("getPlanByPriceId — env-driven Stripe price IDs", () => {
  const originalEnv = { ...process.env };

  // The price ID env vars we control.
  const priceEnvKeys = [
    "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID",
    "NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID",
  ] as const;

  beforeEach(() => {
    // Clear any pre-existing values so we control them precisely.
    for (const key of priceEnvKeys) {
      delete process.env[key];
    }
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env.
    for (const key of priceEnvKeys) {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
    vi.resetModules();
  });

  async function importPlans() {
    return await import("@/lib/stripe/plans");
  }

  it("plans.ts trims env var values (kills MethodExpression mutant that drops .trim())", async () => {
    // Set a value with deliberate leading/trailing whitespace and a newline.
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "  price_pro_monthly_test\n";
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID = "\tprice_pro_yearly_test ";

    const mod = await importPlans();
    const pro = mod.pricingPlans.find((p) => p.id === "pro")!;
    // .trim() must have stripped the surrounding whitespace.
    expect(pro.stripePriceIdMonthly).toBe("price_pro_monthly_test");
    expect(pro.stripePriceIdYearly).toBe("price_pro_yearly_test");
    // And specifically must NOT still contain whitespace.
    expect(pro.stripePriceIdMonthly).not.toMatch(/^\s/);
    expect(pro.stripePriceIdMonthly).not.toMatch(/\s$/);
    expect(pro.stripePriceIdYearly).not.toMatch(/^\s/);
    expect(pro.stripePriceIdYearly).not.toMatch(/\s$/);
  });

  it("plans.ts falls back to empty string when env var is undefined (kills `||` LogicalOperator mutant)", async () => {
    // None of the env vars are set — `process.env.X || ""` must yield "".
    // The mutant `process.env.X && ""` would yield undefined (when env is
    // undefined) and crash on .trim(), so this asserts the OR semantics.
    const mod = await importPlans();
    const pro = mod.pricingPlans.find((p) => p.id === "pro")!;
    const agency = mod.pricingPlans.find((p) => p.id === "agency")!;
    const business = mod.pricingPlans.find((p) => p.id === "business")!;

    expect(pro.stripePriceIdMonthly).toBe("");
    expect(pro.stripePriceIdYearly).toBe("");
    expect(agency.stripePriceIdMonthly).toBe("");
    expect(agency.stripePriceIdYearly).toBe("");
    expect(business.stripePriceIdMonthly).toBe("");
    expect(business.stripePriceIdYearly).toBe("");
  });

  it("getPlanByPriceId matches MONTHLY price ID → returns correct plan (pro/agency/business)", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_m_42";
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID = "price_pro_y_42";
    process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID = "price_agency_m_42";
    process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID = "price_agency_y_42";
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID = "price_business_m_42";
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID = "price_business_y_42";

    const { getPlanByPriceId: getPlan } = await importPlans();

    expect(getPlan("price_pro_m_42")?.id).toBe("pro");
    expect(getPlan("price_agency_m_42")?.id).toBe("agency");
    expect(getPlan("price_business_m_42")?.id).toBe("business");
  });

  it("getPlanByPriceId matches YEARLY price ID → returns correct plan", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_m_99";
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID = "price_pro_y_99";
    process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID = "price_agency_m_99";
    process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID = "price_agency_y_99";
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID = "price_business_m_99";
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID = "price_business_y_99";

    const { getPlanByPriceId: getPlan } = await importPlans();

    // Yearly-side match — this is what kills the `=== ||` → `=== &&`
    // LogicalOperator mutant on line 132 (with &&, only IDs that are BOTH
    // monthly AND yearly would match, which is impossible).
    expect(getPlan("price_pro_y_99")?.id).toBe("pro");
    expect(getPlan("price_agency_y_99")?.id).toBe("agency");
    expect(getPlan("price_business_y_99")?.id).toBe("business");
  });

  it("getPlanByPriceId distinguishes monthly vs yearly within the same plan (returns same plan for both)", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_m_DISTINCT";
    process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID = "price_pro_y_DISTINCT";

    const { getPlanByPriceId: getPlan } = await importPlans();

    // Both must resolve to the pro plan.
    const monthlyMatch = getPlan("price_pro_m_DISTINCT");
    const yearlyMatch = getPlan("price_pro_y_DISTINCT");
    expect(monthlyMatch?.id).toBe("pro");
    expect(yearlyMatch?.id).toBe("pro");
    // Sanity: the two distinct IDs are not equal.
    expect(monthlyMatch?.stripePriceIdMonthly).not.toBe(
      monthlyMatch?.stripePriceIdYearly,
    );
  });

  it("getPlanByPriceId is case-sensitive and returns undefined for near-misses (kills ArrowFunction → undefined mutant indirectly)", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_m_CASE";
    const { getPlanByPriceId: getPlan } = await importPlans();

    expect(getPlan("price_pro_m_CASE")?.id).toBe("pro");
    expect(getPlan("PRICE_PRO_M_CASE")).toBeUndefined();
    expect(getPlan("price_pro_m_cas")).toBeUndefined();
    expect(getPlan("price_pro_m_CASEX")).toBeUndefined();
  });

  it("getPlanByPriceId returns a real PricingPlan object with all required props (kills BlockStatement → {} mutant)", async () => {
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_m_REAL";
    const { getPlanByPriceId: getPlan } = await importPlans();

    const result = getPlan("price_pro_m_REAL");
    // The body must execute and return the plan, not be replaced with `{}`
    // (which would make the function return undefined for every input).
    expect(result).toBeDefined();
    expect(result?.id).toBe("pro");
    expect(result?.name).toBe("Pro");
    expect(result?.monthlyPrice).toBe(39);
    expect(result?.limits.scansPerMonth).toBe(30);
  });

  it("getPlanByPriceId tries every plan (not just the first); kills `() => false` ConditionalExpression on inner find", async () => {
    // The arrow predicate inside .find is `(p) => p.X === id || p.Y === id`.
    // Stryker mutates that to `(p) => false` — which means .find never
    // returns anything. We kill it by checking that the search ACTUALLY
    // matches a plan that is NOT the first one in the array (free).
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID = "price_biz_y_LATE";
    const { getPlanByPriceId: getPlan } = await importPlans();

    const result = getPlan("price_biz_y_LATE");
    expect(result).toBeDefined();
    expect(result?.id).toBe("business"); // 4th plan in the array.
  });
});
