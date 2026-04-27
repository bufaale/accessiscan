"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ScanIssue } from "@/types/database";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const NAVY_950 = "#071428";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const GREEN = "#16a34a";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";

// SAFE_RULES — kept in sync with src/components/auto-fix/generate-pr-button.tsx
// and the API route. Only these axe rules currently have AccessiScan
// patch-generators behind them.
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

type PanelTab = "diff" | "queue" | "commit";

interface PRPanelProps {
  scanId: string;
  scanDomain: string;
  issues: ScanIssue[];           // all issues on this scan
  isBusinessTier: boolean;
  hasGithubInstall: boolean;
  open: boolean;
  onClose: () => void;
  /** Pre-selected violation when panel was opened from a specific issue card. */
  initialSelectedId?: string | null;
}

export function PRPanel({
  scanId,
  scanDomain,
  issues,
  isBusinessTier,
  hasGithubInstall,
  open,
  onClose,
  initialSelectedId = null,
}: PRPanelProps) {
  const fixable = issues.filter((i) => SAFE_RULES.has(i.rule_id));
  const [tab, setTab] = useState<PanelTab>("diff");
  const [queueIds, setQueueIds] = useState<string[]>(() =>
    fixable.map((i) => i.id),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? fixable[0]?.id ?? null,
  );
  const [repo, setRepo] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("accessiscan.lastRepo") ?? "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  if (!open) return null;

  const queuedFixable = fixable.filter((i) => queueIds.includes(i.id));
  const selectedIssue = fixable.find((i) => i.id === selectedId) ?? null;
  const branchName = `accessiscan/auto-fix-${scanId.slice(0, 8)}`;

  function toggleQueue(id: string) {
    setQueueIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (!repo.match(/^[^/]+\/[^/]+$/)) {
      toast.error("Repo must be owner/repo (e.g. acme/website)");
      return;
    }
    if (queueIds.length === 0) {
      toast.error("Select at least one fix to include in the PR");
      return;
    }
    setSubmitting(true);
    setResultUrl(null);
    try {
      window.localStorage.setItem("accessiscan.lastRepo", repo);
      const res = await fetch("/api/github-action/auto-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scan_id: scanId,
          issue_ids: queueIds.slice(0, 20),
          repo_full_name: repo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Generate failed");
        return;
      }
      const url: string = data.pr_url ?? data.prUrl;
      setResultUrl(url);
      toast.success(`PR opened: ${queueIds.length} fixes`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside
      role="complementary"
      aria-label="Auto-Fix PR preview"
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "sticky",
        top: 16,
        height: "calc(100vh - 32px)",
        fontFamily: FONT_INTER,
      }}
    >
      <Header
        scanDomain={scanDomain}
        queued={queueIds.length}
        onClose={onClose}
      />
      <RepoBar repo={repo} branchName={branchName} onChange={setRepo} />

      <Tabs tab={tab} onTab={setTab} queueLength={queueIds.length} />

      <div style={{ flex: 1, overflowY: "auto", background: SLATE_50 }}>
        {!isBusinessTier ? (
          <BusinessTierGate />
        ) : !hasGithubInstall ? (
          <ConnectGithubGate />
        ) : tab === "diff" ? (
          <DiffView issue={selectedIssue} />
        ) : tab === "queue" ? (
          <QueueView
            fixable={fixable}
            queueIds={queueIds}
            onToggle={toggleQueue}
            onSelect={(id) => {
              setSelectedId(id);
              setTab("diff");
            }}
            selectedId={selectedId}
          />
        ) : (
          <CommitView
            scanDomain={scanDomain}
            queuedFixable={queuedFixable}
            branchName={branchName}
          />
        )}
      </div>

      <Footer
        queueLength={queueIds.length}
        submitting={submitting}
        canSubmit={isBusinessTier && hasGithubInstall && queueIds.length > 0 && !!repo.match(/^[^/]+\/[^/]+$/)}
        onSubmit={submit}
        resultUrl={resultUrl}
      />
    </aside>
  );
}

