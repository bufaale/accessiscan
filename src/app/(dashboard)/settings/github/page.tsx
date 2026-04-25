import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export default async function GithubSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string; error?: string; repos?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Tier gate: Business only feature.
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const isBusinessTier = profile?.subscription_plan === "business";

  // List user's GitHub installations.
  const admin = createAdminClient();
  const db = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: installsRaw } = await db
    .from("github_installations")
    .select("id, github_installation_id, github_account_login, github_account_type, repository_selection, installed_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("installed_at", { ascending: false });
  const installs = installsRaw as Array<{
    id: string;
    github_installation_id: number;
    github_account_login: string;
    github_account_type: string | null;
    repository_selection: string | null;
    installed_at: string;
  }> | null;

  const appName = process.env.GITHUB_APP_NAME?.trim() || "accessiscan-auto-fix";
  const installUrl = `https://github.com/apps/${appName}/installations/new?state=${user.id}`;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <Github className="h-6 w-6" /> GitHub Auto-Fix integration
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Connect AccessiScan to your repository so we can open accessibility
          fix PRs directly in your codebase. Each scan can generate one PR with
          patched code for every fixable WCAG violation we find.
        </p>
      </div>

      {!isBusinessTier && (
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 text-violet-700" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-900">
                Auto-Fix PRs is a Business plan feature ($199/mo)
              </p>
              <p className="mt-1 text-sm text-violet-800">
                Upgrade to generate accessibility fix PRs from your scan results — alt text, ARIA
                labels, language attributes, and more, with code Claude Sonnet generates from the
                rendered page.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/settings/billing">Upgrade to Business</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {params.installed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
            <p className="text-sm font-medium text-green-900">
              Connected to {decodeURIComponent(params.installed)} ({params.repos === "all" ? "all repositories" : "selected repositories"}).
              You can now generate fix PRs from any scan&apos;s issue list.
            </p>
          </CardContent>
        </Card>
      )}

      {params.error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="flex-1 text-sm text-amber-900">
              <p className="font-medium">Installation failed</p>
              <p className="font-mono text-xs">{decodeURIComponent(params.error)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected installations</CardTitle>
          <CardDescription>
            Each installation maps to a GitHub user or organization that authorized AccessiScan to open PRs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!installs || installs.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No GitHub accounts connected yet.
            </div>
          ) : (
            <div className="space-y-3">
              {installs.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span className="font-medium">{i.github_account_login}</span>
                      <Badge variant="outline" className="text-xs">
                        {i.github_account_type ?? "User"}
                      </Badge>
                      <Badge variant={i.repository_selection === "all" ? "default" : "secondary"} className="text-xs">
                        {i.repository_selection === "all" ? "all repos" : "selected repos"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Installed {new Date(i.installed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://github.com/settings/installations/${i.github_installation_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage on GitHub
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Button asChild disabled={!isBusinessTier}>
              <a href={installUrl}>
                <Github className="mr-2 h-4 w-4" />
                {installs && installs.length > 0 ? "Install on another account" : "Install GitHub App"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What we access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">contents (read+write)</code> — commit fix files to a new branch.
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">pull_requests (read+write)</code> — open the PR with your fixes.
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5">metadata (read)</code> — list your repositories so you can choose where to PR.
          </p>
          <p className="pt-2">
            We never auto-merge. We only commit when you explicitly click <em>&quot;Generate fix PR&quot;</em> on a scan issue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
