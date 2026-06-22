import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://accessiscan.piposlab.com";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFreq: "daily" | "weekly" | "monthly";
}> = [
  { path: "/", priority: 1.0, changeFreq: "weekly" },
  { path: "/pricing", priority: 0.9, changeFreq: "weekly" },
  { path: "/enterprise", priority: 0.9, changeFreq: "monthly" },
  { path: "/vpat", priority: 0.9, changeFreq: "monthly" },
  { path: "/audit", priority: 0.9, changeFreq: "monthly" },
  { path: "/free/wcag-scanner", priority: 0.9, changeFreq: "weekly" },
  { path: "/scorecards", priority: 0.85, changeFreq: "daily" },
  { path: "/trust", priority: 0.8, changeFreq: "weekly" },
  { path: "/overlay-detector", priority: 0.7, changeFreq: "monthly" },
  { path: "/why-not-overlays", priority: 0.6, changeFreq: "monthly" },
  { path: "/blog", priority: 0.7, changeFreq: "weekly" },
  { path: "/login", priority: 0.4, changeFreq: "monthly" },
  { path: "/signup", priority: 0.5, changeFreq: "monthly" },
  { path: "/terms", priority: 0.3, changeFreq: "monthly" },
  { path: "/privacy", priority: 0.3, changeFreq: "monthly" },
  { path: "/refund", priority: 0.3, changeFreq: "monthly" },
];

// Blog posts known at build time. The blog index reads from
// src/content/blog/registry.ts — eventually this could read from the same
// source, but hard-coding here keeps the sitemap simple and avoids
// server-side imports at build.
const BLOG_SLUGS = [
  "accessibe-ftc-lessons",
  "doj-title-ii-runway",
  "en-301-549-forbidden-ids",
  "overlay-lawsuit-guide",
  "wcag-audit-cost-comparison",
];

// Soft cap so the sitemap doesn't grow unbounded. 500 permalinks is well
// under Google's 50k/sitemap.xml limit but keeps render time tight.
const MAX_SCAN_PERMALINKS = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Surface scan permalinks so Google can crawl them as long-tail SEO
  // assets (e.g., "wcag scan of <domain>" queries). Failure must NOT
  // break the sitemap — fall back to the static + blog set silently.
  let scanEntries: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("public_scan_results")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_SCAN_PERMALINKS);
    scanEntries = ((data ?? []) as Array<{ id: string; created_at: string }>).map((r) => ({
      url: `${BASE}/scan-result/${r.id}`,
      lastModified: new Date(r.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // best-effort — keep building the rest of the sitemap
  }

  return [
    ...STATIC_ROUTES.map(({ path, priority, changeFreq }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: changeFreq,
      priority,
    })),
    ...BLOG_SLUGS.map((slug) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...scanEntries,
  ];
}
