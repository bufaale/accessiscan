"use client";

import { useState } from "react";
import { Loader2, Search, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FreeScanResponse {
  report: {
    url: string;
    fetched_status: number | null;
    issues: Array<{
      rule: string;
      severity: "critical" | "serious" | "moderate";
      count: number;
      example?: string;
      wcag_ref: string;
      fix_hint: string;
    }>;
    total_issue_count: number;
    health_score: number;
    error?: string;
  };
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-rose-100 text-rose-900 border-rose-200",
  serious: "bg-amber-100 text-amber-900 border-amber-200",
  moderate: "bg-sky-100 text-sky-900 border-sky-200",
};

export function FreeScannerForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeScanResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/free/wcag-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Scan failed");
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">URL to scan</span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com/page"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Email <span className="text-xs text-slate-500">(optional — get a follow-up tips email)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !url}
          className="inline-flex items-center gap-2 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428] disabled:opacity-50"
          data-testid="scan-submit"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Scan now
            </>
          )}
        </button>
      </form>

      {error && (
        <div
          className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          role="alert"
          data-testid="scan-error"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-4" data-testid="scan-result">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Accessibility health</p>
              <p className="font-display text-3xl font-semibold text-[#0b1f3a]">
                {result.report.health_score}/100
              </p>
            </div>
            <p className="mt-2 break-all text-xs text-slate-500">{result.report.url}</p>
            {result.report.error && (
              <p className="mt-2 text-sm text-rose-700">{result.report.error}</p>
            )}
          </div>

          {result.report.issues.length === 0 && !result.report.error ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              <CheckCircle className="mb-2 h-5 w-5" />
              No top-5 WCAG failures detected on the initial HTML response. The full
              Playwright-based scan checks ~80 more rules including color contrast,
              focus order, and JS-rendered content.
            </div>
          ) : (
            <ul className="space-y-3">
              {result.report.issues.map((iss, i) => (
                <li
                  key={i}
                  className={`rounded-lg border p-4 ${SEVERITY_COLOR[iss.severity]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlertTriangle className="h-4 w-4" />
                        {iss.rule}
                      </div>
                      <p className="mt-1 text-xs opacity-80">{iss.wcag_ref}</p>
                    </div>
                    <span className="rounded-full border border-current px-2 py-0.5 text-xs font-medium">
                      {iss.count}× · {iss.severity}
                    </span>
                  </div>
                  <p className="mt-3 text-xs">{iss.fix_hint}</p>
                  {iss.example && (
                    <pre className="mt-2 overflow-x-auto rounded bg-white/60 p-2 text-[11px]">
                      <code>{iss.example}</code>
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428]"
          >
            Run the full scan with VPAT export <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
