import { type Page } from "@playwright/test";

// ------- Constants -------
export const TEST_PASSWORD = "TestE2E_Pass123!";
export const STRIPE_TEST_CARD = "4242424242424242";
export const STRIPE_TEST_EXPIRY = "1228";
export const STRIPE_TEST_CVC = "123";

// ------- Supabase Admin API -------
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
 * Creates a confirmed test user via the Supabase Admin API.
 * Returns the user ID and email.
 */
export async function createTestUser(prefix: string): Promise<{ id: string; email: string }> {
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
  return { id: user.id, email };
}

/**
 * Deletes a test user via the Supabase Admin API.
 */
export async function deleteTestUser(userId: string): Promise<void> {
  await fetch(`${supabaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey()}`,
      apikey: supabaseAnonKey(),
    },
  });
}

/**
 * Logs in via the UI. Assumes page is on /login or navigates there.
 */
export async function loginViaUI(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

/**
 * Logs in via the Supabase Auth API directly (faster, no UI interaction).
 * Sets auth cookies so subsequent navigations are authenticated.
 */
export async function loginViaAPI(page: Page, email: string, password: string = TEST_PASSWORD) {
  const baseURL = page.context().pages()[0]?.url()?.split("/").slice(0, 3).join("/")
    || process.env.TEST_BASE_URL
    || "https://app-04-ada-scanner.vercel.app";

  // Sign in via Supabase to get tokens
  const res = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const { access_token, refresh_token } = await res.json();

  // Set Supabase auth cookies on the browser context
  const domain = new URL(baseURL).hostname;
  await page.context().addCookies([
    {
      name: "sb-access-token",
      value: access_token,
      domain,
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    },
    {
      name: "sb-refresh-token",
      value: refresh_token,
      domain,
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    },
  ]);

  // Navigate to dashboard to trigger SSR auth check with cookies
  await page.goto("/dashboard");
}

/**
 * Updates a user's subscription plan directly via Supabase Admin.
 * Useful for testing Pro features without going through Stripe.
 */
export async function setUserPlan(
  userId: string,
  plan: "free" | "pro" | "agency",
): Promise<void> {
  const res = await fetch(
    `${supabaseUrl()}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey()}`,
        apikey: supabaseAnonKey(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        subscription_plan: plan,
        subscription_status: plan === "free" ? "free" : "active",
      }),
    },
  );
  if (!res.ok) throw new Error(`Failed to set plan: ${await res.text()}`);
}
