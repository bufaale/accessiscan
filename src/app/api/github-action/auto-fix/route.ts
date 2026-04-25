// AccessiScan Auto-Fix PR endpoint (Business tier).
// POST /api/github-action/auto-fix
//
// Body: { scan_id, issue_ids[], mode: "single_pr" | "one_pr_per_issue" }
// Auth: Bearer = supabase user token; profile must be Business+ tier.
// Action: generate patches via Claude → open PR(s) via GitHub App.
//
// SCAFFOLD ONLY (2026-04-25). Phase 1 implementation: alt-text + ARIA labels.
// See .shared/launch/auto-fix-prs-design-2026-04-25.md.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 90;

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

  // TODO Phase 1 implementation (do this when shipping):
  //   1. Parse + validate body with Zod.
  //   2. Look up scan + selected issues from DB.
  //   3. Verify user has a github_installation for the repo (lookup by scan
  //      domain → GitHub repo URL stored in scan metadata; OR ask user to pick).
  //   4. For each issue:
  //      a. Pull surrounding code from GitHub via getFileContent().
  //      b. Call generatePatch() with Claude Sonnet (vision for image-alt).
  //      c. Skip if Claude returns <NEEDS_HUMAN_REVIEW>.
  //   5. Open PR via openAutoFixPR() — single_pr or one_pr_per_issue depending on mode.
  //   6. Insert auto_fix_prs row with PR URL + fixes_applied JSONB.
  //   7. Return { pr_url, fixes_applied, warnings }.

  return NextResponse.json(
    {
      error: "Auto-Fix PRs not yet implemented",
      design_doc: "/.shared/launch/auto-fix-prs-design-2026-04-25.md",
      eta: "Phase 1 (alt-text + ARIA): 3-5 days from sprint start",
    },
    { status: 501 },
  );
}
