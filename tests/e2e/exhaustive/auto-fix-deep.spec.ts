/**
 * auto-fix-deep.spec.ts — END-TO-END Auto-Fix PR creation.
 *
 * The most consequential test in the suite: actually creates a real Pull
 * Request on bufaale/accessiscan-e2e-fixtures via the AccessiScan GitHub
 * App, then closes + cleans up. Proves the full Auto-Fix pipeline:
 *
 *   POST /api/github-action/auto-fix
 *     → Tier check (business)
 *     → github_installations lookup
 *     → Claude Sonnet generates patches
 *     → openAutoFixPR creates branch + commits + opens PR
 *     → returns { prUrl, branch }
 *
 * Setup (one-time, by operator):
 *   - Repo bufaale/accessiscan-e2e-fixtures created (done)
 *   - AccessiScan GitHub App installed on that repo (done — install 127055454)
 *   - GH_TOKEN_E2E in .env.test.local with `repo` scope (auto-populated from gh auth token)
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
const TEST_INSTALLATION_ID = 127055454; // AccessiScan App on bufaale account

const githubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function getPullRequest(
  request: APIRequestContext,
  prNumber: number,
  token: string,
) {
  const res = await request.get(
    `https://api.github.com/repos/${TEST_REPO}/pulls/${prNumber}`,
    { headers: githubHeaders(token) },
  );
  return { status: res.status(), body: await res.json().catch(() => null) };
}

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
// same github_installation row (UNIQUE constraint), so parallel runs race.
test.describe.configure({ mode: "serial" });

test.describe("Auto-Fix PR — full E2E against bufaale/accessiscan-e2e-fixtures", () => {
  test.setTimeout(180_000);

  test("business user with installed GitHub App opens a real PR", async ({
    page,
    request,
  }) => {
    const ghToken = process.env.GH_TOKEN_E2E;
    test.skip(
      !ghToken,
      "GH_TOKEN_E2E missing — run `gh auth token` and add to .env.test.local",
    );

    const u = await createTestUser("autofix-deep", "business");
    let createdPrNumber: number | null = null;
    let createdBranchName: string | null = null;
    let installLease: { release: () => Promise<void> } | null = null;

    try {
      installLease = await borrowGithubInstall(u.id, TEST_INSTALLATION_ID);
      if (!installLease) {
        test.skip(true, "AccessiScan GitHub App not installed in this Supabase env");
        return;
      }
      const scan = await seedScan(u.id, {
        url: "https://accessiscan-e2e-fixtures.test/",
        compliance_score: 60,
        critical_count: 0,
        serious_count: 1,
      });
      const issue = await seedScanIssue(scan.id, {
        rule_id: "image-alt",
        rule_description: "Images must have alternate text",
        severity: "serious",
        wcag_level: "A",
        html_snippet: '<img src="hero.png">',
        selector: 'img[src="hero.png"]',
        page_url: "https://accessiscan-e2e-fixtures.test/",
      });

      // Authenticate so the auto-fix endpoint sees a Supabase session.
      await loginViaUI(page, u.email);

      // Hit the prod auto-fix endpoint with the user's session cookies.
      const baseUrl = page.url().split("/").slice(0, 3).join("/");
      const cookieHeader = (await page.context().cookies())
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const apiResponse = await request.post(
        `${baseUrl}/api/github-action/auto-fix`,
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          data: {
            scan_id: scan.id,
            issue_ids: [issue.id],
            repo_full_name: TEST_REPO,
          },
          timeout: 90_000,
        },
      );

      const status = apiResponse.status();
      const responseJson = await apiResponse.json().catch(() => null);

      if (status >= 500) {
        throw new Error(
          `Auto-Fix endpoint 5xx: ${status} - ${JSON.stringify(responseJson)}`,
        );
      }
      if (status >= 400) {
        throw new Error(
          `Auto-Fix endpoint 4xx for valid Business+Install setup: ${status} - ${JSON.stringify(responseJson)}`,
        );
      }

      const prUrl: string | undefined =
        responseJson?.prUrl ?? responseJson?.pr_url;
      const branch: string | undefined =
        responseJson?.branch ?? responseJson?.branch_name;

      expect(
        prUrl,
        `Response should include prUrl; got ${JSON.stringify(responseJson)}`,
      ).toBeTruthy();
      expect(prUrl).toMatch(
        /^https:\/\/github\.com\/bufaale\/accessiscan-e2e-fixtures\/pull\/\d+$/,
      );

      const prMatch = prUrl!.match(/\/pull\/(\d+)$/);
      createdPrNumber = prMatch ? Number(prMatch[1]) : null;
      createdBranchName = branch ?? null;

      // Verify the PR exists + the bot is the author
      const { status: prStatus, body: prData } = await getPullRequest(
        request,
        createdPrNumber!,
        ghToken!,
      );
      expect(prStatus).toBe(200);
      expect(prData.state).toBe("open");
      expect(prData.user.login).toContain("accessiscan");
      expect(prData.title.toLowerCase()).toMatch(/accessiscan|fix|wcag|accessibility/);

      // Verify the branch contains the fix-report file
      const filesRes = await request.get(
        `https://api.github.com/repos/${TEST_REPO}/pulls/${createdPrNumber}/files`,
        { headers: githubHeaders(ghToken!) },
      );
      const files: Array<{ filename: string }> = await filesRes.json();
      const reportFile = files.find((f) =>
        f.filename.startsWith("accessiscan-fixes/"),
      );
      expect(
        reportFile,
        "PR should include accessiscan-fixes/<scan_id>.md",
      ).toBeTruthy();
    } finally {
      if (ghToken) {
        if (createdPrNumber) {
          await closePullRequest(request, createdPrNumber, ghToken);
        }
        if (createdBranchName) {
          await deleteBranch(request, createdBranchName, ghToken);
        }
      }
      // Restore the github_installations.user_id to the original owner
      // BEFORE deleting the test user (otherwise FK cascade may complicate).
      if (installLease) await installLease.release();
      await deleteTestUser(u.id);
    }
  });
});
