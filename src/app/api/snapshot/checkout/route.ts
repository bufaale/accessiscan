import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 20;

/**
 * Public checkout for the one-time $79 "Automated Report" (no account required).
 * Isolated clone of /api/audit/checkout so it can never affect the live $149
 * audit flow. Single fixed server-side price (STRIPE_SNAPSHOT_PRICE_ID), no
 * user-supplied priceId (no price-enumeration). SSRF-validated target URL.
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

const PRICE_ID = (process.env.STRIPE_SNAPSHOT_PRICE_ID || "").trim();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!PRICE_ID) {
    console.error("[snapshot/checkout] STRIPE_SNAPSHOT_PRICE_ID not configured");
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
      metadata: {
        kind: "snapshot",
        target_url: url,
        audit_email: email,
        pending_id: pendingId,
      },
      payment_intent_data: {
        metadata: { kind: "snapshot", target_url: url, audit_email: email },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/success?cs={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/snapshot?canceled=1`,
    });

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
    console.error("[snapshot/checkout] stripe error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
