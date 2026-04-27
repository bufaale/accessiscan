"use client";

import { useEffect, useState, use, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { GenerateFixPRButton } from "@/components/auto-fix/generate-pr-button";
import { PRPanel } from "@/components/auto-fix/pr-panel";
import type { Scan, ScanIssue, ScanPage, ScanVisualIssue } from "@/types/database";

// Same SAFE_RULES as in pr-panel.tsx + generate-pr-button.tsx — used to
// know which issues can show an inline "Fix in PR" button.
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

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const GREEN = "#16a34a";
const VIOLET = "#7c3aed";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";

interface ScanWithDetails extends Scan {
  scan_issues: ScanIssue[];
  scan_visual_issues: ScanVisualIssue[];
  scan_pages: ScanPage[] | null;
}

const severityConfig: Record<
  ScanIssue["severity"],
  { label: string; color: string; bg: string }
> = {
  critical: { label: "Critical", color: RED, bg: "rgba(220,38,38,0.10)" },
  serious: { label: "Serious", color: "#ea580c", bg: "rgba(234,88,12,0.12)" },
  moderate: { label: "Moderate", color: "#ca8a04", bg: "rgba(202,138,4,0.12)" },
  minor: { label: "Minor", color: "#2563eb", bg: "rgba(37,99,235,0.10)" },
};

const wcagLevelColors: Record<string, string> = {
  A: GREEN,
  AA: "#2563eb",
  AAA: VIOLET,
};

function ScoreGauge({ score, size = "lg" }: { score: number | null; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 140 : 72;
  const stroke = size === "lg" ? 8 : 6;
  const r = 45;
  const c = 2 * Math.PI * r;
  if (score === null) {
    return (
      <div style={{ width: dim, height: dim, display: "flex", alignItems: "center", justifyContent: "center", color: SLATE_400, fontFamily: FONT_DISPLAY, fontSize: size === "lg" ? 32 : 18, fontWeight: 700 }}>
        —
      </div>
    );
  }
  const color = score >= 80 ? GREEN : score >= 50 ? "#ca8a04" : RED;
  const off = c - (score / 100) * c;
  return (
    <div style={{ position: "relative", width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" style={{ width: dim, height: dim, transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={SLATE_100} strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size === "lg" ? 36 : 18, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{score}</span>
        {size === "lg" && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: SLATE_400, marginTop: 4, fontWeight: 600 }}>/ 100</span>
        )}
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
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy code"
      style={{ width: 28, height: 28, border: `1px solid ${SLATE_200}`, borderRadius: 4, background: "#fff", color: SLATE_500, cursor: "pointer", fontSize: 12 }}
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

function StatusPill({ status }: { status: Scan["status"] }) {
  const map: Record<Scan["status"], { color: string; bg: string; label: string }> = {
    completed: { color: GREEN, bg: "rgba(22,163,74,0.10)", label: "Completed" },
    analyzing: { color: VIOLET, bg: "rgba(124,58,237,0.10)", label: "Analyzing" },
    crawling: { color: "#2563eb", bg: "rgba(37,99,235,0.10)", label: "Crawling" },
    pending: { color: SLATE_500, bg: SLATE_100, label: "Pending" },
    failed: { color: RED, bg: "rgba(220,38,38,0.10)", label: "Failed" },
  };
  const it = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 9999, background: it.bg, color: it.color, fontSize: 11, fontWeight: 600, fontFamily: FONT_INTER }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.color }} aria-hidden />
      {it.label}
    </span>
  );
}

