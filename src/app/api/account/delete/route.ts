import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GDPR Article 17 — right to erasure. Data Subject / controller obligation.
 * Also covers CCPA/CPRA equivalent rights. Performs:
 *
 *   1. Cancel any active Stripe subscription (best-effort; Stripe calls
 *      subscription.deleted webhook, which handles local row cleanup).
 *   2. Delete the auth.users row via the Supabase Admin API. Because RLS
 *      + cascading foreign keys route through user_id, this removes the
 *      profile, sites, scans, scan_issues, scan_visual_issues, pdf_scans,
 *      monitored_sites, scan_snapshots, issue_tracker_integrations,
 *      issue_tracker_pushes, scan_igt_results, ai_usage, subscriptions.
 *
 * Confirmation: body must contain { confirm: "DELETE MY ACCOUNT" } to
 * avoid accidental deletion from curl.
 */

const bodySchema = z.object({
  confirm: z.literal("DELETE MY ACCOUNT"),
});

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Must confirm with {confirm: 'DELETE MY ACCOUNT'}" },
      { status: 400 },
    );
  }

  // Cancel Stripe subscription best-effort. The actual subscription cleanup
  // happens via webhook, but we want to avoid charging a deleted account.
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    const customerId = profile?.stripe_customer_id as string | null;
    if (customerId && process.env.STRIPE_SECRET_KEY) {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/customers/${customerId}/subscriptions?status=active`,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY.trim()}`,
          },
        },
      );
      if (stripeRes.ok) {
        const json = (await stripeRes.json()) as { data: Array<{ id: string }> };
        for (const sub of json.data ?? []) {
          await fetch(`https://api.stripe.com/v1/subscriptions/${sub.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY.trim()}`,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Stripe cancellation during account delete failed:", err);
  }

  // Auth.users deletion via service-role admin client. Foreign keys cascade
  // to profiles and everything that references auth.users(id).
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
