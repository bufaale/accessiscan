import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScanLeadCapture } from "@/components/free-scan/scan-lead-capture";
import {
  deriveScanOutcome,
  displayHealthScore,
  unmeasuredHeadline,
} from "@/lib/free-scan/outcome";

// Freemium gate: diagnosis (rule + count + WCAG ref) stays free + shareable;
// remediation (fix steps) gated after the first one to create a signup reason.
// Mirrors the gate in components/free-scan/scanner-form.tsx.
const FREE_FIX_COUNT = 1;
const SIGNUP_UTM = "/signup?utm_source=free_scan&utm_medium=gate&utm_campaign=fix_unlock";

interface ScanIssue {
  rule: string;
  severity: string;
  count: number;
  example?: string;
  wcag_ref?: string;
  fix_hint?: string;
}

interface ScanReport {
  url: string;
  fetched_status?: number;
  /** Absent on rows written before the outcome contract existed. */
  outcome?: "ok" | "blocked" | "failed";
  error?: string;
  issues: ScanIssue[];
  total_issue_count: number;
  /** null (or a legacy 0 alongside an error) when nothing was measured. */
  health_score: number | null;
  notes?: string[];
}

interface PublicScanRow {
  id: string;
  url: string;
  report: ScanReport;
  created_at: string;
  view_count: number;
}

async function fetchScan(token: string): Promise<PublicScanRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("public_scan_results")
    .select("id, url, report, created_at, view_count")
    .eq("id", token)
    .single();
  if (!data) return null;
  // Best-effort: bump view_count. Ignore RLS-update failures.
  try {
    await admin
      .from("public_scan_results")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", token);
  } catch {}
  return data as PublicScanRow;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const row = await fetchScan(token);
  if (!row) {
    return { title: "Scan not found · AccessiScan" };
  }
  const score = displayHealthScore(row.report);
  if (score === null) {
    // Nothing was measured. A title claiming "0/100" would follow this page
    // into every Slack/Twitter/Google preview as a false accusation.
    const headline = unmeasuredHeadline(deriveScanOutcome(row.report));
    return {
      title: `${row.report.url} · not scanned · AccessiScan`,
      description: `${headline}, so AccessiScan's lite scan produced no score for ${row.report.url}.`,
      // Nothing to index: an unmeasured page is not a scorecard.
      robots: { index: false, follow: true },
      openGraph: {
        title: `${row.report.url} — no scan result`,
        description: headline,
        type: "article",
      },
    };
  }
  return {
    title: `${row.report.url} · WCAG ${score}/100 · AccessiScan`,
    description: `Public WCAG 2.1 AA scan of ${row.report.url}. Found ${row.report.total_issue_count} issues.`,
    openGraph: {
      title: `${row.report.url} scored ${score}/100`,
      description: `${row.report.total_issue_count} WCAG 2.1 AA violations found by AccessiScan.`,
      type: "article",
    },
  };
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === "critical"
    ? "bg-red-100 text-red-900 border-red-300"
    : severity === "serious"
      ? "bg-orange-100 text-orange-900 border-orange-300"
      : severity === "moderate"
        ? "bg-yellow-100 text-yellow-900 border-yellow-300"
        : "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${cls}`}>
      {severity}
    </span>
  );
}

function ScoreCard({ score, totalIssues }: { score: number; totalIssues: number }) {
  const tone = score >= 90 ? "good" : score >= 75 ? "warn" : "bad";
  const ring = tone === "good" ? "ring-green-500" : tone === "warn" ? "ring-yellow-500" : "ring-red-500";
  const text = tone === "good" ? "text-green-700" : tone === "warn" ? "text-yellow-700" : "text-red-700";
  return (
    <div className={`flex items-center gap-6 rounded-2xl border-2 bg-white p-6 ring-4 ${ring}`}>
      <div className={`text-6xl font-bold ${text}`}>{score}<span className="text-3xl text-slate-500">/100</span></div>
      <div className="text-slate-700">
        <div className="text-2xl font-semibold">{totalIssues} WCAG violation{totalIssues === 1 ? "" : "s"}</div>
        <div className="text-sm text-slate-500 mt-1">measured against WCAG 2.1 Level AA</div>
      </div>
    </div>
  );
}

/**
 * The scan never read the page (bot protection, 404, DNS). Show that plainly.
 *
 * Rendering `ScoreCard` here — 0/100, "0 WCAG violations" — is a public,
 * shareable, Google-indexable claim about a site we never looked at. This
 * replaces it.
 */
