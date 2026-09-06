import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scanUrlLite } from "@/lib/free-scan/lite-scanner";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { createAdminClient } from "@/lib/supabase/admin";
import { rlAllowed, clientIpKey } from "@/lib/security/supabase-rate-limit";
import { parseAttribution, attributionFieldSchema } from "@/lib/free/attribution";
import { countBySeverity, logFreeToolEvent } from "@/lib/free/funnel-events";

export const maxDuration = 30;

const bodySchema = z.object({
  url: urlInputSchema,
  email: z.string().email().max(200).optional(),
  // Ad attribution rides along with the scan. Optional and permissive on
  // purpose: a junk utm_* must never 400 a working scan (see attribution.ts).
  utm_source: attributionFieldSchema,
  utm_medium: attributionFieldSchema,
  utm_campaign: attributionFieldSchema,
});

/**
 * Public endpoint for the /free/wcag-scanner tool. Single fetch, regex-based
 * checks. Optional `email` lets us send the upgrade nurture sequence later.
 *
 * Rate limit (defense in depth): the security middleware should clamp this
 * route to ~5 req/min/IP via Upstash. This route does NOT manage its own
 * rate limit — relies on the global middleware.
 *
 * RESPONSE CONTRACT — `scan_status` is the field to branch on:
 *
 *   "ok"      → `report.health_score` is a real 0–100 measurement.
 *   "blocked" → the target refused our scanner (403/401/429). `health_score`
 *               is null and `issues` is empty because NOTHING was measured.
 *   "failed"  → the page could not be retrieved (404, DNS, timeout).
 *
 * `blocked` is the same signal as a boolean for callers that only care whether
 * the scan produced a usable measurement. Never present a non-"ok" scan as a
 * score of 0 — that tells a visitor their site is catastrophically inaccessible
 * when in truth we never read it.
 *
 * A completed scan also writes one aggregate `scan_completed` row to
 * `free_tool_events` (outcome + UTM attribution + referer + counts). That row is
 * how we tell an ad click that ran a scan from one that bounced. It is
 * fire-and-forget via `after()` — it can neither delay this response nor change
 * its status/body, and it never contains the URL or the email.
 */
export async function POST(req: NextRequest) {
  // Cross-instance rate limit (the Upstash middleware is off in prod). 6/min/IP.
  if (!(await rlAllowed(clientIpKey(req, "freescan"), 6, 60))) {
    return NextResponse.json(
      { error: "Too many scans — please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }
  const { url, email } = parsed.data;

  // SSRF defense in depth — urlInputSchema already blocks private hostnames,
  // but we also resolve the actual DNS to catch hostnames that point to
  // private IPs (DNS rebinding).
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  const dnsOk = await validateResolvedIP(parsedUrl.hostname);
  if (!dnsOk) {
    return NextResponse.json(
      { error: "URL resolves to a private or unresolvable address" },
      { status: 400 },
    );
  }

  const report = await scanUrlLite(url);

  // Funnel step 1. Aggregate only — no URL, no domain, no email. Fire-and-forget:
  // it runs after this response is streamed and swallows its own failures.
  logFreeToolEvent({
    event: "scan_completed",
    outcome: report.outcome,
    attribution: parseAttribution(body),
    referer: req.headers.get("referer"),
    healthScore: report.health_score,
    issueCount: report.total_issue_count,
    criticalCount: countBySeverity(report.issues, "critical"),
  });

  // If the visitor gave an email, we'd enqueue a nurture sequence here.
  // Intentionally NOT sending in this iteration — outreach gates are managed
  // by the daily-outreach cron in DRY-RUN mode (see Pilotdeck). For now we
  // just acknowledge.
  const email_captured = Boolean(email);

  // Persist the scan to public_scan_results so the visitor gets a
  // shareable permalink. Token is a random 12-byte base64url string
  // (16 chars) — collision-resistant + unguessable. The page at
  // /scan-result/[token] renders the report read-only without auth.
  //
  // Blocked / failed scans are still persisted: the Pilotdeck bulk-scan-feed
  // cron dedupes its queue against this table, and without a row a permanently
  // blocked domain would sit at the head of the queue being re-scanned forever.
  let share_token: string | null = null;
  try {
    const token = crypto.randomBytes(12).toString("base64url");
    const admin = createAdminClient();
    const { error } = await admin.from("public_scan_results").insert({
      id: token,
      url,
      report,
      email_captured: email ?? null,
    });
    if (!error) share_token = token;
  } catch {
    // Best-effort — don't fail the response if persistence fails.
  }

  // ...but a permalink is only OFFERED for a scan that measured something.
  // Handing back a share URL for a blocked site would invite the visitor to
  // publish a scorecard that says nothing about their site.
  const measured = report.outcome === "ok";
  const shareable = measured ? share_token : null;

  return NextResponse.json({
    report,
    scan_status: report.outcome,
    blocked: report.outcome === "blocked",
    email_captured,
    share_token: shareable,
    share_url: shareable
      ? `https://accessiscan.piposlab.com/scan-result/${shareable}`
      : null,
    upgrade_cta: UPGRADE_CTA[report.outcome],
  });
}

const UPGRADE_CTA: Record<"ok" | "blocked" | "failed", string> = {
  ok: "Run the full Playwright-based scan with VPAT 2.5 export at https://accessiscan.piposlab.com/signup",
  blocked:
    "This site refused the lite scanner, so nothing was measured. The full scan drives a real Chromium browser — start it at https://accessiscan.piposlab.com/signup",
  failed:
    "The page could not be retrieved, so nothing was measured. Check the URL, or run the full scan at https://accessiscan.piposlab.com/signup",
};
