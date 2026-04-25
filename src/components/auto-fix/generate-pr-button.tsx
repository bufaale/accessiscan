"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GitPullRequest, Loader2, ExternalLink, Lock } from "lucide-react";

const SAFE_RULES = new Set([
  "image-alt",
  "label",
  "form-field-multiple-labels",
  "link-name",
  "button-name",
  "html-has-lang",
  "html-lang-valid",
  "meta-viewport",
]);

interface GenerateFixPRButtonProps {
  scanId: string;
  issueIds: string[];           // ALL issue ids on this scan
  issueRules: string[];         // matching rule_id per issueIds
  isBusinessTier: boolean;
  hasGithubInstall: boolean;
}

export function GenerateFixPRButton({
  scanId,
  issueIds,
  issueRules,
  isBusinessTier,
  hasGithubInstall,
}: GenerateFixPRButtonProps) {
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Filter to safe rules only.
  const fixableIssueIds = issueIds.filter((_, i) => SAFE_RULES.has(issueRules[i]));
  const fixableCount = fixableIssueIds.length;

  // Persist last-used repo for convenience.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const last = window.localStorage.getItem("accessiscan.lastRepo") ?? "";
    setRepo(last);
  }, []);

  if (!isBusinessTier) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast.info("Auto-Fix PRs are on the Business plan ($199/mo).");
          window.location.href = "/settings/billing";
        }}
      >
        <GitPullRequest className="mr-2 h-4 w-4" /> Generate fix PR
        <Badge variant="secondary" className="ml-2 text-[10px]">Business</Badge>
      </Button>
    );
  }

  if (!hasGithubInstall) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = "/settings/github";
        }}
      >
        <Lock className="mr-2 h-4 w-4" /> Connect GitHub to generate fix PR
      </Button>
    );
  }

  if (fixableCount === 0) {
    return (
      <Button variant="outline" disabled title="No issues match Phase 1 auto-fixable rules">
        <GitPullRequest className="mr-2 h-4 w-4" /> No auto-fixable issues
      </Button>
    );
  }

  async function submit() {
    if (!repo.match(/^[^/]+\/[^/]+$/)) {
      toast.error("Repo must be owner/repo (e.g. acme-corp/website)");
      return;
    }
    setLoading(true);
    setResultUrl(null);
    try {
      window.localStorage.setItem("accessiscan.lastRepo", repo);
      const res = await fetch("/api/github-action/auto-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scan_id: scanId,
          issue_ids: fixableIssueIds.slice(0, 20), // endpoint cap
          repo_full_name: repo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Generate failed");
        return;
      }
      setResultUrl(data.pr_url);
      toast.success(`PR opened: ${data.fixes_applied?.length || 0} fixes`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <GitPullRequest className="mr-2 h-4 w-4" />
          Generate fix PR ({fixableCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open accessibility fix PR</DialogTitle>
          <DialogDescription>
            We&apos;ll generate Claude-written patches for {fixableCount} fixable issue
            {fixableCount === 1 ? "" : "s"} (alt-text, ARIA labels, lang attrs) and
            open one PR with the fixes documented as a markdown report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="repo">Target repository</Label>
          <Input
            id="repo"
            placeholder="owner/repo (e.g. acme-corp/website)"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Must be a repo where you&apos;ve installed the AccessiScan GitHub App.
          </p>
        </div>
        {resultUrl ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
            <p className="font-medium text-green-900">PR opened ✓</p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-green-800 underline"
            >
              View on GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading || !repo}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Generating..." : "Open PR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
