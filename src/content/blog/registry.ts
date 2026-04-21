/**
 * Blog post registry. Each post is a plain React component in ./posts/
 * wrapped by a metadata entry here. Keeping content in TSX (vs MDX) keeps
 * the bundle tiny — no markdown parser, no runtime compile — and lets us
 * use existing shadcn/ui components inline in post bodies.
 */

import { type ComponentType } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  /** 155-160 char meta description. */
  description: string;
  /** YYYY-MM-DD. */
  date: string;
  /** Reading time in minutes. */
  readMinutes: number;
  /** Primary keyword phrase — used as the canonical H1 if different from title. */
  keyword: string;
  /** Category slug for filtering. */
  category: "compliance" | "wcag" | "procurement" | "comparisons" | "how-to";
  /** 1-3 sentence excerpt for cards + RSS. */
  excerpt: string;
  /** Imported component. */
  Component: ComponentType;
}

import OverlayLawsuitGuide from "./posts/overlay-lawsuit-guide";
import WcagCostComparison from "./posts/wcag-audit-cost-comparison";
import EnForbIds from "./posts/en-301-549-forbidden-ids";
import DojTitleIiRunway from "./posts/doj-title-ii-runway";
import AccessibeLessons from "./posts/accessibe-ftc-lessons";

export const POSTS: BlogPost[] = [
  {
    slug: "overlay-lawsuit-guide",
    title: "The 2026 Accessibility Overlay Lawsuit Guide",
    description:
      "22.6% of US ADA lawsuits in 2024-25 targeted sites using an overlay. Here's what the FTC, UserWay class action, and WebAIM survey say.",
    date: "2026-04-21",
    readMinutes: 9,
    keyword: "accessibility overlay lawsuit",
    category: "compliance",
    excerpt:
      "The FTC fined accessiBe $1M in March 2025. UserWay is defending a class action. AudioEye's own SEC 10-K admits the litigation risk. If you deploy an overlay, you are betting against a stack of regulators and courts that keep saying the same thing: widgets do not fix accessibility.",
    Component: OverlayLawsuitGuide,
  },
  {
    slug: "wcag-audit-cost-comparison",
    title: "How Much Does a WCAG Audit Cost in 2026?",
    description:
      "Real 2026 prices for WCAG 2.1/2.2 audits across every vendor tier, from $0 free scanners to $60K enterprise firms, with the honest trade-offs.",
    date: "2026-04-21",
    readMinutes: 11,
    keyword: "wcag audit cost",
    category: "procurement",
    excerpt:
      "Siteimprove and Level Access quote $15-50K per year. Deque axe DevTools runs $45/user/month. TestParty starts at $12K/year. Pope Tech from $25/month. AccessiScan from $19/month. What do you actually get at each tier?",
    Component: WcagCostComparison,
  },
  {
    slug: "en-301-549-forbidden-ids",
    title: "EN 301 549 v3.2.1 — What Changed for the 2025 EAA Enforcement",
    description:
      "The European Accessibility Act went live June 28 2025. EN 301 549 v3.2.1 is the implementing technical standard. Here's what's new vs v3.1.1.",
    date: "2026-04-21",
    readMinutes: 12,
    keyword: "EN 301 549 v3.2.1",
    category: "compliance",
    excerpt:
      "EN 301 549 is the harmonised standard EU procurement cites. Version 3.2.1 adds WCAG 2.2 alignment, revised document testing, and new evidence requirements for non-web software. If you sell to EU public buyers, this is the reference.",
    Component: EnForbIds,
  },
  {
    slug: "doj-title-ii-runway",
    title: "DOJ Title II Deadline Extended — What the April 2026 IFR Actually Says",
    description:
      "The Interim Final Rule published April 20 2026 shifted the Title II digital accessibility deadlines to 2027 and 2028. Here's the full runway.",
    date: "2026-04-21",
    readMinutes: 7,
    keyword: "DOJ Title II deadline 2027",
    category: "compliance",
    excerpt:
      "Public entities with 50,000+ residents now have until April 26, 2027. Smaller entities until April 26, 2028. The substantive technical standard is unchanged — WCAG 2.1 AA. This is extra runway, not a reprieve.",
    Component: DojTitleIiRunway,
  },
  {
    slug: "accessibe-ftc-lessons",
    title: "The accessiBe FTC Consent Order — 5 Lessons for Any Accessibility Vendor",
    description:
      "In March 2025 the FTC fined accessiBe $1M and banned specific compliance claims. The consent order reads like a how-not-to for accessibility marketing.",
    date: "2026-04-21",
    readMinutes: 8,
    keyword: "accessiBe FTC consent order",
    category: "comparisons",
    excerpt:
      "The accessiBe consent order is more instructive than any WCAG training. It enumerates the specific claims regulators will punish, names the assistive-technology groups whose input is credible, and makes clear that AI-as-shield rhetoric is over.",
    Component: AccessibeLessons,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
