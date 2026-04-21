import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  pushToJira,
  pushToLinear,
  pushToGithub,
  type ScanIssueSummary,
  type JiraConfig,
  type LinearConfig,
  type GithubConfig,
} from "@/lib/trackers/push";

const bodySchema = z.object({
  provider: z.enum(["jira", "linear", "github"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; issueId: string }> },
) {
  const { id: scanId, issueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("id")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single();
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

  const { data: issue } = await supabase
    .from("scan_issues")
    .select("id, rule_id, rule_description, severity, impact, page_url, html_snippet, selector, help_url, fix_suggestion, wcag_level")
    .eq("id", issueId)
    .eq("scan_id", scanId)
    .single();
  if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

  const { data: integration } = await supabase
    .from("issue_tracker_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", parsed.data.provider)
    .eq("enabled", true)
    .single();

  if (!integration) {
    return NextResponse.json(
      { error: `${parsed.data.provider} integration not configured or disabled` },
      { status: 400 },
    );
  }

  try {
    let result;
    const summary = issue as ScanIssueSummary;
    switch (parsed.data.provider) {
      case "jira":
        if (
          !integration.jira_site ||
          !integration.jira_email ||
          !integration.jira_project_key ||
          !integration.jira_api_token
        ) {
          return NextResponse.json(
            { error: "Jira config incomplete" },
            { status: 400 },
          );
        }
        result = await pushToJira(integration as JiraConfig, summary);
        break;
      case "linear":
        if (!integration.linear_team_id || !integration.linear_api_key) {
          return NextResponse.json(
            { error: "Linear config incomplete" },
            { status: 400 },
          );
        }
        result = await pushToLinear(integration as LinearConfig, summary);
        break;
      case "github":
        if (
          !integration.github_owner ||
          !integration.github_repo ||
          !integration.github_token
        ) {
          return NextResponse.json(
            { error: "GitHub config incomplete" },
            { status: 400 },
          );
        }
        result = await pushToGithub(integration as GithubConfig, summary);
        break;
    }

    await supabase.from("issue_tracker_pushes").insert({
      user_id: user.id,
      scan_issue_id: issueId,
      provider: parsed.data.provider,
      external_id: result.external_id,
      external_url: result.external_url,
      status: "success",
    });

    return NextResponse.json({ push: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    await supabase.from("issue_tracker_pushes").insert({
      user_id: user.id,
      scan_issue_id: issueId,
      provider: parsed.data.provider,
      status: "failed",
      error_message: message,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
