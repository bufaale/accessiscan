"use client";

import { useState } from "react";
import { Loader2, Search, AlertTriangle, CheckCircle, ArrowRight, Copy, Check, Lock } from "lucide-react";
import Link from "next/link";

// Number of fix recommendations shown free as a teaser. The rest are
// gated behind a free signup — the diagnosis (what's wrong) stays open
// so the scan still has wedge value + is shareable, but the remediation
// (how to fix, example code, VPAT, auto-fix PRs) is the paid hook.
// Rationale: through 2026-05 the fully-open scan gave away both the
// diagnosis AND the cure, so 236 paid clicks + 58 cold emails converted
// to 0 signups. Gating the cure creates the reason to sign up.
const FREE_FIX_COUNT = 1;
const SIGNUP_UTM = "/signup?utm_source=free_scan&utm_medium=gate&utm_campaign=fix_unlock";

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
  share_token?: string;
  share_url?: string;
  email_captured?: boolean;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-rose-100 text-rose-900 border-rose-200",
  serious: "bg-amber-100 text-amber-900 border-amber-200",
  moderate: "bg-sky-100 text-sky-900 border-sky-200",
};

export function FreeScannerForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeScanResponse | null>(null);

  // Post-result email capture — moved AFTER the scan ran so visitors see
  // value before giving up their email. The pre-result form was capturing
  // 0% (78 scans, 0 emails) because asking for email-up-front is too
  // friction-y when the visitor hasn't seen any score yet.
  const [claimEmail, setClaimEmail] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "sent" | "error" | "already">("idle");
  const [claimError, setClaimError] = useState<string | null>(null);

  // Permalink share state — the viral wedge.
  const [permalinkCopied, setPermalinkCopied] = useState(false);
  function publicPermalink(token: string): string {
    if (typeof window === "undefined") return `https://accessiscan.piposlab.com/scan-result/${token}`;
    return `${window.location.origin}/scan-result/${token}`;
  }
  async function copyPermalink(token: string) {
    const url = publicPermalink(token);
    try {
      await navigator.clipboard.writeText(url);
      setPermalinkCopied(true);
      setTimeout(() => setPermalinkCopied(false), 2500);
    } catch {
      // Clipboard write blocked — show prompt for manual copy
      window.prompt("Copy this public link:", url);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setClaimStatus("idle");
    setClaimEmail("");
    try {
      const res = await fetch("/api/free/wcag-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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

  async function onClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!result?.share_token || !claimEmail) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const r = await fetch(`/api/free/scan-result/${result.share_token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: claimEmail }),
      });
      const data = await r.json();
      if (r.status === 409) {
        setClaimStatus("already");
        return;
      }
      if (!r.ok || !data?.ok) {
        setClaimError(typeof data?.error === "string" ? data.error : "Couldn't send the email — try again in a moment.");
        setClaimStatus("error");
        return;
      }
      setClaimStatus("sent");
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Network error");
      setClaimStatus("error");
    } finally {
      setClaiming(false);
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
        <p className="text-xs text-slate-500">No signup. Results appear below in under 30 seconds.</p>
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
          {result.report.error ? (
            // Fetch failed (403 / 404 / timeout / DNS). Don't show 0/100
            // because the user would think the site has zero accessibility.
            // Show an explicit blocked-by-host message + the option to try
            // the full Playwright-based scan which uses a real browser UA.
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900" data-testid="scan-blocked">
              <div className="flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="h-5 w-5" />
                Couldn't scan this site
              </div>
              <p className="mt-2 break-all text-xs text-amber-800/80">{result.report.url}</p>
              <p className="mt-3">
                <span className="font-medium">{result.report.error}</span> — usually
                the site has a CDN (Cloudflare / Akamai / AWS WAF) that blocks
                automated requests. The lite scanner uses a server-to-server fetch
                that some sites reject.
              </p>
              <p className="mt-3">
                The full scan uses a real Chromium browser with a standard user
                agent and clears these blocks &gt;95% of the time.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-500">Accessibility health</p>
                <p className="font-display text-3xl font-semibold text-[#0b1f3a]">
                  {result.report.health_score}/100
                </p>
              </div>
              <p className="mt-2 break-all text-xs text-slate-500">{result.report.url}</p>
            </div>
          )}

          {result.report.issues.length === 0 && !result.report.error ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              <CheckCircle className="mb-2 h-5 w-5" />
              No top-5 WCAG failures detected on the initial HTML response. The full
              Playwright-based scan checks ~80 more rules including color contrast,
              focus order, and JS-rendered content.
            </div>
          ) : (
            <ul className="space-y-3">
              {result.report.issues.map((iss, i) => {
                const fixUnlocked = i < FREE_FIX_COUNT;
                return (
                  <li
                    key={i}
                    className={`rounded-lg border p-4 ${SEVERITY_COLOR[iss.severity]}`}
                  >
                    {/* Diagnosis — always free (rule + WCAG ref + count + severity) */}
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

                    {fixUnlocked ? (
                      <>
                        <p className="mt-3 text-xs">{iss.fix_hint}</p>
                        {iss.example && (
                          <pre className="mt-2 overflow-x-auto rounded bg-white/60 p-2 text-[11px]">
                            <code>{iss.example}</code>
                          </pre>
                        )}
                      </>
                    ) : (
                      /* Remediation gated — the paid hook */
                      <Link
                        href={SIGNUP_UTM}
                        className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-current/40 bg-white/40 px-3 py-2 text-xs font-medium hover:bg-white/70"
                        data-testid="fix-gate"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Fix steps + example code — unlock free
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Single prominent gate card after the issue list — the main
              conversion CTA. Only shown when there are gated fixes. */}
          {!result.report.error &&
          result.report.issues.length > FREE_FIX_COUNT ? (
            <div
              className="rounded-lg border-2 border-[#0b1f3a] bg-[#0b1f3a] p-5 text-white"
              data-testid="scan-unlock-cta"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4" />
                {result.report.issues.length - FREE_FIX_COUNT} more fixes ready to unlock
              </div>
              <p className="mt-2 text-sm text-white/80">
                You can see <span className="font-semibold">what&apos;s wrong</span>. Sign up free to
                see <span className="font-semibold">how to fix every issue</span> — step-by-step
                remediation, copy-paste example code, a full Playwright crawl of every page,
                auto-fix pull requests against your repo, and a VPAT 2.5 export for procurement.
              </p>
              <p className="mt-2 text-xs text-white/60">
                DOJ Title II web-accessibility deadline: April 2027. Free tier, no credit card.
              </p>
              <Link
                href={SIGNUP_UTM}
                data-testid="scan-unlock-signup"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0b1f3a] hover:bg-slate-100"
              >
                Unlock all fixes free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          {/* PUBLIC PERMALINK — the viral wedge. Surfaces the public URL
              so the visitor can share their score with their team / boss /
              consultant. Public, no signup required to view. */}
          {result.share_token ? (
            <div
              className="rounded-lg border border-sky-200 bg-sky-50 p-5"
              data-testid="scan-permalink-share"
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-900">
                PUBLIC LINK · ANYONE CAN VIEW
              </div>
              <h3 className="text-base font-semibold text-sky-950">
                Share this scorecard with your team
              </h3>
              <p className="mt-1 text-sm text-sky-900/90">
                Public link. No signup required to view. Expires in 30 days.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  aria-label="Public permalink URL for this scan"
                  title="Public permalink — click to select, then copy"
                  value={publicPermalink(result.share_token)}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-md border border-sky-300 bg-white px-3 py-2 font-mono text-xs text-slate-900"
                  data-testid="scan-permalink-input"
                />
                <button
                  type="button"
                  onClick={() => result.share_token && copyPermalink(result.share_token)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800"
                  data-testid="scan-permalink-copy"
                >
                  {permalinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {permalinkCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicPermalink(result.share_token))}&text=${encodeURIComponent(`Just scanned ${result.report.url} for WCAG 2.1 AA compliance. Score: ${result.report.health_score}/100, ${result.report.total_issue_count} issues found.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-white px-3 py-2 text-xs font-medium text-sky-900 hover:bg-sky-100"
                  data-testid="scan-share-x"
                >
                  Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicPermalink(result.share_token))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-white px-3 py-2 text-xs font-medium text-sky-900 hover:bg-sky-100"
                  data-testid="scan-share-linkedin"
                >
                  Share on LinkedIn
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`WCAG scan of ${result.report.url}`)}&body=${encodeURIComponent(`Hi,\n\nI just ran a WCAG 2.1 AA compliance scan on ${result.report.url}.\n\nScore: ${result.report.health_score}/100\nIssues found: ${result.report.total_issue_count}\n\nFull report: ${publicPermalink(result.share_token)}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-white px-3 py-2 text-xs font-medium text-sky-900 hover:bg-sky-100"
                  data-testid="scan-share-email"
                >
                  Email
                </a>
              </div>
            </div>
          ) : null}

          {/* POST-RESULT EMAIL CAPTURE — moved here from pre-result form.
              Visitors now see their score before being asked for email. */}
          {result.share_token && claimStatus !== "sent" ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 p-5"
              data-testid="scan-claim-prompt"
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                GET A COPY EMAILED
              </div>
              <h3 className="text-base font-semibold text-amber-950">
                Save this report + remediation tips
              </h3>
              <p className="mt-1 text-sm text-amber-900/90">
                We&apos;ll send you this scorecard, the top 5 fix hints, and a
                permalink you can share with your team. No newsletter, no signup.
              </p>
              <form onSubmit={onClaim} className="mt-3 flex flex-wrap gap-2">
                <input
                  type="email"
                  required
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value.slice(0, 254))}
                  placeholder="you@company.com"
                  data-testid="scan-claim-email"
                  className="min-w-0 flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={claiming || !claimEmail}
                  data-testid="scan-claim-submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428] disabled:opacity-50"
                >
                  {claiming ? "Sending…" : "Email me a copy"}
                </button>
              </form>
              {claimStatus === "error" && claimError ? (
                <p className="mt-2 text-xs text-rose-900" role="alert">
                  {claimError}
                </p>
              ) : null}
              {claimStatus === "already" ? (
                <p className="mt-2 text-xs text-amber-900">
                  This scan already has an email on file. Check your inbox.
                </p>
              ) : null}
            </div>
          ) : null}

          {claimStatus === "sent" ? (
            <div
              data-testid="scan-claim-sent"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
            >
              ✓ Sent. Check{" "}
              <span className="font-medium">{claimEmail}</span> in a minute.
            </div>
          ) : null}

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
