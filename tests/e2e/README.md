# AccessiScan E2E tests

End-to-end tests that run against live deployments. Pattern: when you add a new
feature, **add one spec here** and coverage stays honest.

## Running locally

```bash
npm install
npx playwright install --with-deps chromium

# Point at production (default):
npx playwright test

# Or point at a local dev server with Stripe test keys:
TEST_BASE_URL=http://localhost:3014 STRIPE_TEST_MODE=1 npx playwright test
```

Requires `.env.test.local` (not committed) with Supabase admin credentials.

## Coverage map

| Spec | What it covers |
|---|---|
| `auth.spec.ts` | login / signup / logout / forgot-password render + redirect flows |
| `landing.spec.ts` | public marketing hero, pricing section, CTA buttons |
| `navigation.spec.ts` | sidebar links + headings on every dashboard page |
| `link-audit.spec.ts` | **no 404s** on any internal link across every authenticated + marketing page (catches broken `router.push("/pricing")` and the like) |
| `tier-gating.spec.ts` | per-tier matrix (free/pro/agency/business) × every paid feature (deep scan, monitored sites, PDF scans, billing label) |
| `scan.spec.ts` | quick + deep scan flows, AI analysis gating, PDF report download |
| `vpat.spec.ts` | free users see combined VPAT gated button → billing; pro/agency/business download VPAT 2.5 + EN 301 549 PDFs |
| `monitored-flow.spec.ts` | business tier adds / lists monitored sites |
| `settings-profile.spec.ts` | profile name edit round-trip + delete-account presence |
| `admin.spec.ts` | non-admin blocked from /admin, admin can load it |
| `billing.spec.ts` | Stripe checkout + portal (skipped against live-mode; runs with `STRIPE_TEST_MODE=1`) |

## Adding a test for a new feature

Every new feature MUST ship with at least one spec. Template:

```ts
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../helpers/test-utils";

let user: { id: string; email: string };

test.beforeAll(async () => {
  // Seed the tier that owns this feature (default "free").
  user = await createTestUser("my-feature", "pro");
});
test.afterAll(async () => {
  if (user?.id) await deleteTestUser(user.id);
});

test("my feature does the thing", async ({ page }) => {
  await loginViaUI(page, user.email);
  await page.goto("/dashboard/my-feature");
  await expect(page.getByRole("heading", { name: /My Feature/i })).toBeVisible();
  // ... assert the behaviour
});
```

For gated features, **also** add a row to `tier-gating.spec.ts`:

```ts
test(`${tier} user: POST /api/my-feature returns 402`, async ({ page }) => {
  await loginViaUI(page, users[tier].email);
  const res = await page.request.post("/api/my-feature", { data: {...} });
  expect(res.status()).toBe(402);
});
```

For pages with new internal links, they're automatically covered by
`link-audit.spec.ts` — no manual work needed.

## Helpers

`tests/helpers/test-utils.ts`:

| Helper | What it does |
|---|---|
| `createTestUser(prefix, tier?)` | Creates a confirmed test user; optionally seeds tier |
| `deleteTestUser(userId)` | Cleans up a test user |
| `setUserPlan(userId, tier)` | Flips `profiles.subscription_plan` directly (bypasses Stripe) |
| `setUserRole(userId, "admin")` | Grants admin role for admin-panel tests |
| `loginViaUI(page, email)` | Signs in via the login form |
| `logoutViaUI(page)` | Signs out via the avatar menu |
| `auditPageLinks(page)` | Returns every internal link + its status code |
| `expectBillingTier(page, tier)` | Asserts billing page shows the correct tier label |

Test users are namespaced `e2e-{prefix}-{timestamp}@test.example.com` so stale
ones from aborted runs are easy to mop up manually.

## Stripe test mode

The `billing.spec.ts` suite skips when pointed at a live-mode deployment. To
run it locally:

```bash
# In the local .env, swap STRIPE_SECRET_KEY to sk_test_... and set:
STRIPE_TEST_MODE=1 TEST_BASE_URL=http://localhost:3014 npx playwright test billing.spec.ts
```

Live-mode Stripe rejects the `4242 4242 4242 4242` test card, so running these
against prod always fails — that's why they're gated.
