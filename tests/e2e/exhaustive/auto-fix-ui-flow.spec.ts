/**
 * auto-fix-ui-flow.spec.ts — Generate Fix PR through the actual UI.
 *
 * Complements auto-fix-deep.spec.ts (which hits the API directly) by
 * driving Playwright through the user-facing flow:
 *
 *   1. Business user with seeded GitHub install lands on a scan result
 *   2. The "Generate fix PR" button is visible + enabled
 *   3. Click → dialog opens with repo input
 *   4. Fill repo with bufaale/accessiscan-e2e-fixtures + click Open PR
 *   5. Wait for success state (PR URL appears in dialog)
 *   6. Verify PR exists on GitHub via API
 *   7. Cleanup: close PR + delete branch + release install
 *
 * Also includes a separate test for the install-button UX on /settings/github
 * for a Business user without an install — verifies the button is enabled
 * and points at github.com/apps/accessiscan-auto-fix/installations/new.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
  seedScanIssue,
  borrowGithubInstall,
} from "../../helpers/test-utils";

const TEST_REPO = "bufaale/accessiscan-e2e-fixtures";
const TEST_INSTALLATION_ID = 127055454;

const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function closePullRequest(
  request: APIRequestContext,
  prNumber: number,
  token: string,
) {
  await request
    .patch(`https://api.github.com/repos/${TEST_REPO}/pulls/${prNumber}`, {
      headers: githubHeaders(token),
      data: { state: "closed" },
    })
    .catch(() => {});
}

async function deleteBranch(
  request: APIRequestContext,
  branchName: string,
  token: string,
) {
  await request
    .delete(
      `https://api.github.com/repos/${TEST_REPO}/git/refs/heads/${branchName}`,
      { headers: githubHeaders(token) },
    )
    .catch(() => {});
}

// Run all auto-fix tests in this file sequentially — they all borrow the
// same github_installation row (UNIQUE constraint), so parallel runs race
// against auto-fix-deep.spec.ts.
test.describe.configure({ mode: "serial" });

test.describe("Auto-Fix PR — full UI flow", () => {
  test.setTimeout(180_000);

  test("business user with install: scan-result button -> dialog -> open PR -> success state", async ({
    page,
    request,
  }) => {
    const ghToken = process.env.GH_TOKEN_E2E;
    test.skip(!ghToken, "GH_TOKEN_E2E missing");

    const u = await createTestUser("autofix-ui", "business");
    let createdPrNumber: number | null = null;
    let createdBranchName: string | null = null;
    let installLease: { release: () => Promise<void> } | null = null;

    try {
      installLease = await borrowGithubInstall(u.id, TEST_INSTALLATION_ID);
      const scan = await seedScan(u.id, {
        url: "https://accessiscan-e2e-fixtures.test/",
        compliance_score: 65,
        critical_count: 0,
        serious_count: 1,
      });
      // Seed an image-alt issue (in SAFE_RULES) so the button shows a
      // fixable count > 0
      await seedScanIssue(scan.id, {
        rule_id: "image-alt",
        severity: "serious",
        wcag_level: "A",
        html_snippet: '<img src="hero.png">',
        selector: 'img[src="hero.png"]',
        page_url: "https://accessiscan-e2e-fixtures.test/",
      });

      await loginViaUI(page, u.email);
      await page.goto(`/dashboard/scans/${scan.id}`);
      await page.waitForLoadState("networkidle");

      // A5 PR Panel flow: button label is "Open Auto-Fix PR · 1 fix" since
      // fixableCount=1. Click opens the right-side PR Panel sidebar (NOT
      // a dialog like in the previous Generate fix PR design).
      const triggerButton = page.locator("[data-testid='open-pr-panel']").first();
      await expect(triggerButton).toBeVisible({ timeout: 15_000 });
      await expect(triggerButton).toBeEnabled();
      await expect(triggerButton).toContainText(/auto[-\s]?fix\s*pr/i);
      await expect(triggerButton).toContainText(/\b1\s*fix\b/i);
      await triggerButton.click();

      // Panel opens — fill repo input (it's inside the panel's RepoBar)
      const repoInput = page.locator("#prpanel-repo");
      await expect(repoInput).toBeVisible({ timeout: 5_000 });
      await repoInput.fill(TEST_REPO);

      // Click "Open PR on GitHub" in the panel footer
      const submitBtn = page.getByRole("button", { name: /^open\s*pr\s*on\s*github$|generating/i }).first();

      // Capture the API response so we can grab prUrl + branch for cleanup
      const apiResponsePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/api/github-action/auto-fix") &&
          res.request().method() === "POST",
        { timeout: 90_000 },
      );
      await submitBtn.click();
      const apiRes = await apiResponsePromise;
      expect(apiRes.status()).toBeLessThan(400);
      const data = await apiRes.json();
      const prUrl: string | undefined = data?.pr_url ?? data?.prUrl;
      const branch: string | undefined =
        data?.branch ?? data?.branch_name;
      expect(prUrl).toMatch(/^https:\/\/github\.com\/bufaale\/accessiscan-e2e-fixtures\/pull\/\d+$/);
      const prMatch = prUrl!.match(/\/pull\/(\d+)$/);
      createdPrNumber = prMatch ? Number(prMatch[1]) : null;
      createdBranchName = branch ?? null;

      // The panel footer should now show the success state with
      // "PR opened on GitHub" + "View on GitHub" link
      await expect(page.getByText(/PR opened/i).first()).toBeVisible({
        timeout: 10_000,
      });
      const viewLink = page
        .getByRole("link", { name: /view on github/i })
        .first();
      await expect(viewLink).toBeVisible();
      const viewHref = await viewLink.getAttribute("href");
      expect(viewHref).toBe(prUrl);
    } finally {
      if (ghToken) {
        if (createdPrNumber) {
          await closePullRequest(request, createdPrNumber, ghToken);
        }
        if (createdBranchName) {
          await deleteBranch(request, createdBranchName, ghToken);
        }
      }
      if (installLease) await installLease.release();
      await deleteTestUser(u.id);
    }
  });

  test("business user without install: /settings/github install button is enabled + points to GitHub", async ({
    page,
  }) => {
    const u = await createTestUser("autofix-ui-install", "business");
    try {
      // Note: this user has NO github_installations row (we don't borrow).
      // Test verifies the install CTA UX for a Business user who hasn't
      // connected yet.
      await loginViaUI(page, u.email);
      await page.goto("/settings/github");
      await page.waitForLoadState("networkidle");

      // Empty state: "No GitHub accounts connected yet"
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/no\s+github\s+accounts|install\s+github\s+app/i);

      // Install link is enabled (no aria-disabled) and points to the right URL
      const installLink = page
        .getByRole("link", { name: /install\s*github\s*app/i })
        .first();
      await expect(installLink).toBeVisible({ timeout: 10_000 });
      const ariaDisabled = await installLink.getAttribute("aria-disabled");
      expect(ariaDisabled === null || ariaDisabled === "false").toBe(true);
      const href = await installLink.getAttribute("href");
      expect(href).toMatch(
        /^https:\/\/github\.com\/apps\/accessiscan-auto-fix\/installations\/new\?state=/,
      );
      // The state param is HMAC-signed at install URL generation time so the
      // callback can verify it without trusting the user_id encoded inside.
      // Format is `<base64url(payload)>.<base64url(hmac)>`. We assert the
      // shape (two non-empty base64url segments joined by a dot) rather than
      // a literal user id, since the raw id never appears in the URL.
      const stateMatch = href?.match(/[?&]state=([^&]+)/);
      expect(stateMatch).not.toBeNull();
      const decodedState = decodeURIComponent(stateMatch![1]);
      expect(decodedState).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
      expect(decodedState).not.toContain(u.id);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});
