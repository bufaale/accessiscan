"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search, FileText, Download, RefreshCw, Loader2, ArrowLeft,
  CheckCircle, AlertTriangle, AlertCircle, Info, Eye,
  Globe, Shield, Copy, Check, Sparkles, ExternalLink, Code,
  FileBadge, ClipboardCheck,
} from "lucide-react";
import { GenerateFixPRButton } from "@/components/auto-fix/generate-pr-button";
import type { Scan, ScanIssue, ScanPage, ScanVisualIssue } from "@/types/database";

interface ScanWithDetails extends Scan {
  scan_issues: ScanIssue[];
  scan_visual_issues: ScanVisualIssue[];
  scan_pages: ScanPage[] | null;
}

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  contrast: { label: "Contrast", emoji: "🎨", color: "text-orange-500" },
  "text-readability": { label: "Readability", emoji: "📖", color: "text-blue-500" },
  "touch-targets": { label: "Touch Targets", emoji: "👆", color: "text-purple-500" },
  "color-only": { label: "Color Only", emoji: "🔴", color: "text-red-500" },
  "visual-hierarchy": { label: "Hierarchy", emoji: "📐", color: "text-indigo-500" },
  "image-text": { label: "Image Text", emoji: "🖼️", color: "text-pink-500" },
  "form-labeling": { label: "Form Labels", emoji: "📝", color: "text-teal-500" },
  spacing: { label: "Spacing", emoji: "↔️", color: "text-cyan-500" },
  "focus-indicators": { label: "Focus", emoji: "🎯", color: "text-yellow-500" },
  animation: { label: "Animation", emoji: "🎬", color: "text-green-500" },
};

const severityConfig: Record<ScanIssue["severity"], {
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
}> = {
  critical: { label: "Critical", icon: AlertCircle, color: "text-red-500", badgeClass: "bg-red-600 text-white" },
  serious: { label: "Serious", icon: AlertTriangle, color: "text-orange-500", badgeClass: "bg-orange-600 text-white" },
  moderate: { label: "Moderate", icon: Info, color: "text-yellow-500", badgeClass: "bg-yellow-600 text-white" },
  minor: { label: "Minor", icon: CheckCircle, color: "text-blue-500", badgeClass: "bg-blue-600 text-white" },
};

const wcagLevelColors: Record<string, string> = {
  A: "bg-green-600",
  AA: "bg-blue-600",
  AAA: "bg-purple-600",
};

