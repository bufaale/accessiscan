/**
 * profile-rich.spec.ts — Verify the rich /settings/profile page (Phase A7).
 *
 * Coverage:
 *  1. Header renders avatar/initials + display name + role pill
 *  2. Edit Full name → save → reload → new value persists in DB
 *  3. Notification toggles render and persist (verified via DB)
 *  4. Email field is readonly + verified badge present
 *  5. Danger zone "Delete account" requires email confirmation (button
 *     disabled until the user types the exact account email)
 *
 * The page is available to all tiers (free + paid). We mostly use a free
 * user to keep the test fast; one test uses pro to assert the role pill.
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
} from "../../helpers/test-utils";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function fetchProfile(userId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=full_name,company,country,timezone,notification_preferences`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
      },
    },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/**
 * Wait until the handle_new_user trigger has finished creating the profile
 * row for a freshly-created auth user. The trigger is normally instant, but
 * we've seen flakes where the row isn't visible to PostgREST for a short
 * window after auth.admin.createUser returns.
 */
async function waitForProfileRow(userId: string, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const p = await fetchProfile(userId);
    if (p) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Profile row for ${userId} did not appear within ${timeoutMs}ms`);
}

test.describe("Settings — Profile (rich, A7)", () => {
  test.setTimeout(90_000);

  test("1. header renders avatar/initials + display name + role pill", async ({
    page,
  }) => {
    const u = await createTestUser("profile-rich-header", "pro");
    await waitForProfileRow(u.id);
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/profile");
      await page.waitForLoadState("networkidle");

      // Avatar (initials fallback when no avatar_url) — uses a stable testid.
      await expect(page.getByTestId("profile-avatar")).toBeVisible();
      // Initials should be 2 chars based on the email prefix until full_name
      // is set. The local-part of e2e-profile-rich-header-... starts with "e2".
      const initials = await page.getByTestId("profile-initials").textContent();
      expect(initials?.length).toBeGreaterThanOrEqual(2);

      // Display name: if profile.full_name is empty, page falls back to the
      // email local-part. Either way, it should render non-empty text.
      const display = await page.getByTestId("profile-display-name").textContent();
      expect(display && display.length > 0).toBeTruthy();

      // Role pill: pro user → "PRO"
      await expect(page.getByTestId("role-pill")).toHaveText(/PRO/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("2. edit Full name → save → reload → persists in DB", async ({
    page,
  }) => {
    const u = await createTestUser("profile-rich-name");
    await waitForProfileRow(u.id);
    const newName = `Rich E2E ${Date.now()}`;
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/profile");
      await page.waitForLoadState("domcontentloaded");

      const nameInput = page.locator("#fullName");
      await expect(nameInput).toBeVisible({ timeout: 10_000 });
      // The form mounts before the profile fetch resolves, then populates
      // #fullName from the response. Filling during that window loses the
      // typed value — the fetch lands and overwrites it, and the save then
      // persists the OLD name, so the reload assertion sees the seeded value
      // and the failure looks like "profile edits do not persist".
      // Wait for the seeded name to appear (proof hydration finished) before
      // typing. createTestUser seeds user_metadata.full_name = `E2E <prefix>`.
      await expect(nameInput).toHaveValue("E2E profile-rich-name", { timeout: 10_000 });
      await nameInput.fill(newName);

      await page.getByTestId("save-details").click();

      // Wait for the ACTUAL success signal. /saved|updated/i was a trap: the
      // status line under the form has three states and two of them match it
      // before any save happens — "Unsaved changes." (shown the instant you
      // type) and "Last updated <date>." (the idle state). So the old
      // assertion passed immediately, the reload below raced the in-flight
      // server action, and the test failed as though profile edits do not
      // persist. "Profile updated" is the toast.success() text, which only
      // renders after updateProfileDetails() returns ok.
      await expect(page.getByText("Profile updated")).toBeVisible({ timeout: 10_000 });

      // Reload to confirm round-trip — domcontentloaded is more reliable than
      // networkidle on the dashboard which has live polling.
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#fullName")).toHaveValue(newName, { timeout: 10_000 });

      // Verify DB
      const profile = await fetchProfile(u.id);
      expect(profile?.full_name).toBe(newName);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("3. notification toggles render and persist", async ({ page }) => {
    const u = await createTestUser("profile-rich-notifs");
    await waitForProfileRow(u.id);
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/profile");
      await page.waitForLoadState("networkidle");

      // All four toggle switches should render
      for (const id of ["scan_complete", "weekly_summary", "compliance_alerts", "marketing_emails"]) {
        await expect(page.getByTestId(`notif-${id}`)).toBeVisible();
      }

      // marketing_emails defaults to false (per migration default). Toggle ON.
      const marketing = page.getByTestId("notif-marketing_emails");
      const initial = await marketing.getAttribute("aria-checked");
      expect(initial).toBe("false");

      await marketing.click();

      // Wait for the success toast
      await expect(page.getByText(/saved|updated/i).first()).toBeVisible({ timeout: 8_000 });

      // Confirm aria-checked flipped
      await expect(marketing).toHaveAttribute("aria-checked", "true");

      // Give the Server Action's DB write a moment to commit (Server Actions
      // resolve the toast on transition completion; the actual UPDATE may
      // still be in flight when the client toast fires).
      await page.waitForTimeout(500);

      // Verify DB persisted the change
      const profile = await fetchProfile(u.id);
      const prefs = profile?.notification_preferences as
        | { marketing_emails?: boolean }
        | undefined;
      expect(prefs?.marketing_emails).toBe(true);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("4. email field is readonly + verified badge present", async ({ page }) => {
    const u = await createTestUser("profile-rich-email");
    await waitForProfileRow(u.id);
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/profile");
      await page.waitForLoadState("networkidle");

      const emailInput = page.locator("#email");
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveValue(u.email);
      await expect(emailInput).toBeDisabled();

      // Test users created via the admin API have email_confirm: true → verified.
      await expect(page.getByTestId("email-verified-badge")).toBeVisible();
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("5. danger zone: delete-account button disabled until email is typed", async ({
    page,
  }) => {
    const u = await createTestUser("profile-rich-delete");
    await waitForProfileRow(u.id);
    try {
      await loginViaUI(page, u.email);
      await page.goto("/settings/profile");
      await page.waitForLoadState("networkidle");

      // Open the delete confirmation flow
      await page.getByTestId("open-delete").click();

      // Confirm input and the disabled "Permanently delete account" button appear
      const confirmInput = page.getByTestId("delete-confirm-input");
      await expect(confirmInput).toBeVisible();
      const confirmBtn = page.getByTestId("confirm-delete");
      await expect(confirmBtn).toBeVisible();
      await expect(confirmBtn).toBeDisabled();

      // Typing wrong text → still disabled
      await confirmInput.fill("not-the-email@example.com");
      await expect(confirmBtn).toBeDisabled();

      // Typing the exact account email → enabled
      await confirmInput.fill(u.email);
      await expect(confirmBtn).toBeEnabled();

      // Do NOT click — that would tear down the test user out-of-band.
    } finally {
      await deleteTestUser(u.id);
    }
  });
});
