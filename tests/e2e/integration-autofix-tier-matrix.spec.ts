/**
 * Integration test — POST /api/github-action/auto-fix tier + auth matrix.
 *
 * Asserts the gating logic of the AutoFix endpoint without invoking Anthropic
 * for paths that get rejected before AI work happens. Each test creates a
 * test user with the right tier, optionally borrows the github_installations
 * row, posts to /api/github-action/auto-fix, asserts status/error.
 *
 * Specifically validates:
 *  - Free tier  → 402 (Business only)
 *  - Pro tier   → 402
 *  - Business, no install              → 412 + install_url
 *  - Business, install but cross-user scan id → 404
 *  - Business, install, repo NOT in installation → 403 (B8 fix)
 *  - 21 issue_ids → 400 (Zod max 20)
 *  - Anonymous (no cookies) → 401
 *
 * NOTE: All tests run sequentially because they share the github_installations
 * row via borrowGithubInstall.
 */
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
  seedScanIssue,
  borrowGithubInstall,
} from "../helpers/test-utils";

const TEST_INSTALLATION_ID = 127055454;
const REAL_REPO = "bufaale/accessiscan-e2e-fixtures";
const FAKE_REPO = "definitely-not-an-org/definitely-not-a-repo-12345";
const ENDPOINT = "/api/github-action/auto-fix";

async function postAutoFix(
  page: Page,
  request: APIRequestContext,
  body: Record<string, unknown>,
  cookies: string,
) {
  const baseUrl = page.url().split("/").slice(0, 3).join("/");
  return request.post(`${baseUrl}${ENDPOINT}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    data: body,
    timeout: 30_000,
  });
}

async function cookiesAsHeader(page: Page): Promise<string> {
  return (await page.context().cookies())
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

test.describe.configure({ mode: "serial" });

test.describe("AutoFix endpoint — tier + auth matrix", () => {
  test("anonymous request returns 401", async ({ request, baseURL }) => {
    const url = `${baseURL ?? "https://app-04-ada-scanner.vercel.app"}${ENDPOINT}`;
    const res = await request.post(url, {
      headers: { "Content-Type": "application/json" },
      data: { scan_id: "00000000-0000-0000-0000-000000000000", issue_ids: ["00000000-0000-0000-0000-000000000000"], repo_full_name: REAL_REPO },
    });
    expect(res.status()).toBe(401);
  });

  test("free tier user gets 402 (Business only)", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-free", "free");
    try {
      await loginViaUI(page, u.email);
      const res = await postAutoFix(page, request, {
        scan_id: "00000000-0000-0000-0000-000000000000",
        issue_ids: ["00000000-0000-0000-0000-000000000000"],
        repo_full_name: REAL_REPO,
      }, await cookiesAsHeader(page));
      expect(res.status()).toBe(402);
      const json = await res.json();
      expect(json.error).toMatch(/business/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("pro tier user gets 402 (Business only)", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-pro", "pro");
    try {
      await loginViaUI(page, u.email);
      const res = await postAutoFix(page, request, {
        scan_id: "00000000-0000-0000-0000-000000000000",
        issue_ids: ["00000000-0000-0000-0000-000000000000"],
        repo_full_name: REAL_REPO,
      }, await cookiesAsHeader(page));
      expect(res.status()).toBe(402);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business user without GitHub install → 412 with install_url", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-noinst", "business");
    try {
      await loginViaUI(page, u.email);
      const res = await postAutoFix(page, request, {
        scan_id: "00000000-0000-0000-0000-000000000000",
        issue_ids: ["00000000-0000-0000-0000-000000000000"],
        repo_full_name: REAL_REPO,
      }, await cookiesAsHeader(page));
      expect(res.status()).toBe(412);
      const json = await res.json();
      expect(json.install_url).toMatch(/github\.com\/apps\//);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("business + install + cross-user scan_id → 404 (scan not found)", async ({ page, request }) => {
    // Owner = create a scan owned by user A. Then user B (business + install)
    // tries to operate on it.
    const owner = await createTestUser("autofix-matrix-owner", "business");
    const intruder = await createTestUser("autofix-matrix-intruder", "business");
    let lease: { release: () => Promise<void> } | null = null;
    try {
      const ownerScan = await seedScan(owner.id);
      const ownerIssue = await seedScanIssue(ownerScan.id);

      lease = await borrowGithubInstall(intruder.id, TEST_INSTALLATION_ID);
      if (!lease) {
        test.skip(true, "AccessiScan GitHub App not installed in this Supabase env");
        return;
      }
      await loginViaUI(page, intruder.email);

      const res = await postAutoFix(page, request, {
        scan_id: ownerScan.id,
        issue_ids: [ownerIssue.id],
        repo_full_name: REAL_REPO,
      }, await cookiesAsHeader(page));

      expect(res.status()).toBe(404);
    } finally {
      if (lease) await lease.release();
      await deleteTestUser(intruder.id);
      await deleteTestUser(owner.id);
    }
  });

  test("business + install + repo NOT in installation → 403 (B8 fix)", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-badrepo", "business");
    let lease: { release: () => Promise<void> } | null = null;
    try {
      const scan = await seedScan(u.id);
      const issue = await seedScanIssue(scan.id);

      lease = await borrowGithubInstall(u.id, TEST_INSTALLATION_ID);
      if (!lease) {
        test.skip(true, "AccessiScan GitHub App not installed in this Supabase env");
        return;
      }
      await loginViaUI(page, u.email);

      const res = await postAutoFix(page, request, {
        scan_id: scan.id,
        issue_ids: [issue.id],
        repo_full_name: FAKE_REPO,
      }, await cookiesAsHeader(page));

      // B8 fix returns 403 with explicit "Repository not in your GitHub App installation".
      // Tolerate 502 too in case GitHub's installation list endpoint hiccups.
      expect([403, 502]).toContain(res.status());
      if (res.status() === 403) {
        const json = await res.json();
        expect(json.error).toMatch(/repository not in your github app installation/i);
        expect(json.install_url).toBeTruthy();
      }
    } finally {
      if (lease) await lease.release();
      await deleteTestUser(u.id);
    }
  });

  test("21 issue_ids fails Zod validation → 400", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-zod", "business");
    try {
      await loginViaUI(page, u.email);
      const issueIds = Array.from({ length: 21 }, () =>
        // valid uuid v4-ish
        `${Math.random().toString(16).slice(2, 10)}-1234-1234-1234-123456789012`.padEnd(36, "0").slice(0, 36),
      );
      const res = await postAutoFix(page, request, {
        scan_id: "00000000-0000-0000-0000-000000000000",
        issue_ids: issueIds,
        repo_full_name: REAL_REPO,
      }, await cookiesAsHeader(page));

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/invalid request/i);
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("invalid repo_full_name format → 400 (Zod regex)", async ({ page, request }) => {
    const u = await createTestUser("autofix-matrix-badrepofmt", "business");
    try {
      await loginViaUI(page, u.email);
      const res = await postAutoFix(page, request, {
        scan_id: "00000000-0000-0000-0000-000000000000",
        issue_ids: ["00000000-0000-0000-0000-000000000000"],
        repo_full_name: "not_an_owner_slash_repo",
      }, await cookiesAsHeader(page));
      expect(res.status()).toBe(400);
    } finally {
      await deleteTestUser(u.id);
    }
  });
});
