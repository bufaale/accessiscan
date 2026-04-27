"use client";

import { useState, useEffect, useCallback, Suspense, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";

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
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<Scan["status"] | null>(null);
  const [progress, setProgress] = useState(0);
  const [canDeepScan, setCanDeepScan] = useState(false);

  // Fetch user's plan to determine if deep scan is available
  useEffect(() => {
    async function fetchPlan() {
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
      setCanDeepScan(plan !== "free");
    }
    fetchPlan();
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
        body: JSON.stringify({ url: fullUrl, scan_type: scanType }),
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
  }, [url, scanType]);

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
