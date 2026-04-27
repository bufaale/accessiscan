"use client";

import { useState, useEffect, useCallback, Suspense, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import type { Scan } from "@/types/database";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const NAVY_HOVER = "#071428";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const GREEN = "#16a34a";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";

type WcagLevel = "2.1-A" | "2.1-AA" | "2.2-AA" | "AAA";
const WCAG_LEVELS: { value: WcagLevel; label: string; hint: string }[] = [
  { value: "2.1-A", label: "2.1 A", hint: "Minimum" },
  { value: "2.1-AA", label: "2.1 AA", hint: "DOJ Title II · default" },
  { value: "2.2-AA", label: "2.2 AA", hint: "Latest standard" },
  { value: "AAA", label: "AAA", hint: "Aspirational" },
];

interface RecentScan {
  id: string;
  url: string;
  domain: string;
  status: Scan["status"];
  compliance_score: number | null;
  created_at: string;
}

interface GithubInstall {
  github_account_login: string;
}

const statusMessages: Record<Scan["status"], string> = {
  pending: "Waiting to start...",
  crawling: "Loading page and running accessibility checks...",
  analyzing: "Analyzing results and generating fixes...",
  completed: "Scan complete!",
  failed: "Scan failed",
};

const statusColors: Record<Scan["status"], string> = {
  pending: SLATE_400,
  crawling: "#2563eb",
  analyzing: "#7c3aed",
  completed: "#16a34a",
  failed: RED,
};

export default function NewScanPage() {
  return (
    <Suspense>
      <NewScanContent />
    </Suspense>
  );
}

function NewScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") ?? "");
  const [scanType, setScanType] = useState<"quick" | "deep">("quick");
  const [wcagLevel, setWcagLevel] = useState<WcagLevel>("2.1-AA");
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<Scan["status"] | null>(null);
  const [progress, setProgress] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("free");
  const [canDeepScan, setCanDeepScan] = useState(false);
  const [githubInstall, setGithubInstall] = useState<GithubInstall | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const isBusinessTier = subscriptionPlan === "business";
  const hasGithubInstall = !!githubInstall;

  // Fetch user's plan + GitHub install state in one effect
  useEffect(() => {
    async function fetchProfileAndInstall() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", user.id)
        .single();

      const plan = profile?.subscription_plan ?? "free";
      setSubscriptionPlan(plan);
      setCanDeepScan(plan !== "free");

      const { data: install } = await supabase
        .from("github_installations")
        .select("github_account_login")
        .is("revoked_at", null)
        .limit(1)
        .maybeSingle();
      if (install) {
        setGithubInstall({ github_account_login: install.github_account_login });
        // Default toggle ON when Business + connected
        if (plan === "business") setAutoFixEnabled(true);
      }
    }
    fetchProfileAndInstall();
  }, []);

  // Fetch recent scans for "Recently scanned" section
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/scans?limit=5");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data?.scans)) {
          setRecentScans(data.scans as RecentScan[]);
        }
      } catch {
        /* ignore */
      }
    }
    fetchRecent();
  }, []);

  const handleScanUpdate = useCallback(
    (updated: { status: Scan["status"]; progress: number }) => {
      setStatus(updated.status);
      setProgress(updated.progress);

      if (updated.status === "completed") {
        toast.success("Scan complete!");
        setTimeout(() => router.push(`/dashboard/scans/${scanId}`), 1500);
      } else if (updated.status === "failed") {
        toast.error("Scan failed. Please try again.");
        setLoading(false);
      }
    },
    [scanId, router],
  );

  // Subscribe to scan updates via Supabase Realtime
  useEffect(() => {
    if (!scanId) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scans",
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          const updated = payload.new as { status: Scan["status"]; progress: number };
          handleScanUpdate(updated);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, handleScanUpdate]);

  // Polling fallback in case Realtime WebSocket fails
  useEffect(() => {
    if (!scanId || status === "completed" || status === "failed") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status !== status || data.progress !== progress) {
          handleScanUpdate({ status: data.status, progress: data.progress });
        }
      } catch {
        /* ignore polling errors */
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [scanId, status, progress, handleScanUpdate]);

  const handleSubmit = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a URL");
      return;
    }
    let fullUrl = trimmed;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }
    try {
      new URL(fullUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setStatus("pending");
    setProgress(0);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fullUrl,
          scan_type: scanType,
          // wcag_level + generate_auto_fix are forward-compat fields. The
          // current /api/scans Zod schema ignores extras, so sending these
          // does not break the existing happy path.
          wcag_level: wcagLevel,
          generate_auto_fix: autoFixEnabled && isBusinessTier && hasGithubInstall,
        }),
      });
      if (res.status === 403) {
        const data = await res.json();
        toast.error(data.error || "Deep scans require a Pro plan. Please upgrade.");
        setLoading(false);
        setStatus(null);
        return;
      }
      if (res.status === 429) {
        const data = await res.json();
        toast.error(data.error || "Monthly scan limit reached. Upgrade your plan.");
        setLoading(false);
        setStatus(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to start scan");
        setLoading(false);
        setStatus(null);
        return;
      }
      const data = await res.json();
      setScanId(data.scanId);
      toast.success("Scan started! Monitoring progress...");
    } catch {
      toast.error("Failed to start scan. Please try again.");
      setLoading(false);
      setStatus(null);
    }
  }, [url, scanType, wcagLevel, autoFixEnabled, isBusinessTier, hasGithubInstall]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          New Accessibility Scan
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER }}>
          Check your website for WCAG 2.1 AA compliance issues — full Playwright render, AI fix suggestions.
        </p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24, maxWidth: 640 }}>
        <label htmlFor="scan-url" style={{ display: "block", fontFamily: FONT_INTER, fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
          Website URL
        </label>
        <input
          id="scan-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
          disabled={loading}
          placeholder="https://example.com"
          style={{ width: "100%", height: 44, padding: "0 14px", border: `1px solid ${SLATE_200}`, borderRadius: 6, fontSize: 14, fontFamily: FONT_INTER, color: NAVY, background: loading ? SLATE_50 : "#fff", outline: "none" }}
        />

        <div style={{ marginTop: 18 }}>
          <span style={{ fontFamily: FONT_INTER, fontSize: 13, fontWeight: 600, color: NAVY }}>Scan type</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <ScanTypeOption
              selected={scanType === "quick"}
              disabled={loading}
              onClick={() => setScanType("quick")}
              title="Quick scan"
              subtitle="Single page · ~30s"
            />
            <ScanTypeOption
              selected={scanType === "deep"}
              disabled={loading || !canDeepScan}
              locked={!canDeepScan}
              onClick={() => canDeepScan && setScanType("deep")}
              title="Deep scan"
              subtitle={canDeepScan ? "Up to 10 pages · ~2 min" : "Pro tier"}
            />
          </div>
        </div>

        <WcagLevelSelector
          value={wcagLevel}
          disabled={loading}
          onChange={setWcagLevel}
        />

        <AutoFixSection
          enabled={autoFixEnabled}
          disabled={loading}
          isBusinessTier={isBusinessTier}
          install={githubInstall}
          onToggle={() => setAutoFixEnabled((v) => !v)}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          style={{ width: "100%", marginTop: 18, height: 44, padding: "0 18px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: loading || !url.trim() ? SLATE_300 : NAVY, color: "#fff", border: "none", cursor: loading || !url.trim() ? "not-allowed" : "pointer" }}
        >
          {loading ? "Scanning..." : "Run Scan"}
        </button>

        {status && (
          <ScanProgress
            status={status}
            progress={progress}
            scanId={scanId}
            onViewResults={() => scanId && router.push(`/dashboard/scans/${scanId}`)}
          />
        )}
      </div>

      {!status && (
        <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 20, maxWidth: 640 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY, marginBottom: 12 }}>
            What we check
          </div>
          <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 12.5, color: SLATE_500, listStyle: "none", padding: 0, margin: 0, fontFamily: FONT_INTER }}>
            {[
              "Color contrast ratios",
              "Keyboard navigation",
              "Form labels and ARIA",
              "Image alt text",
              "Heading structure",
              "Link text clarity",
              "Document language",
              "AI-powered fix suggestions",
            ].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: CYAN, flexShrink: 0 }} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!status && recentScans.length > 0 && (
        <RecentlyScanned scans={recentScans} />
      )}
    </div>
  );
}

