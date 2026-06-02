import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 20;

/**
 * Public checkout for the one-time $149 WCAG audit (no account required).
 *
 * Why no auth: this is intentionally a no-login purchase. The buyer is
 * typically someone who just got an ADA demand letter and wants a documented
 * audit + VPAT fast, without creating an account. Lowest friction = highest
 * conversion for that buyer. (The Stripe price-enumeration anti-pattern does
 * not apply: there is a single fixed price, validated server-side below, not
 * a user-supplied priceId.)
 *
 * Defenses that DO apply and are enforced:
 *  - SSRF: the target_url is validated by urlInputSchema + DNS-resolution
 *    check (we will fetch this URL server-side in the webhook).
 *  - Rate limit: in-memory per-IP clamp here (defense in depth on top of the
 *    global middleware), so this can't be used to spin up unlimited Stripe
 *    sessions or probe URLs.
 */

const bodySchema = z.object({
  url: urlInputSchema,
  email: z.string().email().max(200),
});

const RATE_PER_MIN = 6;
const ipHits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = ipHits.get(ip);
  if (!cur || cur.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  cur.count += 1;
  return cur.count > RATE_PER_MIN;
}

const PRICE_ID = (process.env.STRIPE_AUDIT_PRICE_ID || "").trim();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!PRICE_ID) {
    console.error("[audit/checkout] STRIPE_AUDIT_PRICE_ID not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.issues }, { status: 400 });
  }
  const { url, email } = parsed.data;

  // SSRF: block hostnames that resolve to private/internal IPs (rebinding).
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  const ipOk = await validateResolvedIP(parsedUrl.hostname);
  if (!ipOk) {
    return NextResponse.json({ error: "url_not_allowed" }, { status: 400 });
  }

  try {
    const pendingId = crypto.randomUUID();
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: email,
      // metadata carries everything the webhook needs to fulfil the audit
      metadata: {
        kind: "one_time_audit",
        target_url: url,
        audit_email: email,
        pending_id: pendingId,
      },
      payment_intent_data: {
        metadata: { kind: "one_time_audit", target_url: url, audit_email: email },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/success?cs={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/audit?canceled=1`,
    });

    // Pre-create a pending row so we can show status + never lose a paid order
    const db = createAdminClient() as unknown as { from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> } };
    await db.from("paid_audits").insert({
      id: pendingId,
      email,
      target_url: url,
      stripe_session_id: session.id,
      status: "pending",
    }).catch?.(() => {});

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[audit/checkout] stripe error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
