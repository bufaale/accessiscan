import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayHealthScore } from "@/lib/free-scan/outcome";

export const metadata: Metadata = {
  title: "Trust Center · AccessiScan",
  description:
    "We scan our own portfolio every day with AccessiScan and publish the results. The scores below are live — pulled from the same engine our customers run.",
  openGraph: {
    title: "AccessiScan Trust Center — we eat our own dog food",
    description:
      "Live WCAG 2.1 AA scores across every Pipo Labs app, scanned daily. Same engine our customers run on themselves.",
    type: "website",
  },
};

interface PortfolioEntry {
  slug: string;
  name: string;
  url: string;
  tagline: string;
  score: number;
  total_issues: number;
  share_token: string;
  scanned_at: string;
}

const PORTFOLIO: Array<Omit<PortfolioEntry, "score" | "total_issues" | "share_token" | "scanned_at">> = [
  { slug: "accessiscan", name: "AccessiScan", url: "https://accessiscan.piposlab.com", tagline: "WCAG scanner + auto-fix PRs" },
  { slug: "aicomply", name: "AIComply", url: "https://aicomply.piposlab.com", tagline: "EU AI Act compliance · Annex IV pack" },
  { slug: "callspark", name: "CallSpark", url: "https://callspark.piposlab.com", tagline: "AI voice agents for SMB phone lines" },
  { slug: "piposlab", name: "Pipo Labs", url: "https://piposlab.com", tagline: "Portfolio parent · 16 apps shipped" },
];

async function fetchScans(): Promise<PortfolioEntry[]> {
  const admin = createAdminClient();
  const out: PortfolioEntry[] = [];
  for (const p of PORTFOLIO) {
    const { data } = await admin
      .from("public_scan_results")
      .select("id, url, report, created_at")
      .eq("url", p.url)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) continue;
    type ReportShape = {
      outcome?: "ok" | "blocked" | "failed";
      fetched_status?: number | null;
      error?: string;
      health_score?: number | null;
      total_issue_count?: number;
    };
    const report = (data.report ?? {}) as ReportShape;
    // A scan that measured nothing is not a 0. Publishing our own property as
    // "0/100" on the Trust Center because a CDN turned the scanner away would
    // be exactly the dishonesty this page exists to disprove — omit it instead.
    const score = displayHealthScore(report);
    if (score === null) continue;
    out.push({
      ...p,
      score,
      total_issues: report.total_issue_count ?? 0,
      share_token: data.id,
      scanned_at: data.created_at,
    });
  }
  return out;
}

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 90 ? "good" : score >= 75 ? "warn" : "bad";
  const bg = tone === "good" ? "bg-green-50" : tone === "warn" ? "bg-yellow-50" : "bg-red-50";
  const ring = tone === "good" ? "ring-green-400" : tone === "warn" ? "ring-yellow-400" : "ring-red-400";
  const text = tone === "good" ? "text-green-800" : tone === "warn" ? "text-yellow-800" : "text-red-800";
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full ring-2 ${ring} ${bg} ${text} px-5 py-2 text-2xl font-bold tabular-nums`}
    >
      {score}
      <span className="text-base font-medium opacity-60 ml-1">/100</span>
    </div>
  );
}

export default async function TrustCenterPage() {
  const entries = await fetchScans();

  // Compute portfolio-wide aggregates
  const totalScore = entries.length
    ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length)
    : 0;
  const passingCount = entries.filter((e) => e.score >= 90).length;
  const totalIssues = entries.reduce((s, e) => s + e.total_issues, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-sm font-medium">
        <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
        LIVE · scanned daily by AccessiScan itself
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-2">
        AccessiScan Trust Center
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl">
        We scan every Pipo Labs property with AccessiScan and publish the
        results here. Same engine, same WCAG 2.1 AA ruleset, same auto-fix
        pipeline our customers run. If something fails, you see it before we
        do.
      </p>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm text-slate-500 mb-1">Portfolio avg score</div>
          <div className="text-4xl font-bold tabular-nums text-slate-900">
            {totalScore}<span className="text-xl text-slate-400">/100</span>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm text-slate-500 mb-1">Passing (≥90)</div>
          <div className="text-4xl font-bold tabular-nums text-slate-900">
            {passingCount}<span className="text-xl text-slate-400">/{entries.length}</span>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm text-slate-500 mb-1">Open WCAG issues</div>
          <div className="text-4xl font-bold tabular-nums text-slate-900">
            {totalIssues}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Per-property scores</h2>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-lg border bg-yellow-50 p-4 text-yellow-900 text-sm">
              No scans yet — run accessiscan against any portfolio URL via
              <Link href="/free/wcag-scanner" className="underline font-medium ml-1">
                /free/wcag-scanner
              </Link>{" "}
              to populate.
            </div>
          ) : (
            entries.map((e) => (
              <Link
                key={e.slug}
                href={`/scan-result/${e.share_token}`}
                className="flex items-center justify-between rounded-xl border bg-white p-5 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900 text-lg">
                    {e.name}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">{e.tagline}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Last scanned {new Date(e.scanned_at).toISOString().slice(0, 10)} ·{" "}
                    <span className="font-mono">{e.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {e.total_issues === 0 ? "no violations" : `${e.total_issues} issue${e.total_issues === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  <ScoreBadge score={e.score} />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">Embed the badge on your site</h2>
        <p className="text-slate-300 mb-6 max-w-prose">
          One {"<script>"} tag renders a live WCAG score badge linking back
          to your scan result. Refreshes every 5 minutes from the latest
          scan. Two ways to embed:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg bg-slate-950/50 p-4 border border-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2">
              Drop-in script
            </div>
            <pre className="text-xs overflow-x-auto text-slate-100"><code>{`<script src="https://accessiscan.piposlab.com/badge/${"YOUR-DOMAIN.com"}?format=js"></script>`}</code></pre>
            <p className="text-xs text-slate-400 mt-2">
              Inserts the badge wherever the {"<script>"} tag lives. No CSS needed.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-4 border border-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2">
              SVG image (footer-ready)
            </div>
            <pre className="text-xs overflow-x-auto text-slate-100"><code>{`<a href="https://accessiscan.piposlab.com/scan-result/<TOKEN>" target="_blank" rel="noopener">
  <img src="https://accessiscan.piposlab.com/badge/${"YOUR-DOMAIN.com"}" alt="WCAG score" width="250" height="60">
</a>`}</code></pre>
            <p className="text-xs text-slate-400 mt-2">
              For when you want full control of the anchor.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2">
            Live preview — accessiscan.piposlab.com
          </div>
          <a
            href="https://accessiscan.piposlab.com/free/wcag-scanner"
            target="_blank"
            rel="noopener"
            className="inline-block bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10"
          >
            <img
              src="https://accessiscan.piposlab.com/badge/accessiscan.piposlab.com"
              alt="AccessiScan WCAG score badge live preview"
              width={250}
              height={60}
            />
          </a>
        </div>

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
            Run a free scan now
          </Link>
        </div>
      </section>

      <footer className="mt-12 text-xs text-slate-400 text-center">
        Scores update on every operator-initiated scan. Last updated{" "}
        {entries.length > 0 ? new Date(entries[0].scanned_at).toISOString().slice(0, 10) : "—"}.
      </footer>
    </main>
  );
}
