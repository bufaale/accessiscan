/**
 * Deep audit scanner — the REAL engine behind the paid $149 audit (vs the free
 * tool's single-page regex `lite-scanner`). It runs the industry-standard
 * axe-core ruleset (~90 checks) inside jsdom — no headless browser needed, so
 * it runs in a normal Node serverless function — across MULTIPLE pages of the
 * target site, then aggregates the violations.
 *
 * Honest scope (unchanged): jsdom has no layout engine, so axe's color-contrast
 * and a few purely-visual rules can't run here (they're surfaced as "needs
 * manual review", consistent with our good-faith-effort framing). Everything
 * structural — alt text, names, labels, ARIA, roles, headings, landmarks,
 * duplicate ids, lang, titles — runs for real.
 */

import { JSDOM, VirtualConsole } from "jsdom";
import axe from "axe-core";
import { validateResolvedIP } from "@/lib/security/url-validator";
import { detectPlatform, type WcagFreeIssue, type WcagFreeReport, type WcagSeverity } from "@/lib/free-scan/lite-scanner";

const UA = "AccessiScan-Audit/1.0";
const PER_FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 3_000_000;
const DEFAULT_MAX_PAGES = 5;
const TOTAL_TIME_BUDGET_MS = 45_000; // stay within the webhook's maxDuration

export interface DeepScanReport extends WcagFreeReport {
  pages_scanned: number;
  pages: { url: string; issue_count: number }[];
  engine: "axe-core/jsdom";
  needs_manual_review: string[]; // rules axe couldn't fully evaluate (e.g. contrast)
}

function impactToSeverity(impact: string | null | undefined): WcagSeverity {
  if (impact === "critical") return "critical";
  if (impact === "serious") return "serious";
  return "moderate"; // moderate + minor + null
}

function wcagRefFromTags(tags: string[]): string {
  // axe tags include e.g. "wcag111", "wcag2aa". Surface the most specific SC tag.
  const sc = tags.find((t) => /^wcag\d{3,4}$/.test(t));
  if (sc) {
    const n = sc.replace("wcag", "");
    const dotted = n.length === 3 ? `${n[0]}.${n[1]}.${n[2]}` : n;
    return `WCAG ${dotted}`;
  }
  if (tags.includes("wcag2aa") || tags.includes("wcag21aa")) return "WCAG 2.1 AA";
  return "WCAG 2.1";
}

/** SSRF-guarded HTML fetch with manual redirect re-validation. Returns null on
 * any block/error so the crawl skips the page rather than failing the audit. */
async function safeFetchHtml(target: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const first = new URL(target);
    if (first.protocol !== "http:" && first.protocol !== "https:") return null;
    if (!(await validateResolvedIP(first.hostname))) return null;
  } catch {
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PER_FETCH_TIMEOUT_MS);
  try {
    let currentUrl = target;
    let res: Response;
    for (let hops = 0; ; hops += 1) {
      res = await fetch(currentUrl, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: controller.signal, redirect: "manual" });
      if (res.status >= 300 && res.status < 400 && hops < 5) {
        const loc = res.headers.get("location");
        if (!loc) break;
        const next = new URL(loc, currentUrl);
        if (next.protocol !== "http:" && next.protocol !== "https:") return null;
        if (!(await validateResolvedIP(next.hostname))) return null;
        currentUrl = next.toString();
        continue;
      }
      break;
    }
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) return null;
    return { html: new TextDecoder().decode(buf), finalUrl: res.url || currentUrl };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface AxeNode { html?: string }
interface AxeViolation { id: string; impact?: string | null; help: string; helpUrl?: string; tags: string[]; nodes: AxeNode[] }