function ScoreGauge({ score, size = "lg" }: { score: number | null; size?: "sm" | "lg" }) {
  const displayScore = score ?? 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const color = displayScore >= 80 ? "#16a34a" : displayScore >= 50 ? "#ca8a04" : "#dc2626";
  const dim = size === "lg" ? 160 : 80;

  if (score === null) {
    return (
      <div className={`flex items-center justify-center ${size === "lg" ? "h-40 w-40" : "h-20 w-20"}`}>
        <span className="text-muted-foreground">—</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${size === "lg" ? "text-4xl" : "text-xl"}`} style={{ color }}>
          {displayScore}
        </span>
        {size === "lg" && <span className="text-xs text-muted-foreground">/ 100</span>}
      </div>
    </div>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function IssueCard({ issue, subscriptionPlan }: { issue: ScanIssue; subscriptionPlan: string }) {
  const severity = severityConfig[issue.severity];
  const SeverityIcon = severity.icon;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <SeverityIcon className={`h-5 w-5 mt-0.5 shrink-0 ${severity.color}`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{issue.rule_id}</span>
              <Badge className={severity.badgeClass}>{severity.label}</Badge>
              {issue.wcag_level && (
                <Badge className={wcagLevelColors[issue.wcag_level]}>
                  WCAG {issue.wcag_level}
                </Badge>
              )}
            </div>

            <p className="text-sm">{issue.rule_description}</p>

            {issue.impact && (
              <p className="text-sm text-muted-foreground">
                <strong>Impact:</strong> {issue.impact}
              </p>
            )}

            {issue.html_snippet && (
              <div className="relative">
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32"><code>{issue.html_snippet}</code></pre>
                <div className="absolute top-1 right-1"><CopyCodeButton code={issue.html_snippet} /></div>
              </div>
            )}

            {issue.selector && (
              <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                {issue.selector}
              </p>
            )}

            {issue.page_url && (
              <p className="text-xs text-muted-foreground">
                <Globe className="h-3 w-3 inline mr-1" />
                {issue.page_url}
              </p>
            )}

            {issue.fix_suggestion ? (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">AI Fix Suggestion</p>
                    <p className="text-sm text-green-800 dark:text-green-200">{issue.fix_suggestion}</p>
                  </div>
                </div>
              </div>
            ) : subscriptionPlan === "free" && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Upgrade for AI fix suggestions
              </Badge>
            )}

            {issue.help_url && (
              <a
                href={issue.help_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more about this rule
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ScanResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [scan, setScan] = useState<ScanWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [hasGithubInstall, setHasGithubInstall] = useState(false);
  const [selectedWcagLevel, setSelectedWcagLevel] = useState<"all" | "A" | "AA" | "AAA">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | ScanIssue["severity"]>("all");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/scans/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setScan(data);

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_plan")
            .eq("id", user.id)
            .single();
          if (profile?.subscription_plan) {
            setSubscriptionPlan(profile.subscription_plan);
          }
          // Check whether the user has at least one active GitHub App install,
          // so the auto-fix button can show the right CTA (Connect vs Generate).
          const { data: install } = await supabase
            .from("github_installations")
            .select("id")
            .is("revoked_at", null)
            .limit(1)
            .maybeSingle();
          setHasGithubInstall(!!install);
        }
      } catch {
        toast.error("Scan not found");
        router.push("/dashboard/scans");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!scan) return null;

  // Filter issues
  const filteredIssues = scan.scan_issues.filter((issue) => {
    if (selectedWcagLevel !== "all" && issue.wcag_level !== selectedWcagLevel) return false;
    if (selectedSeverity !== "all" && issue.severity !== selectedSeverity) return false;
    if (selectedPage && issue.page_url !== selectedPage) return false;
    return true;
  });

  const issueCounts = {
    critical: scan.critical_count,
    serious: scan.serious_count,
    moderate: scan.moderate_count,
    minor: scan.minor_count,
  };

  const getStatusBadge = (status: Scan["status"]) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-600">Completed</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "crawling": return <Badge className="bg-blue-600 text-white">Crawling</Badge>;
      case "analyzing": return <Badge className="bg-purple-600 text-white">Analyzing</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{scan.domain}</h1>
              <Badge variant={scan.scan_type === "deep" ? "default" : "secondary"}>
                {scan.scan_type === "deep" ? "Deep Scan" : "Quick Scan"}
              </Badge>
              {getStatusBadge(scan.status)}
            </div>
            <p className="text-sm text-muted-foreground">{scan.url}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(scan.created_at).toLocaleDateString()} at {new Date(scan.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/scans/new?url=${encodeURIComponent(scan.url)}`)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Re-scan
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/scans/${scan.id}/igts`}>
              <ClipboardCheck className="mr-2 h-4 w-4" /> Guided Tests
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/scans/${scan.id}/pdf`} download>
              <Download className="mr-2 h-4 w-4" /> PDF Report
            </a>
          </Button>
          {subscriptionPlan !== "free" ? (
            <>
              <Button variant="outline" asChild>
                <a href={`/api/scans/${scan.id}/vpat`} download>
                  <FileBadge className="mr-2 h-4 w-4" /> VPAT 2.5
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/api/scans/${scan.id}/vpat?standard=en-301-549`} download>
                  <FileBadge className="mr-2 h-4 w-4" /> EN 301 549 (EU)
                </a>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                toast.info("VPAT 2.5 and EN 301 549 exports are on Pro and Agency plans.");
                router.push("/settings/billing");
              }}
            >
              <FileBadge className="mr-2 h-4 w-4" /> VPAT / EN 301 549
              <Badge variant="secondary" className="ml-2 text-[10px]">Pro</Badge>
            </Button>
          )}
          <GenerateFixPRButton
            scanId={scan.id}
            issueIds={scan.scan_issues.map((i) => i.id)}
            issueRules={scan.scan_issues.map((i) => i.rule_id)}
            isBusinessTier={subscriptionPlan === "business"}
            hasGithubInstall={hasGithubInstall}
          />
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="flex items-center justify-center py-6">
          <div className="text-center">
            <ScoreGauge score={scan.compliance_score} size="lg" />
            <p className="mt-2 text-sm font-medium">Code Analysis</p>
          </div>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Shield className="h-6 w-6 mb-2 text-green-600" />
            <ScoreGauge score={scan.level_a_score} size="sm" />
            <p className="mt-2 text-sm font-medium">Level A</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Shield className="h-6 w-6 mb-2 text-blue-600" />
            <ScoreGauge score={scan.level_aa_score} size="sm" />
            <p className="mt-2 text-sm font-medium">Level AA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Shield className="h-6 w-6 mb-2 text-purple-600" />
            <ScoreGauge score={scan.level_aaa_score} size="sm" />
            <p className="mt-2 text-sm font-medium">Level AAA</p>
          </CardContent>
        </Card>
        <Card className={scan.visual_score !== null ? "border-violet-200 dark:border-violet-800" : ""}>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Eye className="h-6 w-6 mb-2 text-violet-600" />
            <ScoreGauge score={scan.visual_score} size="sm" />
            <p className="mt-2 text-sm font-medium">Visual AI</p>
            {scan.visual_score === null && subscriptionPlan === "free" && (
              <Badge variant="secondary" className="mt-1 text-[10px]">Pro</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Summary */}
      <div className="flex gap-4 flex-wrap">
        {issueCounts.critical > 0 && (
          <Badge className="text-sm px-3 py-1 bg-red-600">
            <AlertCircle className="mr-1 h-3 w-3" /> {issueCounts.critical} Critical
          </Badge>
        )}
        {issueCounts.serious > 0 && (
          <Badge className="text-sm px-3 py-1 bg-orange-600">
            <AlertTriangle className="mr-1 h-3 w-3" /> {issueCounts.serious} Serious
          </Badge>
        )}
        {issueCounts.moderate > 0 && (
          <Badge className="text-sm px-3 py-1 bg-yellow-600">
            <Info className="mr-1 h-3 w-3" /> {issueCounts.moderate} Moderate
          </Badge>
        )}
        {issueCounts.minor > 0 && (
          <Badge className="text-sm px-3 py-1 bg-blue-600">
            <CheckCircle className="mr-1 h-3 w-3" /> {issueCounts.minor} Minor
          </Badge>
        )}
      </div>

      {/* AI Summary */}
      {scan.ai_summary ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{scan.ai_summary}</p>
          </CardContent>
        </Card>
      ) : subscriptionPlan === "free" && (
        <Card className="border-primary/20">
          <CardContent className="py-6 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Upgrade to Pro for AI Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered executive summaries and fix suggestions
            </p>
            <Button onClick={() => router.push("/settings/billing")}>Upgrade Now</Button>
          </CardContent>
        </Card>
      )}

      {/* Visual AI Analysis */}
      {scan.scan_visual_issues && scan.scan_visual_issues.length > 0 ? (
        <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-violet-600" /> Visual AI Analysis
              <Badge className="bg-violet-600 text-white text-[10px]">NEW</Badge>
            </CardTitle>
            {scan.visual_ai_summary && (
              <CardDescription className="text-sm leading-relaxed">
                {scan.visual_ai_summary}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scan.scan_visual_issues.map((issue) => {
                const cat = categoryConfig[issue.category] || { label: issue.category, emoji: "🔍", color: "text-gray-500" };
                const sev = severityConfig[issue.severity];
                const SevIcon = sev.icon;
                return (
                  <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border">
                    <SevIcon className={`h-5 w-5 mt-0.5 shrink-0 ${sev.color}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{issue.title}</span>
                        <Badge className={sev.badgeClass}>{sev.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {cat.emoji} {cat.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      {issue.wcag_criteria && (
                        <p className="text-xs text-muted-foreground">
                          <strong>WCAG:</strong> {issue.wcag_criteria}
                        </p>
                      )}
                      {issue.location && (
                        <p className="text-xs text-muted-foreground">
                          <Globe className="h-3 w-3 inline mr-1" />
                          {issue.location}
                        </p>
                      )}
                      <div className="mt-2 p-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded text-sm">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <p className="text-violet-900 dark:text-violet-200">{issue.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : subscriptionPlan === "free" && (
        <Card className="border-violet-200 dark:border-violet-800">
          <CardContent className="py-6 text-center">
            <Eye className="h-8 w-8 text-violet-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Visual AI Accessibility Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro to detect visual accessibility issues that code scanners miss — contrast on images, small touch targets, color-only indicators, and more.
            </p>
            <Button onClick={() => router.push("/settings/billing")} className="bg-violet-600 hover:bg-violet-700">
              <Eye className="mr-2 h-4 w-4" /> Unlock Visual AI
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">WCAG Level:</span>
              <div className="flex gap-2">
                {(["all", "A", "AA", "AAA"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={selectedWcagLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWcagLevel(level)}
                  >
                    {level === "all" ? "All" : level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Severity:</span>
              <div className="flex gap-2">
                {(["all", "critical", "serious", "moderate", "minor"] as const).map((sev) => (
                  <Button
                    key={sev}
                    variant={selectedSeverity === sev ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSeverity(sev)}
                  >
                    {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deep Scan Pages Tab */}
      {scan.scan_type === "deep" && scan.scan_pages && scan.scan_pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scanned Pages ({scan.scan_pages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scan.scan_pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(selectedPage === page.url ? null : page.url)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedPage === page.url
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{page.url}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary">{page.issue_count} issues</Badge>
                      <span className={`text-sm font-bold ${
                        (page.score ?? 0) >= 80 ? "text-green-600" :
                        (page.score ?? 0) >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {page.score ?? "—"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Issues Found ({filteredIssues.length})
        </h2>
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No issues found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} subscriptionPlan={subscriptionPlan} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
