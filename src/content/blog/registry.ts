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
import AdaDemandLetterFirst72Hours from "./posts/ada-demand-letter-first-72-hours";
import BestWcagScanners2026 from "./posts/best-wcag-scanners-2026";
import AccessiScanVsSiteimprove from "./posts/accessiscan-vs-siteimprove";

export const POSTS: BlogPost[] = [
  {
    slug: "best-wcag-scanners-2026",
    title: "The Best WCAG Accessibility Scanners Compared (2026)",
    description:
      "An honest 2026 comparison of WCAG accessibility scanners — Siteimprove, Level Access, Deque axe, WAVE, overlays, and AccessiScan — with real prices and trade-offs.",
    date: "2026-06-13",
    readMinutes: 9,
    keyword: "best WCAG accessibility scanner",
    category: "comparisons",
    excerpt:
      "Enterprise vendors won't show a price; overlay companies promise one-click compliance. Neither is what most small teams need. Here's an honest comparison of the real WCAG scanners in 2026 — what each is good at, what it costs, and where it falls short, including ours.",
    Component: BestWcagScanners2026,
  },
  {
    slug: "accessiscan-vs-siteimprove",
    title: "AccessiScan vs Siteimprove: An Honest Comparison (2026)",
    description:
      "Siteimprove is the big-brand accessibility platform; AccessiScan is the affordable audit. An honest, side-by-side comparison of price, scope, and speed so you pick the right fit.",
    date: "2026-06-13",
    readMinutes: 6,
    keyword: "AccessiScan vs Siteimprove",
    category: "comparisons",
    excerpt:
      "Siteimprove is a strong platform priced for large organizations — which is why small businesses and agencies bounce off it. Here's a fair side-by-side with AccessiScan on price, what you actually get, and speed to a usable result.",
    Component: AccessiScanVsSiteimprove,
  },
  {
    slug: "ada-demand-letter-first-72-hours",
    title: "Got an ADA Website Demand Letter? Your First 72 Hours",
    description:
      "An ADA website demand letter just landed? Here's the practical first-72-hours sequence — and the dated, verifiable audit record that changes how these cases resolve.",
    date: "2026-06-12",
    readMinutes: 8,
    keyword: "ada demand letter website",
    category: "how-to",
    excerpt:
      "Before you panic-pay a settlement or panic-buy an overlay, here's what matters in the first 72 hours after an ADA website demand letter — and the one thing that changes how these cases tend to resolve: proving the day you started fixing it.",
    Component: AdaDemandLetterFirst72Hours,
  },
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
