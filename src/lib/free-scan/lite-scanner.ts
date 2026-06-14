/**
 * Lightweight, single-fetch WCAG scanner used by the public /free/wcag-scanner
 * tool. Trades accuracy for speed: one HTTP GET + regex-based checks for 13
 * high-impact WCAG 2.1 AA failures (alt text, labels, headings, buttons/links
 * without accessible names, duplicate IDs, untitled iframes, data tables
 * without <th>, missing skip-to-content, page title, etc.).
 *
 * NOT a substitute for the real Playwright-based scanner — this exists to
 * give visitors a "did you know your site has accessibility issues?" hook
 * with a CTA to sign up for the full scan.
 */

import { validateResolvedIP } from "@/lib/security/url-validator";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 5;
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
      // Follow redirects MANUALLY so each hop's destination is re-validated
      // against SSRF (a public host can 302 to an internal IP; redirect:"follow"
      // would chase it without re-checking). Preserves legit http->https/www
      // redirects while blocking redirect-to-private-IP.
      let currentUrl = url;
      let hops = 0;
      for (;;) {
        res = await fetch(currentUrl, {
          headers: { "User-Agent": UA, Accept: "text/html" },
          signal: controller.signal,
          redirect: "manual",
        });
        if (res.status >= 300 && res.status < 400 && hops < MAX_REDIRECTS) {
          const loc = res.headers.get("location");
          if (!loc) break;
          const next = new URL(loc, currentUrl);
          if (next.protocol !== "http:" && next.protocol !== "https:") {
            out.error = "Unsupported redirect protocol";
            out.health_score = 0;
            return out;
          }
          if (!(await validateResolvedIP(next.hostname))) {
            out.error = "Redirect resolves to a private or unresolvable address";
            out.health_score = 0;
            return out;
          }
          currentUrl = next.toString();
          hops += 1;
          continue;
        }
        break;
      }
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

  // ─── 8 additional checks added 2026-05-14 to fix the conversion gap
  // The 5 checks above pass on most modern .gov sites because static SSR
  // generators set lang/viewport/h1 by default — so visitors see "100/100"
  // and lose the upgrade motivation. These 8 catch the issues every
  // government site DOES have: icon-only buttons without aria-label,
  // empty links, duplicate ids from legacy CMS, untitled iframes
  // (embedded videos/maps), data tables without <th>, missing
  // skip-to-content link. Same regex approach — no DOM/CSS parsing
  // needed.

  // 6. Buttons with no accessible name (icon-only, no aria-label, no inner text)
  const buttons = Array.from(html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi));
  const buttonsNoName = buttons.filter(([, attrs, inner]) => {
    if (/aria-label\s*=\s*["'][^"']+["']/i.test(attrs)) return false;
    if (/aria-labelledby\s*=/i.test(attrs)) return false;
    if (/title\s*=\s*["'][^"']+["']/i.test(attrs)) return false;
    const text = inner.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
  });
  if (buttonsNoName.length > 0) {
    issues.push({
      rule: "Buttons without accessible name",
      severity: "critical",
      count: buttonsNoName.length,
      example: buttonsNoName[0][0].substring(0, 120),
      wcag_ref: "WCAG 4.1.2 Name, Role, Value (A)",
      fix_hint: "Add aria-label or visible text. Icon-only buttons need aria-label=\"close\" etc.",
    });
  }

  // 7. Links without accessible text (empty <a>, icon links missing aria-label)
  const links = Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi));
  const emptyLinks = links.filter(([, attrs, inner]) => {
    if (!/href\s*=/i.test(attrs)) return false;
    if (/aria-label\s*=\s*["'][^"']+["']/i.test(attrs)) return false;
    if (/aria-labelledby\s*=/i.test(attrs)) return false;
    if (/title\s*=\s*["'][^"']+["']/i.test(attrs)) return false;
    const text = inner.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
  });
  if (emptyLinks.length > 0) {
    issues.push({
      rule: "Links without accessible text",
      severity: "critical",
      count: emptyLinks.length,
      example: emptyLinks[0][0].substring(0, 120),
      wcag_ref: "WCAG 2.4.4 Link Purpose (A) + 4.1.2 Name, Role, Value (A)",
      fix_hint: "Add visible text or aria-label describing the link destination.",
    });
  }

  // 8. <title> tag missing or empty
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    issues.push({
      rule: "Missing or empty <title> element",
      severity: "serious",
      count: 1,
      wcag_ref: "WCAG 2.4.2 Page Titled (A)",
      fix_hint: "Add a unique, descriptive <title> per page.",
    });
  }

  // 9. <a target="_blank"> without rel="noopener noreferrer"
  const externalLinks = Array.from(html.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi));
  const externalLinksMissingRel = externalLinks.filter(
    (m) => !/rel\s*=\s*["'][^"']*\b(noopener|noreferrer)\b/i.test(m[0]),
  );
  if (externalLinksMissingRel.length > 0) {
    issues.push({
      rule: "External links missing rel=\"noopener\"",
      severity: "moderate",
      count: externalLinksMissingRel.length,
      example: externalLinksMissingRel[0][0].substring(0, 120),
      wcag_ref: "WCAG 3.2.5 Change on Request (AAA) + security best practice",
      fix_hint: "Add rel=\"noopener noreferrer\" to every <a target=\"_blank\">.",
    });
  }

  // 10. Duplicate id attributes (breaks aria-labelledby + label/for)
  const idMatches = Array.from(html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)).map((m) => m[1]);
  const idCounts = new Map<string, number>();
  for (const id of idMatches) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  const dupes = Array.from(idCounts.entries()).filter(([, n]) => n > 1);
  if (dupes.length > 0) {
    issues.push({
      rule: "Duplicate id attributes",
      severity: "serious",
      count: dupes.reduce((s, [, n]) => s + (n - 1), 0),
      example: `id="${dupes[0][0]}" appears ${dupes[0][1]} times`,
      wcag_ref: "WCAG 4.1.1 Parsing (A)",
      fix_hint: "Every id in the document must be unique. Use class for repeated styling.",
    });
  }

  // 11. <iframe> without title attribute
  const iframes = Array.from(html.matchAll(/<iframe\b[^>]*>/gi));
  const iframesNoTitle = iframes.filter(
    (m) => !/\btitle\s*=\s*["'][^"']+["']/i.test(m[0]),
  );
  if (iframesNoTitle.length > 0) {
    issues.push({
      rule: "iframes without title attribute",
      severity: "serious",
      count: iframesNoTitle.length,
      example: iframesNoTitle[0][0].substring(0, 120),
      wcag_ref: "WCAG 4.1.2 Name, Role, Value (A) + 2.4.1 Bypass Blocks (A)",
      fix_hint: "Add title=\"Brief description\" to every <iframe> (embedded videos/maps/forms).",
    });
  }

  // 12. <table> without <th> (data tables only — exclude role="presentation")
  const tables = Array.from(html.matchAll(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi));
  const dataTablesNoTh = tables.filter(([, attrs, inner]) => {
    if (/role\s*=\s*["'](presentation|none)["']/i.test(attrs)) return false;
    return !/<th\b/i.test(inner);
  });
  if (dataTablesNoTh.length > 0) {
    issues.push({
      rule: "Data tables without <th> headers",
      severity: "serious",
      count: dataTablesNoTh.length,
      example: dataTablesNoTh[0][0].substring(0, 120),
      wcag_ref: "WCAG 1.3.1 Info and Relationships (A)",
      fix_hint: "Use <th> for column/row headers, or set role=\"presentation\" on layout tables.",
    });
  }

  // 13. Skip-to-content link missing — heuristic on first 5KB of <body>
  const bodyStart = (html.match(/<body\b[^>]*>([\s\S]{0,5000})/i) || [, ""])[1];
  const hasSkipLink =
    /<a\b[^>]*href\s*=\s*["']#(main|content|skip|sk-)[^"']*["']/i.test(bodyStart) ||
    /<a\b[^>]*class\s*=\s*["'][^"']*\bskip(?:[\s-]link|[\s-]to|[\s-]nav)?[^"']*["']/i.test(bodyStart);
  if (!hasSkipLink) {
    issues.push({
      rule: "Missing skip-to-content link",
      severity: "moderate",
      count: 1,
      wcag_ref: "WCAG 2.4.1 Bypass Blocks (A)",
      fix_hint: "Add a visually-hidden 'Skip to main content' link as the first interactive element.",
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
