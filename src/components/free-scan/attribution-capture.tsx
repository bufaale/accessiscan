"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/free/use-attribution";

/**
 * Records the visit's UTM params the moment ANY page loads.
 *
 * Mounted in the ROOT layout on purpose, not in the marketing group. The free
 * scanner's funnel spans routes that live in three different segments —
 * `(marketing)/`, `/scorecards`, `/scan-result/[token]` (where the permalink's
 * email capture happens) — and none of the in-app links between them carry a
 * query string. An ad pointing at `/?utm_campaign=…` whose visitor then follows
 * the hero CTA to `/free/wcag-scanner` arrives with a bare URL, so capturing
 * only on the scanner page would log paid traffic as organic. Paid traffic
 * silently mislabelled is worse than no measurement at all.
 *
 * Renders nothing; the only effect is writing sessionStorage, which the scanner
 * and the lead-capture forms read when they later post.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
