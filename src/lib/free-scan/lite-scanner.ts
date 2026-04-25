/**
 * Lightweight, single-fetch WCAG scanner used by the public /free/wcag-scanner
 * tool. Trades accuracy for speed: one HTTP GET + regex-based checks for the
 * 5 most common WCAG 2.1 AA failures.
 *
 * NOT a substitute for the real Playwright-based scanner — this exists to
 * give visitors a "did you know your site has accessibility issues?" hook
 * with a CTA to sign up for the full scan.
 */

const FETCH_TIMEOUT_MS = 8_000;
const UA = "AccessiScan-FreeTool/1.0";
const MAX_HTML_BYTES = 2_000_000; // 2MB cap

export type WcagSeverity = "critical" | "serious" | "moderate";

export interface WcagFreeIssue {
  rule: string;
  severity: WcagSeverity;
  count: number;
  example?: string;
  wcag_ref: string;
  fix_hint: string;
}

export interface WcagFreeReport {
  url: string;
  fetched_status: number | null;
  issues: WcagFreeIssue[];
  total_issue_count: number;
  health_score: number; // 0–100
  notes: string[];
  error?: string;
}

export async function scanUrlLite(url: string): Promise<WcagFreeReport> {
  const out: WcagFreeReport = {
    url,
    fetched_status: null,
    issues: [],
    total_issue_count: 0,
    health_score: 100,
    notes: [],
  };

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        signal: controller.signal,
        redirect: "follow",
      });
    } finally {
      clearTimeout(timer);
    }
    out.fetched_status = res.status;
    if (!res.ok) {
      out.error = `Fetch returned ${res.status}`;
      out.health_score = 0;
      return out;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      html = await res.text();
    } else {
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (total < MAX_HTML_BYTES) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        total += value.byteLength;
      }
      html = new TextDecoder("utf-8").decode(concat(chunks));
    }
  } catch (err) {
    out.error = err instanceof Error ? err.message : "fetch failed";
    out.health_score = 0;
    return out;
  }

  out.issues = analyzeHtml(html);
  out.total_issue_count = out.issues.reduce((acc, i) => acc + i.count, 0);
  out.health_score = computeHealthScore(out.issues);
  return out;
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((s, c) => s + c.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

export function analyzeHtml(html: string): WcagFreeIssue[] {
  const issues: WcagFreeIssue[] = [];

  // 1. Images missing alt attribute
  const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi));
  const imgsMissingAlt = imgs.filter((m) => !/\balt\s*=/.test(m[0]));
  if (imgsMissingAlt.length > 0) {
    issues.push({
      rule: "Images without alt attribute",
      severity: "critical",
      count: imgsMissingAlt.length,
      example: imgsMissingAlt[0][0].substring(0, 120),
      wcag_ref: "WCAG 1.1.1 Non-text Content (A)",
      fix_hint: "Add alt=\"...\" to every <img>. Use alt=\"\" for decorative images.",
    });
  }

  // 2. Form inputs without associated label (no id matched + no aria-label + no aria-labelledby)
  const inputs = Array.from(html.matchAll(/<(input|textarea|select)\b[^>]*>/gi));
  const labels = Array.from(html.matchAll(/<label\b[^>]*for\s*=\s*["']([^"']+)["']/gi)).map((m) => m[1]);
  const labeledIds = new Set(labels);
  const orphanInputs = inputs.filter((m) => {
    const tag = m[0];
    if (/type\s*=\s*["'](hidden|submit|button|reset)["']/i.test(tag)) return false;
    if (/aria-label\s*=/.test(tag)) return false;
    if (/aria-labelledby\s*=/.test(tag)) return false;
    const idMatch = tag.match(/\bid\s*=\s*["']([^"']+)["']/);
    if (idMatch && labeledIds.has(idMatch[1])) return false;
    return true;
  });
  if (orphanInputs.length > 0) {
    issues.push({
      rule: "Form inputs without label",
      severity: "critical",
      count: orphanInputs.length,
      example: orphanInputs[0][0].substring(0, 120),
      wcag_ref: "WCAG 1.3.1 Info and Relationships (A) + 4.1.2 Name, Role, Value (A)",
      fix_hint: "Wrap with <label> or add aria-label / aria-labelledby pointing to a heading.",
    });
  }

  // 3. <html> missing lang attribute
  const htmlTag = html.match(/<html\b[^>]*>/i);
  if (!htmlTag || !/\blang\s*=/.test(htmlTag[0])) {
    issues.push({
      rule: "Missing <html lang> attribute",
      severity: "serious",
      count: 1,
      wcag_ref: "WCAG 3.1.1 Language of Page (A)",
      fix_hint: 'Add lang attribute, e.g. <html lang="en">.',
    });
  }

  // 4. Missing viewport meta (not strictly WCAG but blocks zoom + responsive)
  if (!/<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(html)) {
    issues.push({
      rule: "Missing viewport meta tag",
      severity: "moderate",
      count: 1,
      wcag_ref: "WCAG 1.4.10 Reflow (AA)",
      fix_hint: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    });
  }

  // 5. Heading hierarchy: h1 missing OR multiple h1s OR skip from h1 to h3+
  const headingTags = Array.from(html.matchAll(/<h([1-6])\b/gi)).map((m) => parseInt(m[1], 10));
  const h1Count = headingTags.filter((l) => l === 1).length;
  if (h1Count === 0) {
    issues.push({
      rule: "No <h1> heading on page",
      severity: "serious",
      count: 1,
      wcag_ref: "WCAG 2.4.6 Headings and Labels (AA)",
      fix_hint: "Add exactly one <h1> describing the page's primary topic.",
    });
  } else if (h1Count > 1) {
    issues.push({
      rule: "Multiple <h1> headings on page",
      severity: "moderate",
      count: h1Count,
      wcag_ref: "WCAG 2.4.6 Headings and Labels (AA)",
      fix_hint: "Use a single <h1>. Demote other top-level sections to <h2>.",
    });
  }
  // Detect skips (e.g. h1 -> h3 without h2)
  let lastLevel = 0;
  let skipCount = 0;
  for (const lvl of headingTags) {
    if (lastLevel > 0 && lvl > lastLevel + 1) skipCount++;
    lastLevel = lvl;
  }
  if (skipCount > 0) {
    issues.push({
      rule: "Heading-level skips",
      severity: "moderate",
      count: skipCount,
      wcag_ref: "WCAG 2.4.6 Headings and Labels (AA) + 1.3.1 Info and Relationships (A)",
      fix_hint: "Don't skip heading levels. h1 -> h2 -> h3, never h1 -> h3.",
    });
  }

  return issues;
}

export function computeHealthScore(issues: WcagFreeIssue[]): number {
  let score = 100;
  for (const i of issues) {
    const weight = i.severity === "critical" ? 8 : i.severity === "serious" ? 4 : 2;
    score -= Math.min(weight * Math.log2(i.count + 1), 30);
  }
  return Math.max(0, Math.round(score));
}