function WcagLevelSelector({
  value,
  disabled,
  onChange,
}: {
  value: WcagLevel;
  disabled: boolean;
  onChange: (next: WcagLevel) => void;
}) {
  return (
    <div style={{ marginTop: 18 }} data-testid="wcag-level-selector">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_INTER, fontSize: 13, fontWeight: 600, color: NAVY }}>WCAG level</span>
        <span style={{ fontFamily: FONT_INTER, fontSize: 11.5, color: SLATE_500 }}>
          VPAT 2.5 maps A & AA. AAA is rarely required.
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label="WCAG level"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${WCAG_LEVELS.length}, 1fr)`,
          background: SLATE_50,
          border: `1px solid ${SLATE_200}`,
          borderRadius: 6,
          padding: 3,
          gap: 2,
        }}
      >
        {WCAG_LEVELS.map((opt) => {
          const active = opt.value === value;
          const containerStyle: CSSProperties = {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
            padding: "8px 10px",
            borderRadius: 4,
            background: active ? "#fff" : "transparent",
            border: 0,
            boxShadow: active ? "0 1px 2px rgba(15,23,42,.06), 0 0 0 1px #cbd5e1" : "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            textAlign: "left",
            fontFamily: FONT_INTER,
            transition: "background .15s",
          };
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active ? "true" : "false"}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              style={containerStyle}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? NAVY : "#475569" }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 11, color: active ? SLATE_500 : SLATE_400 }}>{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AutoFixSection({
  enabled,
  disabled,
  isBusinessTier,
  install,
  onToggle,
}: {
  enabled: boolean;
  disabled: boolean;
  isBusinessTier: boolean;
  install: GithubInstall | null;
  onToggle: () => void;
}) {
  const hasInstall = !!install;
  // Toggle is interactive only for Business tier WITH an install
  const toggleDisabled = disabled || !isBusinessTier || !hasInstall;

  let badge: { label: string; bg: string; color: string; border?: string };
  let hint: React.ReactNode;
  let cta: React.ReactNode = null;

  if (!isBusinessTier) {
    badge = { label: "BUSINESS TIER", bg: SLATE_100, color: SLATE_500 };
    hint = (
      <>
        Auto-Fix PRs are available on the Business plan.{" "}
        <Link
          href="/settings/billing"
          style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}
        >
          Upgrade →
        </Link>
      </>
    );
  } else if (!hasInstall) {
    badge = { label: "NOT CONNECTED", bg: SLATE_100, color: SLATE_500 };
    hint = <>Connect the AccessiScan GitHub App to enable Auto-Fix PRs.</>;
    cta = (
      <Link
        href="/settings/github"
        style={{
          fontFamily: FONT_INTER,
          fontSize: 12,
          fontWeight: 600,
          color: NAVY,
          textDecoration: "none",
          marginTop: 6,
          display: "inline-block",
        }}
      >
        Connect GitHub →
      </Link>
    );
  } else {
    badge = {
      label: "CONNECTED",
      bg: "#ecfeff",
      color: NAVY,
      border: "1px solid rgba(6,182,212,0.35)",
    };
    hint = (
      <>
        Opens a PR against{" "}
        <span
          style={{
            fontFamily: FONT_MONO,
            color: NAVY,
            fontWeight: 600,
          }}
        >
          {install.github_account_login}
        </span>{" "}
        with patches for safe rules.
      </>
    );
  }

  return (
    <div
      data-testid="auto-fix-section"
      style={{
        marginTop: 18,
        padding: 14,
        border: `1px solid ${SLATE_200}`,
        borderRadius: 6,
        background: SLATE_50,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>
              Generate Auto-Fix PR
            </span>
            <span
              data-testid="auto-fix-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.10em",
                background: badge.bg,
                color: badge.color,
                border: badge.border,
              }}
            >
              {badge.label}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: SLATE_500,
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {hint}
          </div>
          {cta}
        </div>
        <Toggle
          checked={enabled && !toggleDisabled}
          disabled={toggleDisabled}
          onChange={onToggle}
          ariaLabel="Generate Auto-Fix PR"
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? "true" : "false"}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange()}
      style={{
        width: 38,
        height: 22,
        padding: 2,
        border: 0,
        borderRadius: 9999,
        background: disabled ? SLATE_200 : checked ? CYAN : SLATE_300,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        position: "relative",
        transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transform: `translateX(${checked ? 16 : 0}px)`,
          transition: "transform .15s",
          boxShadow: "0 1px 2px rgba(15,23,42,.18)",
        }}
      />
    </button>
  );
}

function RecentlyScanned({ scans }: { scans: RecentScan[] }) {
  function scoreColor(score: number | null): string {
    if (score === null) return SLATE_300;
    if (score >= 90) return GREEN;
    if (score >= 80) return NAVY;
    return RED;
  }
  function timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const m = Math.floor(diff / 60_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function statusLabel(status: Scan["status"]): string {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      case "crawling":
        return "Crawling";
      case "analyzing":
        return "Analyzing";
      default:
        return status;
    }
  }

  return (
    <div
      data-testid="recently-scanned"
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        overflow: "hidden",
        maxWidth: 640,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${SLATE_100}`,
        }}
      >
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY }}>
          Recently scanned
        </span>
        <Link
          href="/dashboard/scans"
          style={{
            fontSize: 12,
            color: SLATE_500,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          View all <span style={{ color: CYAN }}>→</span>
        </Link>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {scans.map((scan, i) => {
          const color = scoreColor(scan.compliance_score);
          const isLast = i === scans.length - 1;
          return (
            <li
              key={scan.id}
              data-scan-id={scan.id}
              style={{
                borderBottom: isLast ? "none" : `1px solid ${SLATE_100}`,
              }}
            >
              <Link
                href={`/dashboard/scans/${scan.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 18px",
                  fontSize: 13,
                  textDecoration: "none",
                  color: NAVY,
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    color: NAVY,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {scan.domain || scan.url}
                </span>
                <span style={{ color: SLATE_400, fontSize: 12 }}>
                  {timeAgo(scan.created_at)}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: SLATE_100,
                    color: SLATE_500,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {statusLabel(scan.status)}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color,
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {scan.compliance_score ?? "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ScanTypeOption({
  selected,
  disabled,
  locked,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  disabled: boolean;
  locked?: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  const containerStyle: CSSProperties = {
    position: "relative",
    border: `2px solid ${selected ? NAVY : SLATE_200}`,
    background: selected ? "#fff" : SLATE_50,
    borderRadius: 6,
    padding: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    fontFamily: FONT_INTER,
    textAlign: "left",
    width: "100%",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: NAVY }}>{title}</span>
        {locked && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: NAVY_HOVER, background: SLATE_100, padding: "2px 6px", borderRadius: 3 }}>
            Pro
          </span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: SLATE_500, marginTop: 4 }}>{subtitle}</div>
    </button>
  );
}

function ScanProgress({
  status,
  progress,
  scanId,
  onViewResults,
}: {
  status: Scan["status"];
  progress: number;
  scanId: string | null;
  onViewResults: () => void;
}) {
  return (
    <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${SLATE_200}`, fontFamily: FONT_INTER }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{statusMessages[status]}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: SLATE_500 }}>{progress}%</span>
      </div>
      <div style={{ height: 6, background: SLATE_100, borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{ width: `${progress}%`, height: "100%", background: statusColors[status], transition: "width .4s ease" }}
        />
      </div>
      {status === "completed" && scanId && (
        <button
          type="button"
          onClick={onViewResults}
          style={{ width: "100%", marginTop: 18, height: 40, padding: "0 16px", fontSize: 13.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: CYAN, color: "#fff", border: "none", cursor: "pointer" }}
        >
          View Results →
        </button>
      )}
    </div>
  );
}
