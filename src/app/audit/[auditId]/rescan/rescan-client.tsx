"use client";

import { useState } from "react";

interface Issue { rule: string; severity: string; count: number; wcag_ref?: string }
interface Result {
  baseline: { scannedAt: string; hash: string; issueCount: number };
  rescan: { rescannedAt: string; hash: string; score: number; issueCount: number };
  diff: { resolved: Issue[]; stillOpen: Issue[]; newIssues: Issue[] };
}

export function RescanClient({ auditId, token }: { auditId: string; token: string }) {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setState("running");
    try {
      const res = await fetch(`/api/audit/${auditId}/rescan?token=${encodeURIComponent(token)}`, { method: "POST" });
      if (!res.ok) { setState("error"); return; }
      setResult(await res.json());
      setState("done");
    } catch {
      setState("error");
    }
  }

  const card: React.CSSProperties = { flex: 1, border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, minWidth: 220 };
  const list = (title: string, items: Issue[], color: string) => (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: 15, margin: "0 0 6px", color }}>{title} ({items.length})</h3>
      {items.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155" }}>
          {items.map((i, n) => (
            <li key={n}>{i.rule}{i.wcag_ref ? ` (${i.wcag_ref})` : ""} — {i.count}×</li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>None.</p>
      )}
    </div>
  );

  if (state === "idle") {
    return (
      <button onClick={run} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Run re-scan &amp; compare
      </button>
    );
  }
  if (state === "running") return <p style={{ color: "#64748b" }}>Re-scanning your site and comparing to your baseline…</p>;
  if (state === "error" || !result) return <p style={{ color: "#b91c1c" }}>Re-scan failed. Check your link includes the token from your audit email, or try again.</p>;

  const { baseline, rescan, diff } = result;
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Baseline</div>
          <div style={{ fontSize: 28, fontWeight: 800, margin: "4px 0" }}>{baseline.issueCount}</div>
          <div style={{ fontSize: 13, color: "#475569" }}>issues · {baseline.scannedAt.slice(0, 10)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Now</div>
          <div style={{ fontSize: 28, fontWeight: 800, margin: "4px 0", color: rescan.issueCount <= baseline.issueCount ? "#16a34a" : "#b91c1c" }}>{rescan.issueCount}</div>
          <div style={{ fontSize: 13, color: "#475569" }}>issues · score {rescan.score}/100 · {rescan.rescannedAt.slice(0, 10)}</div>
        </div>
      </div>
      {list("Resolved", diff.resolved, "#16a34a")}
      {list("Still open", diff.stillOpen, "#b45309")}
      {list("New since baseline", diff.newIssues, "#b91c1c")}
      <p style={{ marginTop: 18, fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
        This comparison references your original dated baseline (hash {baseline.hash.slice(0, 12)}…) and this re-scan
        (hash {rescan.hash.slice(0, 12)}…). It documents the change in detected automated issues over time. It does
        not certify compliance with WCAG 2.1 AA or the ADA. Automated checks cover ~30–40% of WCAG.
      </p>
    </div>
  );
}