function Header({
  scanDomain,
  queued,
  onClose,
}: {
  scanDomain: string;
  queued: number;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: NAVY,
        padding: "14px 18px",
        color: "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
        aria-hidden
      />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 24,
              height: 24,
              borderRadius: 5,
              background: CYAN,
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            ✦
          </span>
          <div>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 600,
              }}
            >
              Auto-Fix PR preview · {scanDomain}
            </div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 14,
                color: "#fff",
                marginTop: 2,
              }}
            >
              {queued} {queued === 1 ? "fix" : "fixes"} queued
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close PR preview"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: 6,
            width: 26,
            height: 26,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function RepoBar({
  repo,
  branchName,
  onChange,
}: {
  repo: string;
  branchName: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${SLATE_200}`,
        background: SLATE_50,
        fontSize: 12,
        fontFamily: FONT_INTER,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <label htmlFor="prpanel-repo" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: SLATE_500, letterSpacing: "0.10em", textTransform: "uppercase" }}>
          Target repository
        </span>
        <input
          id="prpanel-repo"
          type="text"
          value={repo}
          onChange={(e) => onChange(e.target.value)}
          placeholder="owner/repo (e.g. acme/website)"
          style={{
            height: 32,
            padding: "0 10px",
            border: `1px solid ${SLATE_200}`,
            borderRadius: 5,
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: NAVY,
            background: "#fff",
            outline: "none",
          }}
        />
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: SLATE_500,
        }}
      >
        <span style={{ color: "#475569" }}>main</span>
        <span aria-hidden style={{ color: SLATE_300 }}>→</span>
        <span style={{ color: CYAN, fontWeight: 600 }}>{branchName}</span>
      </div>
    </div>
  );
}

function Tabs({
  tab,
  onTab,
  queueLength,
}: {
  tab: PanelTab;
  onTab: (t: PanelTab) => void;
  queueLength: number;
}) {
  const items: Array<[PanelTab, string]> = [
    ["diff", "Diff"],
    ["queue", `Queue (${queueLength})`],
    ["commit", "Commit"],
  ];
  return (
    <div
      role="tablist"
      style={{ display: "flex", borderBottom: `1px solid ${SLATE_200}`, padding: "0 12px", flexShrink: 0 }}
    >
      {items.map(([k, l]) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={tab === k}
          onClick={() => onTab(k)}
          style={{
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: FONT_INTER,
            color: tab === k ? NAVY : SLATE_500,
            borderBottom: tab === k ? `2px solid ${CYAN}` : "2px solid transparent",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function BusinessTierGate() {
  return (
    <div style={{ padding: 20, fontFamily: FONT_INTER }}>
      <div
        style={{
          background: "rgba(124,58,237,0.05)",
          border: "1px solid #ddd6fe",
          borderRadius: 6,
          padding: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY, marginBottom: 6 }}>
          Auto-Fix PRs is a Business plan feature
        </div>
        <p style={{ fontSize: 12.5, color: SLATE_500, marginTop: 0, marginBottom: 14 }}>
          Generate Claude-written patches for alt-text, ARIA labels, language attributes and more — all opened as a real PR against your repo.
        </p>
        <Link
          href="/settings/billing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 14px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            background: NAVY,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Upgrade to Business →
        </Link>
      </div>
    </div>
  );
}

function ConnectGithubGate() {
  return (
    <div style={{ padding: 20, fontFamily: FONT_INTER }}>
      <div
        style={{
          background: "rgba(6,182,212,0.05)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 6,
          padding: 16,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY, marginBottom: 6 }}>
          Connect GitHub to open PRs
        </div>
        <p style={{ fontSize: 12.5, color: SLATE_500, marginTop: 0, marginBottom: 14 }}>
          Install the AccessiScan GitHub App on your repo so we can open Pull Requests with the fix code.
        </p>
        <Link
          href="/settings/github"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 14px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            background: NAVY,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Install GitHub App →
        </Link>
      </div>
    </div>
  );
}

function DiffView({ issue }: { issue: ScanIssue | null }) {
  if (!issue) {
    return (
      <div style={{ padding: 22, fontFamily: FONT_INTER, fontSize: 12.5, color: SLATE_500 }}>
        Select a violation in the Queue tab to preview its fix.
      </div>
    );
  }
  const oldSnippet = issue.html_snippet ?? "(no snippet captured)";
  const newSnippet = issue.fix_suggestion ?? "// AI fix suggestion not generated yet — Pro+ tier";
  const oldLines = oldSnippet.split("\n");
  const newLines = newSnippet.split("\n");
  return (
    <div style={{ padding: 14, fontFamily: FONT_MONO, fontSize: 11.5 }}>
      {/* Header */}
      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
        <div
          style={{
            padding: "8px 12px",
            background: SLATE_100,
            borderBottom: `1px solid ${SLATE_200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO }}>
            <span style={{ color: SLATE_500 }} aria-hidden>📄</span>
            <span style={{ color: NAVY, fontWeight: 600 }}>{issue.selector ?? "(selector)"}</span>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <span style={{ color: RED, fontWeight: 600 }}>−{oldLines.length}</span>
            <span style={{ color: GREEN, fontWeight: 600 }}>+{newLines.length}</span>
          </div>
        </div>
        {/* Hunk header */}
        <div style={{ padding: "6px 12px", background: "#fafbfc", borderBottom: `1px solid ${SLATE_100}`, color: SLATE_500, fontSize: 10.5 }}>
          @@ rule: <span style={{ color: NAVY, fontWeight: 600 }}>{issue.rule_id}</span> · WCAG <span style={{ color: NAVY, fontWeight: 600 }}>{issue.wcag_level ?? "?"}</span> @@
        </div>
        {/* Old lines */}
        {oldLines.map((line, i) => (
          <div
            key={"o" + i}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 16px 1fr",
              background: "#fef2f2",
              color: "#7f1d1d",
              borderLeft: `2px solid ${RED}`,
            }}
          >
            <span style={{ padding: "3px 8px", color: "#fca5a5", textAlign: "right", borderRight: "1px solid rgba(220,38,38,0.15)", fontSize: 10 }}>
              {i + 1}
            </span>
            <span style={{ padding: "3px 0 3px 6px", color: RED }}>−</span>
            <span style={{ padding: "3px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
          </div>
        ))}
        {/* New lines */}
        {newLines.map((line, i) => (
          <div
            key={"n" + i}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 16px 1fr",
              background: "#f0fdf4",
              color: "#14532d",
              borderLeft: `2px solid ${GREEN}`,
            }}
          >
            <span style={{ padding: "3px 8px", color: "#86efac", textAlign: "right", borderRight: "1px solid rgba(22,163,74,0.15)", fontSize: 10 }}>
              {i + 1}
            </span>
            <span style={{ padding: "3px 0 3px 6px", color: GREEN }}>+</span>
            <span style={{ padding: "3px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
          </div>
        ))}
      </div>

      {/* Why this fix */}
      <div
        style={{
          padding: 12,
          background: "#ecfeff",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: 6,
          fontFamily: FONT_INTER,
          fontSize: 12,
          color: NAVY,
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#0e7490",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          ✦ Why this fix
        </div>
        <div>
          {issue.rule_description ?? "Auto-generated patch addresses the WCAG violation."}{" "}
          {issue.impact ? <span style={{ color: SLATE_500 }}>· Impact: {issue.impact}</span> : null}
        </div>
      </div>
    </div>
  );
}

function QueueView({
  fixable,
  queueIds,
  onToggle,
  onSelect,
  selectedId,
}: {
  fixable: ScanIssue[];
  queueIds: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  if (fixable.length === 0) {
    return (
      <div style={{ padding: 22, fontFamily: FONT_INTER, fontSize: 12.5, color: SLATE_500 }}>
        No auto-fixable issues found. Auto-Fix Phase 1 covers: image-alt, label, link-name,
        button-name, html-has-lang, meta-viewport. Other violations need manual review.
      </div>
    );
  }
  return (
    <div style={{ padding: 14, fontFamily: FONT_INTER }}>
      <div style={{ fontSize: 11, color: SLATE_500, marginBottom: 10, lineHeight: 1.5 }}>
        Toggle which fixes go into this PR. Each becomes a hunk in the auto-generated patch.
      </div>
      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 6, overflow: "hidden" }}>
        {fixable.map((issue, i) => {
          const checked = queueIds.includes(issue.id);
          const isSelected = selectedId === issue.id;
          const sevColor =
            issue.severity === "critical"
              ? RED
              : issue.severity === "serious"
                ? "#ea580c"
                : issue.severity === "moderate"
                  ? CYAN
                  : SLATE_500;
          return (
            <div
              key={issue.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderBottom: i === fixable.length - 1 ? "none" : `1px solid ${SLATE_100}`,
                background: isSelected ? SLATE_50 : "#fff",
                cursor: "pointer",
              }}
              onClick={() => onSelect(issue.id)}
              data-issue-id={issue.id}
            >
              <input
                type="checkbox"
                checked={checked}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggle(issue.id)}
                style={{ accentColor: CYAN, marginTop: 2 }}
                aria-label={`Include ${issue.rule_id} in PR`}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: sevColor,
                      background: `${sevColor}1a`,
                      padding: "2px 6px",
                      borderRadius: 3,
                    }}
                  >
                    {issue.rule_id}
                  </span>
                  <span style={{ fontSize: 12.5, color: NAVY, fontWeight: 600 }}>
                    {issue.rule_description ?? "(no description)"}
                  </span>
                </div>
                {issue.selector ? (
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      color: SLATE_500,
                      fontFamily: FONT_MONO,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {issue.selector}
                  </div>
                ) : null}
              </div>
              {issue.wcag_level ? (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    color: SLATE_500,
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: 3,
                    background: SLATE_100,
                    flexShrink: 0,
                  }}
                >
                  {issue.wcag_level}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommitView({
  scanDomain,
  queuedFixable,
  branchName,
}: {
  scanDomain: string;
  queuedFixable: ScanIssue[];
  branchName: string;
}) {
  const wcagIds = Array.from(
    new Set(queuedFixable.map((v) => v.rule_id).filter(Boolean)),
  ).join(", ");
  const description = `Auto-generated by AccessiScan from a recent scan of ${scanDomain}.

Fixes ${queuedFixable.length} accessibility violation${queuedFixable.length === 1 ? "" : "s"}:
${queuedFixable
  .slice(0, 6)
  .map((v) => `  • ${v.rule_id}${v.wcag_level ? ` (WCAG ${v.wcag_level})` : ""}`)
  .join("\n")}${queuedFixable.length > 6 ? `\n  • ...and ${queuedFixable.length - 6} more` : ""}

Engine: axe-core + AccessiScan AI (rule_ids: ${wcagIds})
Verified: review the diff before merging.

Co-Authored-By: AccessiScan <bot@accessiscan.com>`;

  return (
    <div style={{ padding: 14, fontFamily: FONT_INTER, fontSize: 12.5 }}>
      <Section label="PR title">
        <code style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: NAVY, background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 6, padding: "8px 10px", fontWeight: 600, display: "block" }}>
          a11y: fix {queuedFixable.length} WCAG violations on {scanDomain}
        </code>
      </Section>

      <Section label="Description">
        <pre
          style={{
            background: "#fff",
            border: `1px solid ${SLATE_200}`,
            borderRadius: 6,
            padding: 12,
            fontFamily: FONT_MONO,
            fontSize: 11.5,
            color: "#334155",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {description}
        </pre>
      </Section>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Target branch" value="main" />
        <Field label="Source branch" value={branchName} mono />
        <Field label="Reviewers" value="(your team)" />
        <Field label="Labels" value="accessibility, automated" />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: SLATE_400, fontWeight: 600, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: SLATE_400, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: NAVY,
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 5,
          padding: "6px 8px",
          fontFamily: mono ? FONT_MONO : FONT_INTER,
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Footer({
  queueLength,
  submitting,
  canSubmit,
  onSubmit,
  resultUrl,
}: {
  queueLength: number;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  resultUrl: string | null;
}) {
  if (resultUrl) {
    return (
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${SLATE_200}`, background: "rgba(22,163,74,0.05)", fontFamily: FONT_INTER }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: GREEN, marginBottom: 6 }}>
          ✓ PR opened on GitHub
        </div>
        <a
          href={resultUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: GREEN,
            textDecoration: "underline",
            fontFamily: FONT_MONO,
          }}
        >
          View on GitHub ↗
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "14px 18px",
        borderTop: `1px solid ${SLATE_200}`,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11.5,
          color: SLATE_500,
        }}
      >
        <span>
          <b style={{ color: NAVY, fontFamily: FONT_MONO }}>{queueLength}</b> {queueLength === 1 ? "fix" : "fixes"} queued
        </span>
        <span style={{ color: GREEN, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
          ✓ axe-core verified
        </span>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        style={{
          width: "100%",
          height: 40,
          padding: "0 14px",
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: FONT_INTER,
          borderRadius: 6,
          background: !canSubmit || submitting ? SLATE_300 : CYAN,
          color: "#fff",
          border: "none",
          cursor: !canSubmit || submitting ? "not-allowed" : "pointer",
          boxShadow: !canSubmit || submitting ? "none" : "0 6px 16px -8px rgba(6,182,212,0.55)",
        }}
      >
        {submitting ? "Generating..." : "Open PR on GitHub"}
      </button>
      <div style={{ fontSize: 10.5, color: SLATE_400, lineHeight: 1.5, textAlign: "center" }}>
        Patches written by Claude · review before merge · AccessiScan does not warrant legal compliance.
      </div>
    </div>
  );
}
