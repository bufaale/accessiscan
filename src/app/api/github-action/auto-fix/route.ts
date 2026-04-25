// AccessiScan Auto-Fix endpoint (Business tier).
// POST /api/github-action/auto-fix
//
// Body: {
//   scan_id: string,
//   issue_ids: string[],     // single issue or batch
//   repo_full_name: string,  // "owner/repo" — user picks from connected installs
//   mode?: "informational_pr" // Phase 1 only ships this mode
// }
//
// Phase 1 behaviour:
//   1. Generate Claude patches for each issue (alt-text, ARIA labels — safe set).
//   2. Open one PR against the chosen repo containing a markdown fix-report
//      file at accessiscan-fixes/<scan_id>.md. The PR DOES NOT auto-modify the
//      customer's source — it gives them the exact code to apply with file
//      hints derived from the page URL. Real source-map-based file resolution
//      is Phase 2 work.
//
// Auth: Supabase user session; profile must be Business tier.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { openAutoFixPR } from "@/lib/github/app-client";
import { generatePatch, isSafeRule, type PatchInput } from "@/lib/github/generate-patch";

export const maxDuration = 90;

const bodySchema = z.object({
  scan_id: z.string().uuid(),
  issue_ids: z.array(z.string().uuid()).min(1).max(20),
  repo_full_name: z.string().regex(/^[^/]+\/[^/]+$/, "expected owner/repo"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Tier gate — Business only.
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();
  if (!profile || profile.subscription_plan !== "business") {
    return NextResponse.json(
      { error: "Auto-Fix PRs are a Business tier feature ($199/mo)." },
      { status: 402 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { scan_id, issue_ids, repo_full_name } = parsed.data;
  const [owner, repo] = repo_full_name.split("/");

  const admin = createAdminClient();
  // Loose-cast for new tables not yet in generated Database type.
  const db = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Verify the user owns a GitHub installation we can use.
  const { data: install } = await db
    .from("github_installations")
    .select("id, github_installation_id, github_account_login")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("installed_at", { ascending: false })
    .limit(1)
    .single();
  if (!install) {
    return NextResponse.json(
      {
        error: "No GitHub installation found",
        install_url: `https://github.com/apps/${process.env.GITHUB_APP_NAME?.trim() || "accessiscan-auto-fix"}/installations/new?state=${user.id}`,
      },
      { status: 412 },
    );
  }

  // Verify scan belongs to the user.
  const { data: scan } = await admin
    .from("scans")
    .select("id, url, user_id")
    .eq("id", scan_id)
    .eq("user_id", user.id)
    .single();
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

  // Pull the issues.
  const { data: issues } = await admin
    .from("scan_issues")
    .select("id, rule_id, rule_description, html_snippet, selector, page_url, wcag_level, severity")
    .in("id", issue_ids)
    .eq("scan_id", scan_id);
  if (!issues || issues.length === 0) {
    return NextResponse.json({ error: "No matching issues" }, { status: 404 });
  }

  // Generate patches in parallel (cap concurrency to avoid Anthropic rate limits).
  const concurrency = 5;
  const fixesApplied: Array<{
    issue_id: string;
    rule: string;
    file_hint: string;
    summary: string;
    patched_html: string;
    needs_review: boolean;
    reason?: string;
  }> = [];
  for (let i = 0; i < issues.length; i += concurrency) {
    const batch = issues.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (issue) => {
        const input: PatchInput = {
          rule_id: issue.rule_id,
          selector: issue.selector,
          html_snippet: issue.html_snippet,
          page_url: issue.page_url,
          rule_description: issue.rule_description,
          wcag_sc: undefined,
          image_url: extractImageUrlFromSnippet(issue.html_snippet),
        };
        try {
          const patch = await generatePatch(input);
          return {
            issue_id: issue.id,
            rule: issue.rule_id,
            file_hint: pageUrlToFileHint(issue.page_url),
            summary: patch.summary,
            patched_html: patch.patched_html,
            needs_review: patch.needs_human_review,
            reason: patch.reason,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : "patch_failed";
          return {
            issue_id: issue.id,
            rule: issue.rule_id,
            file_hint: pageUrlToFileHint(issue.page_url),
            summary: `Patch generation failed: ${message}`,
            patched_html: issue.html_snippet,
            needs_review: true,
            reason: message,
          };
        }
      }),
    );
    fixesApplied.push(...results);
  }

  // Build the markdown fix report and open one PR with it as a single file.
  const reportPath = `accessiscan-fixes/${scan_id}.md`;
  const reportContent = buildFixReport(scan, fixesApplied);
  const prTitle = `Accessibility: ${fixesApplied.filter((f) => !f.needs_review).length} auto-generated fixes for ${new URL(scan.url).hostname}`;
  const prBody = buildPRDescription(scan, fixesApplied);

  let pr: { pr_url: string; pr_number: number; branch: string };
  try {
    pr = await openAutoFixPR({
      installationId: Number(install.github_installation_id),
      owner,
      repo,
      scanId: scan_id,
      patches: [
        {
          file_path: reportPath,
          new_content: reportContent,
          rule: "report",
          issue_id: "report",
          summary: "Fix report",
        },
      ],
      prTitle,
      prBody,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "pr_open_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Persist for the UI sidebar.
  await db.from("auto_fix_prs").insert({
    user_id: user.id,
    scan_id,
    installation_id: install.id,
    repo_full_name,
    pr_number: pr.pr_number,
    pr_url: pr.pr_url,
    state: "open",
    fixes_count: fixesApplied.filter((f) => !f.needs_review).length,
    fixes_applied: fixesApplied,
    warnings: fixesApplied.filter((f) => f.needs_review).map((f) => f.reason),
  });

  return NextResponse.json({
    pr_url: pr.pr_url,
    pr_number: pr.pr_number,
    branch: pr.branch,
    fixes_applied: fixesApplied,
    warnings: fixesApplied.filter((f) => f.needs_review).map((f) => f.reason),
  });
}

function extractImageUrlFromSnippet(snippet: string): string | undefined {
  const match = snippet.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

function pageUrlToFileHint(pageUrl: string): string {
  // Best-effort hint for the developer reviewing the PR. We turn
  // https://example.com/about into "/about" so they can grep their codebase
  // for the page that owns that route. Phase 2 will resolve this to an
  // actual file path via source-map analysis.
  try {
    const u = new URL(pageUrl);
    const path = u.pathname.replace(/\/$/, "") || "/";
    return `${path} (search your codebase for the route handler that renders this URL)`;
  } catch {
    return `${pageUrl} (URL didn't parse — search your codebase manually)`;
  }
}

function buildFixReport(
  scan: { url: string; id: string },
  fixes: Array<{
    issue_id: string;
    rule: string;
    file_hint: string;
    summary: string;
    patched_html: string;
    needs_review: boolean;
    reason?: string;
  }>,
): string {
  const ok = fixes.filter((f) => !f.needs_review);
  const review = fixes.filter((f) => f.needs_review);
  const lines: string[] = [];
  lines.push(`# AccessiScan auto-fix report`);
  lines.push("");
  lines.push(`**Scanned site**: ${scan.url}`);
  lines.push(`**Scan ID**: \`${scan.id}\``);
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(`- ✅ ${ok.length} auto-generated fixes ready to apply`);
  lines.push(`- ⚠️ ${review.length} need human review`);
  lines.push("");
  lines.push("---");
  lines.push("");
  for (const f of ok) {
    lines.push(`## ✅ \`${f.rule}\` — ${f.summary}`);
    lines.push(`**Where**: ${f.file_hint}`);
    lines.push("");
    lines.push("```html");
    lines.push(f.patched_html);
    lines.push("```");
    lines.push("");
  }
  if (review.length) {
    lines.push("---");
    lines.push("");
    lines.push("## ⚠️ Needs human review");
    lines.push("");
    for (const f of review) {
      lines.push(`### \`${f.rule}\` (issue \`${f.issue_id}\`)`);
      lines.push(`- ${f.reason ?? f.summary}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function buildPRDescription(
  scan: { url: string; id: string },
  fixes: Array<{ rule: string; needs_review: boolean }>,
): string {
  const ok = fixes.filter((f) => !f.needs_review).length;
  const review = fixes.filter((f) => f.needs_review).length;
  return [
    `🤖 Accessibility fixes from AccessiScan`,
    ``,
    `**Scanned**: ${scan.url}`,
    `**Auto-generated fixes**: ${ok}`,
    `**Need human review**: ${review}`,
    ``,
    `## What this PR does`,
    `Adds \`accessiscan-fixes/${scan.id}.md\` — a markdown report with the exact patched HTML for each fixable issue. Apply these to the corresponding files in your codebase and re-run AccessiScan to verify.`,
    ``,
    `## Phase 1 limitations`,
    `- Patches are NOT auto-committed to your source files. Each fix's location is hinted via the page URL — your team applies them manually.`,
    `- Phase 2 (next sprint) will resolve URL → file path automatically and commit changes directly.`,
    ``,
    `## How to verify`,
    `- [ ] Visual regression: applied changes should NOT alter rendered appearance.`,
    `- [ ] Re-run AccessiScan after merge — all listed issues should clear.`,
    ``,
    `---`,
    `Generated by AccessiScan Auto-Fix (Business tier $199/mo). Review every patch before merging.`,
  ].join("\n");
}