function ActionButton({
  variant = "outline",
  href,
  download,
  onClick,
  children,
  disabled = false,
}: {
  variant?: "primary" | "outline";
  href?: string;
  download?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 36,
    padding: "0 14px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    textDecoration: "none",
    border:
      variant === "primary" ? "none" : `1px solid ${SLATE_300}`,
    background: variant === "primary" ? NAVY : "#fff",
    color: variant === "primary" ? "#fff" : NAVY,
  };
  if (href) {
    return (
      <a href={href} download={download} style={base}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  );
}

function IssueCard({
  issue,
  subscriptionPlan,
  onFixInPR,
}: {
  issue: ScanIssue;
  subscriptionPlan: string;
  onFixInPR?: (issueId: string) => void;
}) {
  const sev = severityConfig[issue.severity];
  const isFixable = SAFE_RULES.has(issue.rule_id);
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, display: "flex", gap: 14, fontFamily: FONT_INTER }}>
      <span aria-hidden style={{ width: 6, alignSelf: "stretch", borderRadius: 3, background: sev.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, color: NAVY, fontSize: 14, fontFamily: FONT_MONO }}>
            {issue.rule_id}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 4, background: sev.bg, color: sev.color, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
            {sev.label}
          </span>
          {issue.wcag_level && (
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,1)", color: wcagLevelColors[issue.wcag_level], border: `1px solid ${wcagLevelColors[issue.wcag_level]}` }}>
              WCAG {issue.wcag_level}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: NAVY, margin: 0, lineHeight: 1.55 }}>{issue.rule_description}</p>
        {issue.impact && (
          <p style={{ fontSize: 12.5, color: SLATE_500, margin: 0 }}>
            <strong style={{ color: NAVY }}>Impact:</strong> {issue.impact}
          </p>
        )}
        {issue.html_snippet && (
          <div style={{ position: "relative" }}>
            <pre style={{ background: SLATE_50, border: `1px solid ${SLATE_200}`, padding: "10px 12px", borderRadius: 6, fontSize: 11.5, color: NAVY, fontFamily: FONT_MONO, overflowX: "auto", maxHeight: 150, margin: 0 }}>
              <code>{issue.html_snippet}</code>
            </pre>
            <div style={{ position: "absolute", top: 6, right: 6 }}>
              <CopyCodeButton code={issue.html_snippet} />
            </div>
          </div>
        )}
        {issue.selector && (
          <p style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: SLATE_500, background: SLATE_100, padding: "3px 8px", borderRadius: 3, margin: 0, alignSelf: "flex-start" }}>
            {issue.selector}
          </p>
        )}
        {issue.page_url && (
          <p style={{ fontSize: 11.5, color: SLATE_500, margin: 0 }}>
            <span aria-hidden>🌐 </span>{issue.page_url}
          </p>
        )}
        {issue.fix_suggestion ? (
          <div style={{ background: "rgba(22,163,74,0.06)", border: `1px solid ${GREEN}`, borderRadius: 6, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span aria-hidden style={{ color: GREEN, flexShrink: 0, fontSize: 14 }}>✦</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: GREEN, margin: 0 }}>AI Fix Suggestion</p>
              <p style={{ fontSize: 12.5, color: NAVY, marginTop: 4, margin: "4px 0 0", lineHeight: 1.5 }}>{issue.fix_suggestion}</p>
            </div>
          </div>
        ) : subscriptionPlan === "free" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, background: SLATE_100, color: SLATE_500, fontSize: 11, fontWeight: 600, alignSelf: "flex-start" }}>
            <span aria-hidden>✦</span> Upgrade for AI fix suggestions
          </span>
        ) : null}
        {issue.help_url && (
          <a
            href={issue.help_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: CYAN, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            Learn more about this rule ↗
          </a>
        )}
        {isFixable && onFixInPR && (
          <button
            type="button"
            onClick={() => onFixInPR(issue.id)}
            data-fix-in-pr
            data-issue-id={issue.id}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 10px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT_INTER,
              borderRadius: 5,
              background: CYAN,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✦ Fix in PR
          </button>
        )}
      </div>
    </div>
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelInitialIssueId, setPanelInitialIssueId] = useState<string | null>(null);

  function openPanelWith(issueId?: string | null) {
    setPanelInitialIssueId(issueId ?? null);
    setPanelOpen(true);
  }

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_plan")
            .eq("id", user.id)
            .single();
          if (profile?.subscription_plan) {
            setSubscriptionPlan(profile.subscription_plan);
          }
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
      <div style={{ padding: 48, textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER }}>
        Loading...
      </div>
    );
  }
  if (!scan) return null;

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

  const fixableCount = scan.scan_issues.filter((i) => SAFE_RULES.has(i.rule_id)).length;
  const showPanel = panelOpen && fixableCount > 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: showPanel ? "1fr 420px" : "1fr",
        gap: 18,
        padding: "24px 28px 48px",
        color: NAVY,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{ height: 36, width: 36, border: `1px solid ${SLATE_200}`, borderRadius: 6, background: "#fff", color: SLATE_500, cursor: "pointer", fontSize: 16, flexShrink: 0 }}
          >
            ←
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
                {scan.domain}
              </h1>
              <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", background: scan.scan_type === "deep" ? "rgba(6,182,212,0.12)" : SLATE_100, color: scan.scan_type === "deep" ? CYAN : SLATE_500 }}>
                {scan.scan_type === "deep" ? "Deep scan" : "Quick scan"}
              </span>
              <StatusPill status={scan.status} />
            </div>
            <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: SLATE_500, margin: "6px 0 0" }}>{scan.url}</p>
            <p style={{ fontSize: 11.5, color: SLATE_400, margin: "4px 0 0", fontFamily: FONT_INTER }}>
              {new Date(scan.created_at).toLocaleDateString()} at {new Date(scan.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ActionButton onClick={() => router.push(`/dashboard/scans/new?url=${encodeURIComponent(scan.url)}`)}>
            ↻ Re-scan
          </ActionButton>
          <ActionButton href={`/dashboard/scans/${scan.id}/igts`}>
            ✓ Guided Tests
          </ActionButton>
          <ActionButton href={`/api/scans/${scan.id}/pdf`} download>
            ↓ PDF Report
          </ActionButton>
          {subscriptionPlan !== "free" ? (
            <>
              <ActionButton href={`/api/scans/${scan.id}/vpat`} download>
                📋 VPAT 2.5
              </ActionButton>
              <ActionButton href={`/api/scans/${scan.id}/vpat?standard=en-301-549`} download>
                🇪🇺 EN 301 549
              </ActionButton>
            </>
          ) : (
            <ActionButton
              onClick={() => {
                toast.info("VPAT 2.5 and EN 301 549 exports are on Pro and Agency plans.");
                router.push("/settings/billing");
              }}
            >
              📋 VPAT / EN 301 549 <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: SLATE_100, color: SLATE_500, marginLeft: 6 }}>PRO</span>
            </ActionButton>
          )}
          {fixableCount > 0 ? (
            <button
              type="button"
              onClick={() => openPanelWith(null)}
              data-testid="open-pr-panel"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 16px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: FONT_INTER,
                borderRadius: 6,
                background: CYAN,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 16px -8px rgba(6,182,212,0.55)",
              }}
            >
              ✦ Open Auto-Fix PR · {fixableCount} {fixableCount === 1 ? "fix" : "fixes"}
            </button>
          ) : (
            <GenerateFixPRButton
              scanId={scan.id}
              issueIds={scan.scan_issues.map((i) => i.id)}
              issueRules={scan.scan_issues.map((i) => i.rule_id)}
              isBusinessTier={subscriptionPlan === "business"}
              hasGithubInstall={hasGithubInstall}
            />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <ScoreCard label="Code Analysis" score={scan.compliance_score} large />
        <ScoreCard label="Level A" score={scan.level_a_score} accent={GREEN} />
        <ScoreCard label="Level AA" score={scan.level_aa_score} accent="#2563eb" />
        <ScoreCard label="Level AAA" score={scan.level_aaa_score} accent={VIOLET} />
        <ScoreCard label="Visual AI" score={scan.visual_score} accent={VIOLET} proGated={scan.visual_score === null && subscriptionPlan === "free"} />
      </div>

      {scan.pour_scores ? (
        <div data-testid="pour-breakdown" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <PourCard label="Perceivable" score={scan.pour_scores.perceivable} />
          <PourCard label="Operable" score={scan.pour_scores.operable} />
          <PourCard label="Understandable" score={scan.pour_scores.understandable} />
          <PourCard label="Robust" score={scan.pour_scores.robust} />
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(["critical", "serious", "moderate", "minor"] as const).map((sev) => {
          const count = issueCounts[sev];
          if (count === 0) return null;
          const cfg = severityConfig[sev];
          return (
            <span
              key={sev}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, background: cfg.bg, color: cfg.color, fontSize: 13, fontWeight: 700, fontFamily: FONT_INTER }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} aria-hidden />
              {count} {cfg.label}
            </span>
          );
        })}
      </div>

      {scan.ai_summary ? (
        <div style={{ background: "rgba(6,182,212,0.06)", border: `1px solid ${CYAN}`, borderRadius: 8, padding: 18, fontFamily: FONT_INTER }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span aria-hidden style={{ color: CYAN, fontSize: 14 }}>✦</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY }}>AI Analysis</span>
          </div>
          <p style={{ fontSize: 13, color: NAVY, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{scan.ai_summary}</p>
        </div>
      ) : subscriptionPlan === "free" ? (
        <UpsellCard
          icon="✦"
          title="Upgrade to Pro for AI Analysis"
          subtitle="Get AI-powered executive summaries and fix suggestions"
          ctaLabel="Upgrade now"
          onClick={() => router.push("/settings/billing")}
        />
      ) : null}

      {scan.scan_visual_issues && scan.scan_visual_issues.length > 0 ? (
        <VisualAISection issues={scan.scan_visual_issues} aiSummary={scan.visual_ai_summary ?? null} />
      ) : subscriptionPlan === "free" ? (
        <UpsellCard
          icon="👁"
          title="Visual AI Accessibility Analysis"
          subtitle="Upgrade to Pro to detect visual accessibility issues code scanners miss — image contrast, small touch targets, color-only indicators, and more."
          ctaLabel="Unlock Visual AI"
          onClick={() => router.push("/settings/billing")}
          accent={VIOLET}
        />
      ) : null}

      <Filters
        wcagLevel={selectedWcagLevel}
        severity={selectedSeverity}
        onWcag={setSelectedWcagLevel}
        onSeverity={setSelectedSeverity}
      />

      {scan.scan_type === "deep" && scan.scan_pages && scan.scan_pages.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, fontFamily: FONT_INTER }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY, marginBottom: 12 }}>
            Scanned pages ({scan.scan_pages.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scan.scan_pages.map((p) => {
              const active = selectedPage === p.url;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPage(active ? null : p.url)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", border: `1px solid ${active ? NAVY : SLATE_200}`, borderRadius: 6, background: active ? SLATE_50 : "#fff", cursor: "pointer", fontFamily: FONT_INTER, textAlign: "left" }}
                >
                  <span style={{ fontSize: 12.5, color: NAVY, fontFamily: FONT_MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.url}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, color: SLATE_500 }}>{p.issue_count} issues</span>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: (p.score ?? 0) >= 80 ? GREEN : (p.score ?? 0) >= 50 ? "#ca8a04" : RED }}>
                      {p.score ?? "—"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: NAVY, margin: "0 0 12px" }}>
          Issues found <span style={{ color: SLATE_500, fontWeight: 500 }}>({filteredIssues.length})</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredIssues.length === 0 ? (
            <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 32, textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER, fontSize: 13.5 }}>
              No issues match your filters.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                subscriptionPlan={subscriptionPlan}
                onFixInPR={(issueId) => openPanelWith(issueId)}
              />
            ))
          )}
        </div>
      </div>
      </div>

      {showPanel && (
        <PRPanel
          scanId={scan.id}
          scanDomain={scan.domain ?? scan.url}
          issues={scan.scan_issues}
          isBusinessTier={subscriptionPlan === "business"}
          hasGithubInstall={hasGithubInstall}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          initialSelectedId={panelInitialIssueId}
        />
      )}
    </div>
  );
}

