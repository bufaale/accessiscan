import { type Page, expect } from "@playwright/test";

// ------- App-specific constants -------
export const APP_NAME = "AccessiScan";
export type Tier = "free" | "pro" | "agency" | "business";
export const ALL_TIERS: Tier[] = ["free", "pro", "agency", "business"];
export const PAID_TIERS: Tier[] = ["pro", "agency", "business"];

export const TEST_PASSWORD = "TestE2E_Pass123!";

// Stripe test card (works only in test mode)
export const STRIPE_TEST_CARD = "4242424242424242";
export const STRIPE_TEST_EXPIRY = "1228";
export const STRIPE_TEST_CVC = "123";

// ------- Supabase admin helpers -------
function supabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}
function supabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}
function supabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

/**
 * Create a confirmed test user. Optionally seed tier in one call.
 * Email pattern: e2e-{prefix}-{timestamp}@test.example.com (namespaced so cleanup
 * can mop up stale users if a run aborts).
 */
export async function createTestUser(
  prefix: string,
  tier: Tier = "free",
): Promise<{ id: string; email: string }> {
  const email = `e2e-${prefix}-${Date.now()}@test.example.com`;
  const res = await fetch(`${supabaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `E2E ${prefix}` },
    }),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${await res.text()}`);
  const user = await res.json();
  // Always seed the plan explicitly — relying on the DB default leaves
  // the column NULL for new accounts, which trips tier-gated handlers
  // (e.g. /api/scans/[id]/vpat checks `subscription_plan === "free"` and
  // a NULL value falls through to the success path).
  for (let i = 0; i < 3; i++) {
    try {
      await setUserPlan(user.id, tier);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return { id: user.id, email };
}

export async function deleteTestUser(userId: string): Promise<void> {
  await fetch(`${supabaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
    },
  });
}

export async function setUserPlan(userId: string, tier: Tier): Promise<void> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      subscription_plan: tier,
      subscription_status: tier === "free" ? "free" : "active",
    }),
  });
  if (!res.ok) throw new Error(`Failed to set plan: ${await res.text()}`);
}

export async function setUserRole(userId: string, role: "admin" | "user"): Promise<void> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`Failed to set role: ${await res.text()}`);
}

// ------- Login / logout helpers -------
export async function loginViaUI(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto("/login");
  // Use stable id selectors so this works against both the v1 form ("Email"
  // label) and the v2 AuthShell ("Work email" label). The IDs are part of the
  // form contract.
  const emailInput = page.locator("#login-email, input[type='email']").first();
  const passwordInput = page.locator("#login-password, input[type='password']").first();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  // The v2 AuthShell has a "Sign in" tab AND a "Sign in" submit button. Scope
  // to the submit type to disambiguate.
  await page.locator("button[type='submit']").filter({ hasText: /^sign in|^signing in/i }).first().click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

export async function logoutViaUI(page: Page) {
  const avatar = page.getByRole("button").filter({ hasText: /^[A-Z]{2,3}$/ });
  await avatar.click();
  await page.getByRole("menuitem", { name: /sign out|log out|cerrar sesi/i }).click();
  await page.waitForURL("**/login**", { timeout: 10_000 });
}

// ------- Navigation helpers -------
export async function clickSidebar(page: Page, label: string | RegExp) {
  const link = page.getByRole("link", {
    name: typeof label === "string" ? new RegExp(label, "i") : label,
  });
  await link.first().click();
}

/**
 * Audit every internal link on the current page — GET each /... href and return
 * status. Skips external, mailto:, tel:, hash-only, api routes.
 */
export async function auditPageLinks(
  page: Page,
  opts: { ignore?: RegExp[] } = {},
): Promise<Array<{ href: string; status: number }>> {
  const anchors = await page.locator("a[href]").all();
  const raw: string[] = [];
  for (const a of anchors) {
    const h = await a.getAttribute("href");
    if (h) raw.push(h);
  }
  const hrefs = Array.from(
    new Set(
      raw.filter(
        (h) => h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/api/"),
      ),
    ),
  );
  const ignore = opts.ignore || [];
  const filtered = hrefs.filter((h) => !ignore.some((re) => re.test(h)));
  const baseURL = page.url().split("/").slice(0, 3).join("/");
  const cookieHeader = (await page.context().cookies())
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const out: Array<{ href: string; status: number }> = [];
  for (const href of filtered) {
    try {
      const r = await fetch(baseURL + href, {
        method: "GET",
        headers: { Cookie: cookieHeader },
        redirect: "manual",
      });
      out.push({ href, status: r.status });
    } catch {
      out.push({ href, status: 0 });
    }
  }
  return out;
}

export async function expectBillingTier(page: Page, tier: Tier) {
  const label: Record<Tier, RegExp> = {
    free: /free/i,
    pro: /\bpro\b/i,
    agency: /agency/i,
    business: /business/i,
  };
  await expect(page.getByText(label[tier]).first()).toBeVisible({ timeout: 10_000 });
}

/** Wait for a scan row to reach "completed" status on the scans list. */
export async function waitForScanCompleted(page: Page, scanId: string, timeoutMs = 180_000) {
  const row = page.locator(`[data-scan-id="${scanId}"]`);
  await expect(row).toContainText(/completed/i, { timeout: timeoutMs });
}

/** Seed a single scan_issue row tied to a scan. Used by auto-fix tests. */
export async function seedScanIssue(
  scanId: string,
  overrides: Partial<{
    rule_id: string;
    rule_description: string;
    severity: "critical" | "serious" | "moderate" | "minor";
    wcag_level: "A" | "AA" | "AAA";
    html_snippet: string;
    selector: string;
    page_url: string;
    impact: string;
    help_url: string;
  }> = {},
): Promise<{ id: string }> {
  const payload = {
    scan_id: scanId,
    rule_id: overrides.rule_id ?? "image-alt",
    rule_description:
      overrides.rule_description ??
      "Images must have alternate text",
    severity: overrides.severity ?? "serious",
    wcag_level: overrides.wcag_level ?? "A",
    html_snippet: overrides.html_snippet ?? '<img src="hero.png">',
    selector: overrides.selector ?? "img",
    page_url: overrides.page_url ?? "https://example.com/",
    impact: overrides.impact ?? "Screen readers cannot announce this image.",
    help_url:
      overrides.help_url ??
      "https://dequeuniversity.com/rules/axe/4.10/image-alt",
  };
  const res = await fetch(`${supabaseUrl()}/rest/v1/scan_issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to seed scan_issue: ${await res.text()}`);
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { id: row.id };
}

/**
 * Borrow an existing github_installation row by temporarily reassigning
 * its user_id to a test user. Returns a release() that restores the
 * original user_id.
 *
 * Required because github_installation_id has a UNIQUE constraint —
 * there's only one row per real GitHub installation, owned by the user
 * who clicked "Install".
 */
export async function borrowGithubInstall(
  testUserId: string,
  githubInstallationId: number,
): Promise<{ release: () => Promise<void> } | null> {
  const lookupRes = await fetch(
    `${supabaseUrl()}/rest/v1/github_installations?github_installation_id=eq.${githubInstallationId}&select=id,user_id`,
    {
      headers: {
        Authorization: `Bearer ${supabaseServiceKey()}`,
        apikey: supabaseAnonKey(),
      },
    },
  );
  const rows = await lookupRes.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    // The AccessiScan GitHub App isn't installed in this Supabase environment
    // (typical in CI where we point at a clean prod DB). Return null so the
    // caller can test.skip() rather than crashing the suite. Reactivate by
    // installing the app on bufaale/accessiscan-e2e-fixtures and seeding
    // a github_installations row for the target install_id.
    return null;
  }
  const original = rows[0];
  const originalUserId: string = original.user_id;

  const reassign = async (toUserId: string) => {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/github_installations?id=eq.${original.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey()}`,
          apikey: supabaseAnonKey(),
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id: toUserId }),
      },
    );
    if (!r.ok) throw new Error(`Reassign failed: ${await r.text()}`);
  };

  await reassign(testUserId);
  return {
    release: async () => {
      await reassign(originalUserId).catch(() => {});
    },
  };
}