function UnmeasuredCard({ report }: { report: ScanReport }) {
  const outcome = deriveScanOutcome(report);
  return (
    <div
      className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6"
      data-testid={outcome === "blocked" ? "scan-blocked" : "scan-failed"}
    >
      <div className="text-2xl font-semibold text-amber-950">
        {unmeasuredHeadline(outcome)}
      </div>
      <p className="mt-2 text-sm text-amber-900">
        There is no score and no issue list for this scan: the lite scanner never
        received the page, so there was nothing to grade. This is not a finding
        about the site&apos;s accessibility — in either direction.
      </p>
      <p className="mt-3 text-sm text-amber-900/90">
        {outcome === "blocked"
          ? `The server answered ${report.fetched_status ?? "with a refusal"}, which normally means a CDN or WAF turned away the plain server-to-server request the lite scanner makes.`
          : report.error
            ? `The request ended with: ${report.error}.`
            : "The request didn't complete."}
      </p>
    </div>
  );
}

export default async function PublicScanResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const row = await fetchScan(token);
  if (!row) notFound();
  const report = row.report;
  const dateStr = new Date(row.created_at).toISOString().slice(0, 10);
  // null = nothing was measured (blocked / unreachable), including on legacy
  // rows that were persisted with a literal health_score of 0.
  const score = displayHealthScore(report);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 text-sm text-slate-500">
        Scanned {dateStr} ·{" "}
        <Link href="/free/wcag-scanner" className="font-medium text-blue-600 hover:underline">
          Run your own scan
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 break-all">
        {report.url}
      </h1>
      <div className="text-slate-600 mb-8">WCAG 2.1 AA conformance scan · AccessiScan</div>

      {score === null ? (
        <UnmeasuredCard report={report} />
      ) : (
        <ScoreCard score={score} totalIssues={report.total_issue_count} />
      )}

      {/* No email capture on an unmeasured scan — there is no scorecard to
          send, and promising one would be a lie. */}
      {score === null ? null : (
        <ScanLeadCapture token={token} url={report.url} score={score} />
      )}

      {score !== null && report.issues && report.issues.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Top findings</h2>
          <div className="space-y-4">
            {report.issues.slice(0, 12).map((iss, i) => {
              // Diagnosis (rule + count + WCAG ref) free; remediation gated
              // after the first one. Same freemium gate as the live scanner.
              const fixUnlocked = i < FREE_FIX_COUNT;
              return (
                <div key={i} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="font-semibold text-slate-900">{iss.rule}</h3>
                    <SeverityBadge severity={iss.severity} />
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    Occurrences: <span className="font-medium">{iss.count}</span>
                    {iss.wcag_ref ? <span> · {iss.wcag_ref}</span> : null}
                  </div>
                  {fixUnlocked && iss.fix_hint ? (
                    <p className="text-sm text-slate-700 bg-slate-50 rounded p-3 mt-2">
                      <span className="font-medium">Fix:</span> {iss.fix_hint}
                    </p>
                  ) : iss.fix_hint ? (
                    <Link
                      href={SIGNUP_UTM}
                      className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Fix steps — unlock free
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : score === null ? (
        // Unmeasured: "no violations found" would be the same lie as 0/100.
        null
      ) : (
        <section className="mt-10 rounded-lg border bg-green-50 p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            No WCAG 2.1 AA violations found in this lite scan
          </h2>
          <p className="text-sm text-green-800">
            The full Playwright-based scan catches more — including focus
            management, ARIA dynamic content, and dynamic state announcements.
            That's what the paid plan ships.
          </p>
        </section>
      )}

      <section className="mt-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">Run the full scan with auto-fix PRs</h2>
        <p className="text-slate-300 mb-6 max-w-prose">
          This is the lite scan. The paid plan adds: Playwright crawl of up to 250
          pages, continuous monitoring, and auto-fix pull requests
          generated directly against your GitHub repo. Pricing starts at $39/mo;
          a VPAT 2.5 export for procurement comes with the $149 audit.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-white text-slate-900 px-5 py-2.5 font-semibold hover:bg-slate-100"
          >
            See pricing
          </Link>
          <Link
            href="/free/wcag-scanner"
            className="rounded-lg border border-white/30 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            Scan another URL
          </Link>
        </div>
      </section>

      <footer className="mt-12 text-xs text-slate-400 text-center">
        AccessiScan · piposlab.com · WCAG 2.1 AA conformance scanner
      </footer>
    </main>
  );
}
