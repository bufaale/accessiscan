import * as cheerio from "cheerio";

export function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const baseDomain = new URL(baseUrl).hostname;
  const links: Set<string> = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname === baseDomain && resolved.protocol.startsWith("http")) {
        resolved.hash = "";
        const normalized = resolved.toString().replace(/\/$/, "");
        const base = baseUrl.replace(/\/$/, "");
        if (normalized !== base) {
          links.add(normalized);
        }
      }
    } catch {
      // Skip invalid URLs
    }
  });

  return Array.from(links).slice(0, 9); // Max 9 additional pages (10 total with main)
}
