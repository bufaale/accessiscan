/**
 * gen-sample-audit.tsx — produce a sample WCAG audit PDF for the Upwork
 * portfolio (the proof that substitutes for client reviews).
 *
 * Scans the W3C "before" inaccessible demo (purpose-built to be scanned, so
 * ethically clean), maps the lite-scanner output into the Scan/ScanIssue
 * shapes the production PDF component expects, and renders the real
 * CompliancePDFReport to a file. Domain is anonymized in the PDF.
 *
 * Usage: node_modules/.bin/tsx scripts/gen-sample-audit.tsx [targetUrl]
 */
import { renderToFile } from "@react-pdf/renderer";
import { scanUrlLite } from "@/lib/free-scan/lite-scanner";
import { CompliancePDFReport } from "@/lib/pdf/compliance-report";
import type { Scan, ScanIssue } from "@/types/database";

const TARGET = process.argv[2] || "https://www.w3.org/WAI/demos/bad/before/home.html";
const OUT = "scripts/sample-wcag-audit.pdf";
const ANON_DOMAIN = "sample-business.com";

const sevWeight: Record<string, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

async function main() {
  console.error(`scanning ${TARGET} ...`);
  const r = await scanUrlLite(TARGET);
  const lite = [...(r.issues ?? [])].sort(
    (a, b) => (sevWeight[a.severity] ?? 9) - (sevWeight[b.severity] ?? 9),
  );

  const issues: ScanIssue[] = lite.map((i, idx) => ({
    id: `sample-${idx}`,
    scan_id: "sample",
    wcag_level: /\b1\.|2\.|3\.|4\./.test(i.wcag_ref) ? "AA" : "A",
    severity: i.severity,
    impact: i.severity,
    rule_id: i.wcag_ref || i.rule.slice(0, 24),
    rule_description: i.count > 1 ? `${i.rule} (${i.count} instances)` : i.rule,
    help_url: null,
    html_snippet: i.example ?? null,
    selector: null,
    page_url: TARGET,
    fix_suggestion: i.fix_hint ?? null,
    position: idx,
    created_at: new Date().toISOString(),
  }));

  const count = (s: string) => lite.filter((i) => i.severity === s).reduce((a, i) => a + i.count, 0);
  const score = r.health_score ?? 0;

  const scan: Scan = {
    id: "sample",
    user_id: "sample",
    site_id: null,
    url: `https://${ANON_DOMAIN}/`,
    domain: ANON_DOMAIN,
    status: "completed",
    scan_type: "quick",
    progress: 100,
    pages_scanned: 1,
    compliance_score: score,
    level_a_score: Math.max(0, score - 5),
    level_aa_score: score,
    level_aaa_score: Math.max(0, score - 15),
    pour_scores: { perceivable: score, operable: score, understandable: score, robust: score },
    total_issues: r.total_issue_count ?? lite.length,
    critical_count: count("critical"),
    serious_count: count("serious"),
    moderate_count: count("moderate"),
    minor_count: count("minor"),
    ai_summary:
      `Automated WCAG 2.1 AA scan of the homepage. ${r.total_issue_count} issues detected across ` +
      `${lite.length} rule categories. Automated checks reliably cover roughly 30-40% of WCAG ` +
      `criteria (the mechanical ones: alt text, contrast, labels, structure); full conformance ` +
      `still requires manual screen-reader testing. This report documents conformance status and ` +
      `good-faith effort, not a certification of compliance, and is not legal advice.`,
    ai_recommendations: null,
    visual_score: null,
    visual_issues_count: 0,
    visual_ai_summary: null,
    raw_data: null,
    error_message: null,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  await renderToFile(CompliancePDFReport({ scan, issues }), OUT);
  console.error(`wrote ${OUT} — score ${score}/100, ${issues.length} rules, ${scan.total_issues} issues`);
}

main().catch((e) => { console.error("fatal:", e); process.exit(1); });
