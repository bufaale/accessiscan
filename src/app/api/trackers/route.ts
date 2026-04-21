import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const upsertSchema = z.object({
  provider: z.enum(["jira", "linear", "github"]),
  enabled: z.boolean().optional(),
  jira_site: z.string().trim().max(200).optional().or(z.literal("")),
  jira_email: z.string().email().optional().or(z.literal("")),
  jira_project_key: z.string().trim().max(40).optional().or(z.literal("")),
  jira_api_token: z.string().trim().min(10).max(400).optional().or(z.literal("")),
  linear_team_id: z.string().trim().max(80).optional().or(z.literal("")),
  linear_api_key: z.string().trim().min(20).max(400).optional().or(z.literal("")),
  github_owner: z.string().trim().max(60).optional().or(z.literal("")),
  github_repo: z.string().trim().max(100).optional().or(z.literal("")),
  github_token: z.string().trim().min(20).max(400).optional().or(z.literal("")),
  github_default_labels: z.array(z.string().trim().max(40)).max(10).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("issue_tracker_integrations")
    .select("id, provider, enabled, jira_site, jira_email, jira_project_key, linear_team_id, github_owner, github_repo, github_default_labels")
    .eq("user_id", user.id);

  return NextResponse.json({ integrations: data ?? [] });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = { ...parsed.data, user_id: user.id };
  const { data, error } = await supabase
    .from("issue_tracker_integrations")
    .upsert(payload, { onConflict: "user_id,provider" })
    .select(
      "id, provider, enabled, jira_site, jira_email, jira_project_key, linear_team_id, github_owner, github_repo, github_default_labels",
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integration: data });
}