function ScoreCard({
  label,
  score,
  large,
  accent,
  proGated,
}: {
  label: string;
  score: number | null;
  large?: boolean;
  accent?: string;
  proGated?: boolean;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT_INTER }}>
      <ScoreGauge score={score} size={large ? "lg" : "sm"} />
      <p style={{ fontSize: 12, fontWeight: 600, color: accent ?? NAVY, margin: 0, textAlign: "center" }}>
        {label}
      </p>
      {proGated && (
        <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: SLATE_100, color: SLATE_500 }}>
          PRO
        </span>
      )}
    </div>
  );
}

function PourCard({ label, score }: { label: string; score: number }) {
  const accent = score >= 85 ? GREEN : score >= 70 ? "#f59e0b" : "#dc2626";
  const description: Record<string, string> = {
    Perceivable: "Information must be presentable to users in ways they can perceive.",
    Operable: "User interface components and navigation must be operable.",
    Understandable: "Information and operation of the user interface must be understandable.",
    Robust: "Content must be robust enough for assistive technologies.",
  };
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderLeft: `3px solid ${accent}`, borderRadius: 8, padding: 16, fontFamily: FONT_INTER }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: NAVY }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: accent }}>{score}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: SLATE_100, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${Math.max(0, Math.min(100, score))}%`, height: "100%", background: accent }} />
      </div>
      <p style={{ fontSize: 11.5, color: SLATE_500, margin: 0, lineHeight: 1.4 }}>{description[label]}</p>
    </div>
  );
}

function UpsellCard({
  icon,
  title,
  subtitle,
  ctaLabel,
  onClick,
  accent = CYAN,
}: {
  icon: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${accent}`, borderRadius: 8, padding: 24, textAlign: "center", fontFamily: FONT_INTER }}>
      <div style={{ fontSize: 24, color: accent }} aria-hidden>{icon}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY, marginTop: 8 }}>
        {title}
      </div>
      <p style={{ fontSize: 13, color: SLATE_500, marginTop: 6, marginBottom: 14, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
        {subtitle}
      </p>
      <button
        type="button"
        onClick={onClick}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", fontSize: 13.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: accent, color: "#fff", border: "none", cursor: "pointer" }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function VisualAISection({
  issues,
  aiSummary,
}: {
  issues: ScanVisualIssue[];
  aiSummary: string | null;
}) {
  return (
    <div style={{ background: "rgba(124,58,237,0.05)", border: `1px solid ${VIOLET}`, borderRadius: 8, padding: 20, fontFamily: FONT_INTER }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span aria-hidden style={{ color: VIOLET, fontSize: 16 }}>👁</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY }}>Visual AI Analysis</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: VIOLET, color: "#fff" }}>NEW</span>
      </div>
      {aiSummary && (
        <p style={{ fontSize: 13, color: SLATE_700, margin: "0 0 14px", lineHeight: 1.55 }}>{aiSummary}</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {issues.map((issue) => {
          const sev = severityConfig[issue.severity];
          return (
            <div key={issue.id} style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 6, padding: 14, display: "flex", gap: 12 }}>
              <span aria-hidden style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: sev.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, color: NAVY, fontSize: 13 }}>{issue.title}</span>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 4, background: sev.bg, color: sev.color, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                    {sev.label}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: SLATE_500, margin: "6px 0 0" }}>{issue.description}</p>
                {issue.wcag_criteria && (
                  <p style={{ fontSize: 11.5, color: SLATE_500, margin: "4px 0 0" }}>
                    <strong style={{ color: NAVY }}>WCAG:</strong> {issue.wcag_criteria}
                  </p>
                )}
                {issue.location && (
                  <p style={{ fontSize: 11.5, color: SLATE_500, margin: "4px 0 0" }}>
                    🌐 {issue.location}
                  </p>
                )}
                <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(124,58,237,0.08)", border: `1px solid ${VIOLET}`, borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span aria-hidden style={{ color: VIOLET, flexShrink: 0 }}>✦</span>
                  <p style={{ fontSize: 12.5, color: NAVY, margin: 0, lineHeight: 1.5 }}>{issue.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Filters({
  wcagLevel,
  severity,
  onWcag,
  onSeverity,
}: {
  wcagLevel: "all" | "A" | "AA" | "AAA";
  severity: "all" | ScanIssue["severity"];
  onWcag: (l: "all" | "A" | "AA" | "AAA") => void;
  onSeverity: (s: "all" | ScanIssue["severity"]) => void;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 14, display: "flex", flexWrap: "wrap", gap: 18, fontFamily: FONT_INTER }}>
      <FilterGroup label="WCAG level">
        {(["all", "A", "AA", "AAA"] as const).map((l) => (
          <FilterChip key={l} active={wcagLevel === l} onClick={() => onWcag(l)}>
            {l === "all" ? "All" : l}
          </FilterChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Severity">
        {(["all", "critical", "serious", "moderate", "minor"] as const).map((s) => (
          <FilterChip key={s} active={severity === s} onClick={() => onSeverity(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </FilterChip>
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: SLATE_500, letterSpacing: "0.10em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 4 }}>{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height: 28, padding: "0 10px", fontSize: 12, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 4, background: active ? NAVY : "#fff", color: active ? "#fff" : NAVY, border: `1px solid ${active ? NAVY : SLATE_300}`, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
