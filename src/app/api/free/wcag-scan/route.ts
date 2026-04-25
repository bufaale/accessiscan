import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scanUrlLite } from "@/lib/free-scan/lite-scanner";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";

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

  return NextResponse.json({
    report,
    email_captured,
    upgrade_cta:
      "Run the full Playwright-based scan with VPAT 2.5 export at https://accessiscan.app/signup",
  });
}
