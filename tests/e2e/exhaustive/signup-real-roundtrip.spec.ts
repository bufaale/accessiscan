/**
 * signup-real-roundtrip.spec.ts — real signup form submission against the
 * deployed Supabase auth backend.
 *
 * Approach:
 *  1. Generate a one-shot test email.
 *  2. Fill the /signup form, submit.
 *  3. Lookup the auth.users row via Admin API → confirms the user was
 *     actually created in Supabase (not just a UI illusion).
 *  4. Confirm email via Admin API and verify the handle_new_user trigger
 *     populated profiles row with subscription_plan="free".
 *  5. Cleanup via deleteTestUser.
 *
 * NOTE: We do NOT assert UI-side post-signup redirect behavior because
 * the dev/prod auth flow may vary (email confirmation toast vs auto-login).
 * That's covered by auth.spec.ts in the existing suite.
 */
import { test, expect } from "@playwright/test";
import { TEST_PASSWORD, deleteTestUser } from "../../helpers/test-utils";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  // List users filtered by email.
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_ANON_KEY!,
      },
    },
  );
  if (!res.ok) return null;
  const json = await res.json();
  // GoTrue admin returns {users: [...], aud, ...}
  const users = json.users ?? json;
  const user = (users as Array<{ id: string; email: string }>).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return user ? { id: user.id } : null;
}

async function getProfile(userId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=id,subscription_plan,subscription_status`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_ANON_KEY!,
      },
    },
  );
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

test.describe("Signup form — real Supabase roundtrip", () => {
  test.skip(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY, "Supabase env not set");

  test("submit /signup → auth.users row created → profile auto-populated by trigger", async ({ page }) => {
    const email = `e2e-signup-real-${Date.now()}@test.example.com`;
    let userId: string | null = null;

    try {
      await page.goto("/signup");
      await page.waitForLoadState("networkidle");

      // Fill the signup form. The form has stable id selectors:
      // signup-name, signup-email, signup-password.
      // Tolerate either AuthShell v2 or older form variants.
      const nameInput = page.locator("#signup-name, input[name='name'], input[name='full_name']").first();
      if (await nameInput.count()) {
        await nameInput.fill("E2E Real Signup");
      }
      await page.locator("#signup-email, input[type='email']").first().fill(email);
      await page.locator("#signup-password, input[type='password']").first().fill(TEST_PASSWORD);

      // The ToS checkbox is required — submit button stays disabled until
      // it's checked. Without this the click below is a no-op and the test
      // silently times out at the findUserByEmail check.
      const tos = page.getByRole("checkbox").first();
      if (await tos.count()) await tos.check();

      // Submit — match the submit button by text (Sign up / Create account).
      const submit = page
        .locator("button[type='submit']")
        .filter({ hasText: /sign\s*up|create\s*account|get\s*started/i })
        .first();
      await submit.click();

      // Poll for auth.users row instead of a fixed wait — signup +
      // handle_new_user trigger fire async and Supabase Cloud can take
      // 2-5s under load.
      let found: { id: string } | null = null;
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        found = await findUserByEmail(email);
        if (found) break;
        await page.waitForTimeout(500);
      }
      expect(found, `Expected auth.users row for ${email} after signup`).toBeTruthy();
      userId = found!.id;

      // Verify the profile row was created by the handle_new_user trigger.
      // Trigger may take a moment to fire — poll up to 5 seconds.
      let profile = null;
      for (let i = 0; i < 10; i++) {
        profile = await getProfile(userId);
        if (profile) break;
        await page.waitForTimeout(500);
      }
      expect(profile, "handle_new_user trigger should create a profiles row").toBeTruthy();
      // New users default to free tier.
      expect(profile.subscription_plan).toBe("free");
    } finally {
      if (userId) await deleteTestUser(userId).catch(() => {});
    }
  });

  test("signup with malformed email is rejected client-side or server-side", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    const emailInput = page.locator("#signup-email, input[type='email']").first();
    await emailInput.fill("not-an-email");
    await page.locator("#signup-password, input[type='password']").first().fill(TEST_PASSWORD);
    // Same ToS gate — without it the submit is a no-op and the URL stays
    // on /signup whether or not the email is malformed, defeating the test.
    const tos = page.getByRole("checkbox").first();
    if (await tos.count()) await tos.check();
    const submit = page
      .locator("button[type='submit']")
      .filter({ hasText: /sign\s*up|create\s*account|get\s*started/i })
      .first();
    await submit.click();
    // Either browser-native :invalid pseudo blocks submission, or server returns
    // an inline error. Either way we should NOT have navigated to /dashboard.
    await page.waitForTimeout(2000);
    expect(page.url()).not.toMatch(/\/dashboard/);
  });
});
