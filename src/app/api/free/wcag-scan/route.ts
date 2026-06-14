import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scanUrlLite } from "@/lib/free-scan/lite-scanner";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { createAdminClient } from "@/lib/supabase/admin";
import { rlAllowed, clientIpKey } from "@/lib/security/supabase-rate-limit";

export const maxDuration = 30;

const bodySchema = z.object({
  url: urlInputSchema,
  email: z.string().email().max(200).optional(),
});

/**
 * Public endpoint for the /free/wcag-scanner tool. Single fetch, regex-based
 * checks. Optional `email` lets us send the upgrade nurture sequence later.
 *
 * Rate limit (defense in depth): the security middleware should clamp this
 * route to ~5 req/min/IP via Upstash. This route does NOT manage its own
 * rate limit — relies on the global middleware.
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

  // If the visitor gave an email, we'd enqueue a nurture sequence here.
  // Intentionally NOT sending in this iteration — outreach gates are managed
  // by the daily-outreach cron in DRY-RUN mode (see Pilotdeck). For now we
  // just acknowledge.
  const email_captured = Boolean(email);

  // Persist the scan to public_scan_results so the visitor gets a
  // shareable permalink. Token is a random 12-byte base64url string
  // (16 chars) — collision-resistant + unguessable. The page at
  // /scan-result/[token] renders the report read-only without auth.
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

  return NextResponse.json({
    report,
    email_captured,
    share_token,
    share_url: share_token
      ? `https://accessiscan.piposlab.com/scan-result/${share_token}`
      : null,
    upgrade_cta:
      "Run the full Playwright-based scan with VPAT 2.5 export at https://accessiscan.piposlab.com/signup",
  });
}