/**
 * Seed a completed scan row directly into Supabase (bypasses the worker).
 * Used by data-flow tests that need realistic dashboard/scan-list data without
 * waiting for a real scan to crawl + analyze.
 */
export async function seedScan(
  userId: string,
  overrides: Partial<{
    url: string;
    status: "pending" | "crawling" | "analyzing" | "completed" | "failed";
    scan_type: "quick" | "deep";
    compliance_score: number | null;
    critical_count: number;
    serious_count: number;
    moderate_count: number;
    minor_count: number;
    pour_scores: { perceivable: number; operable: number; understandable: number; robust: number };
  }> = {},
): Promise<{ id: string; url: string }> {
  const url = overrides.url ?? `https://example-${Date.now()}.test`;
  const domain = new URL(url).hostname;
  const payload: Record<string, unknown> = {
    user_id: userId,
    url,
    domain,
    status: overrides.status ?? "completed",
    scan_type: overrides.scan_type ?? "quick",
    compliance_score: overrides.compliance_score ?? 87,
    progress: 100,
    critical_count: overrides.critical_count ?? 2,
    serious_count: overrides.serious_count ?? 5,
    moderate_count: overrides.moderate_count ?? 8,
    minor_count: overrides.minor_count ?? 3,
  };
  if (overrides.pour_scores) payload.pour_scores = overrides.pour_scores;
  const res = await fetch(`${supabaseUrl()}/rest/v1/scans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to seed scan: ${await res.text()}`);
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { id: row.id, url: row.url };
}