/** Run axe-core against one HTML document inside jsdom. */
async function axeScan(html: string, url: string): Promise<{ violations: AxeViolation[]; incomplete: string[] }> {
  const virtualConsole = new VirtualConsole(); // swallow jsdom page errors
  const dom = new JSDOM(html, { url, runScripts: "outside-only", pretendToBeVisual: true, virtualConsole });
  try {
    const { window } = dom;
    (window as unknown as { eval: (s: string) => void }).eval(axe.source);
    const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: AxeViolation[]; incomplete: AxeViolation[] }> } };
    const results = await w.axe.run(window.document, {
      resultTypes: ["violations", "incomplete"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return {
      violations: results.violations ?? [],
      incomplete: (results.incomplete ?? []).map((i) => i.id),
    };
  } finally {
    dom.window.close();
  }
}

/** Discover same-origin internal links from a page's HTML, for the crawl. */
function discoverLinks(html: string, baseUrl: string, max: number): string[] {
  const origin = new URL(baseUrl).origin;
  const found = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["']/gi)) {
    if (found.size >= max) break;
    try {
      const u = new URL(m[1]!, baseUrl);
      if (u.origin !== origin) continue;
      if (!/^https?:$/.test(u.protocol)) continue;
      if (/\.(pdf|jpg|jpeg|png|gif|svg|zip|mp4|css|js|ico|woff2?)$/i.test(u.pathname)) continue;
      u.hash = "";
      const s = u.toString();
      if (s !== baseUrl) found.add(s);
    } catch {
      /* skip bad hrefs */
    }
  }
  return [...found].slice(0, max);
}

export async function scanUrlDeep(url: string, opts?: { maxPages?: number }): Promise<DeepScanReport> {
  const started = Date.now();
  const maxPages = opts?.maxPages ?? DEFAULT_MAX_PAGES;
  const out: DeepScanReport = {
    url, fetched_status: null, issues: [], total_issue_count: 0, health_score: 100,
    notes: [], pages_scanned: 0, pages: [], engine: "axe-core/jsdom", needs_manual_review: [],
  };

  const home = await safeFetchHtml(url.startsWith("http") ? url : `https://${url}`);
  if (!home) {
    out.error = "Could not fetch the target URL (blocked, unreachable, or too large).";
    out.health_score = 0;
    return out;
  }
  out.fetched_status = 200;
  out.platform = detectPlatform(home.html);

  const toScan = [home.finalUrl, ...discoverLinks(home.html, home.finalUrl, maxPages - 1)];
  const htmlByUrl = new Map<string, string>([[home.finalUrl, home.html]]);

  // rule id -> aggregated issue
  const agg = new Map<string, { rule: string; severity: WcagSeverity; count: number; wcag_ref: string; fix_hint: string; example?: string }>();
  const incompleteRules = new Set<string>();

  for (const pageUrl of toScan) {
    if (Date.now() - started > TOTAL_TIME_BUDGET_MS) { out.notes.push("Time budget reached; scanned a subset of pages."); break; }
    let html = htmlByUrl.get(pageUrl);
    if (!html) {
      const f = await safeFetchHtml(pageUrl);
      if (!f) continue;
      html = f.html;
    }
    let scan: { violations: AxeViolation[]; incomplete: string[] };
    try {
      scan = await axeScan(html, pageUrl);
    } catch {
      continue; // a single page failing must not fail the audit
    }
    out.pages_scanned += 1;
    let pageIssues = 0;
    for (const v of scan.violations) {
      pageIssues += v.nodes.length;
      const cur = agg.get(v.id);
      if (cur) {
        cur.count += v.nodes.length;
      } else {
        agg.set(v.id, {
          rule: v.help,
          severity: impactToSeverity(v.impact),
          count: v.nodes.length,
          wcag_ref: wcagRefFromTags(v.tags),
          fix_hint: v.helpUrl ? `${v.help}. Reference: ${v.helpUrl}` : v.help,
          example: v.nodes[0]?.html?.slice(0, 140),
        });
      }
    }
    for (const id of scan.incomplete) incompleteRules.add(id);
    out.pages.push({ url: pageUrl, issue_count: pageIssues });
  }

  if (out.pages_scanned === 0) {
    out.error = "The site could be fetched but no page could be analyzed.";
    out.health_score = 0;
    return out;
  }

  out.issues = [...agg.values()].sort((a, b) => {
    const order: Record<WcagSeverity, number> = { critical: 0, serious: 1, moderate: 2 };
    return order[a.severity] - order[b.severity] || b.count - a.count;
  });
  out.total_issue_count = out.issues.reduce((s, i) => s + i.count, 0);
  out.needs_manual_review = [...incompleteRules].sort();

  // Health score: penalty weighted by severity, dampened by pages scanned.
  const weight: Record<WcagSeverity, number> = { critical: 6, serious: 3, moderate: 1 };
  const penalty = out.issues.reduce((s, i) => s + weight[i.severity] * Math.min(i.count, 20), 0);
  out.health_score = Math.max(0, Math.min(100, 100 - Math.round(penalty / Math.max(1, out.pages_scanned) / 2)));

  return out;
}
