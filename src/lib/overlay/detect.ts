/**
 * Detects the presence of known accessibility-overlay widgets on a page.
 *
 * Overlays (accessiBe, UserWay, AudioEye, EqualWeb, UserWay, etc.) are JavaScript
 * widgets that promise "instant WCAG compliance" by overlaying a toolbar on the site.
 * The FTC's March 2025 consent order (accessiBe, $1M) and the ongoing UserWay class
 * action establish that these products do not provide the compliance they claim.
 *
 * Detection works by fetching the raw HTML and searching for vendor-specific script
 * domains and DOM markers. We intentionally do NOT execute JS (no headless browser)
 * because:
 *   - It's ~100× cheaper
 *   - Overlays deliberately inject their markers into the HTML so they load fast
 *   - False positives from dynamically-loaded overlays are a known industry quirk,
 *     not an AccessiScan limitation
 */

export interface OverlayVendor {
  id: string;
  name: string;
  /** Human-facing description shown on the detector landing page. */
  tagline: string;
  /** Domains loaded by the overlay script (substring match, lowercased). */
  scriptDomains: string[];
  /** Inline markers / DOM element IDs that the widget injects. */
  markers: string[];
  /** Evidence string for the public detector page (regulatory exposure). */
  notes: string;
}

export const OVERLAY_VENDORS: OverlayVendor[] = [
  {
    id: "accessibe",
    name: "accessiBe",
    tagline: "$1M FTC penalty (March 2025) for deceptive compliance claims.",
    scriptDomains: ["acsbapp.com", "acsbap.com", "accessibe.com"],
    markers: ['id="acsb"', 'class="acsb', "acsbJS", "asw-menu"],
    notes:
      "FTC v. accessiBe, Inc. (C-4833, March 2025). The Commission found the company made false claims that its AI-powered widget provided WCAG 2.1 AA compliance. Consent order prohibits accessiBe from claiming its product makes websites accessible or compliant.",
  },
  {
    id: "userway",
    name: "UserWay",
    tagline: "Subject of active class-action litigation (Murphy v. UserWay).",
    scriptDomains: ["userway.org", "cdn.userway.org"],
    markers: ["userwayIcon", "data-account", "UserWay", "uw-main-button"],
    notes:
      "Multiple federal ADA lawsuits in 2024-2025 target sites using UserWay, including the class action Murphy v. UserWay (E.D.N.Y.) alleging the widget fails to resolve the underlying accessibility barriers it claims to remediate.",
  },
  {
    id: "audioeye",
    name: "AudioEye",
    tagline: "SEC 10-K discloses ongoing ADA-related litigation risk.",
    scriptDomains: ["ws.audioeye.com", "cdn.audioeye.com", "audioeye.com"],
    markers: ["audioeye_top", "ae-container", "data-ae-", "AudioEye"],
    notes:
      "Despite marketing AudioEye as 'automatic compliance,' the company's 2024 SEC Annual Report (10-K) discloses ongoing litigation exposure for sites using the widget and notes that automated remediation cannot replace manual accessibility work.",
  },
  {
    id: "equalweb",
    name: "EqualWeb",
    tagline: "Overlay known to conflict with screen readers (WebAIM survey).",
    scriptDomains: ["equalweb.com", "cdn.equalweb.com"],
    markers: ["equalweb", "INDWrap", "INDmenu"],
    notes:
      "The 2024 WebAIM Million survey and multiple disability advocacy groups (NFB, DRA) document that EqualWeb — like all overlay widgets — can actively interfere with assistive technology users by hijacking keyboard focus and screen reader announcements.",
  },
  {
    id: "accessibly",
    name: "Accessibly (by On the Map)",
    tagline: "Shopify-focused overlay — same litigation risks as other widgets.",
    scriptDomains: ["accessibly.app", "accessibly-app.com"],
    markers: ["accessibly-app", "data-accessibly"],
    notes:
      "Popular on Shopify stores. The 2024 overlay-related ADA filings tracked by Seyfarth Shaw specifically reference stores using Accessibly alongside sites using accessiBe and UserWay.",
  },
  {
    id: "maxaccess",
    name: "Max Access",
    tagline: "Low-cost overlay heavily marketed to SMBs since 2023.",
    scriptDomains: ["maxaccess.io", "cdn.maxaccess.io"],
    markers: ["maxAccessAPI", "max-access-widget"],
    notes:
      "Marketed to SMBs as a budget overlay. Carries the same structural issues as all overlay products: cannot fix underlying code, can interfere with AT, and sites deploying it continue to receive ADA demand letters.",
  },
];

export interface OverlayDetectionHit {
  vendor: OverlayVendor;
  /** Substring that matched, for evidence display. */
  matched: string;
}

export interface OverlayDetectionResult {
  url: string;
  fetchedAt: string;
  hits: OverlayDetectionHit[];
  /** True if no overlay was detected. */
  clean: boolean;
}

export function detectOverlaysInHtml(
  url: string,
  html: string,
): OverlayDetectionResult {
  const lower = html.toLowerCase();
  const hits: OverlayDetectionHit[] = [];

  for (const vendor of OVERLAY_VENDORS) {
    const domainHit = vendor.scriptDomains.find((d) => lower.includes(d.toLowerCase()));
    if (domainHit) {
      hits.push({ vendor, matched: domainHit });
      continue;
    }
    const markerHit = vendor.markers.find((m) => lower.includes(m.toLowerCase()));
    if (markerHit) {
      hits.push({ vendor, matched: markerHit });
    }
  }

  return {
    url,
    fetchedAt: new Date().toISOString(),
    hits,
    clean: hits.length === 0,
  };
}
