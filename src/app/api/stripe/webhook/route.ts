import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlanByPriceId } from "@/lib/stripe/plans";
import { logAuditEvent } from "@/lib/audit/log";
import { fulfilPaidAudit } from "@/lib/audit/fulfill";
import type Stripe from "stripe";

function getPlanIdFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return "free";
  const plan = getPlanByPriceId(priceId);
  return plan?.id || "free";
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!.trim());
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error: markErr } = await supabase
    .from("stripe_events_processed")
    .insert({ event_id: event.id, type: event.type });
  if (markErr?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // One-time $149 audit (no-account purchase). Fulfil: scan + email report.
      if (session.mode === "payment" && session.metadata?.kind === "one_time_audit") {
        const targetUrl = session.metadata.target_url;
        const auditEmail = session.metadata.audit_email || session.customer_details?.email || session.customer_email;
        if (targetUrl && auditEmail) {
          // Await fulfilment so a webhook retry re-runs it if it throws; the
          // function is internally guarded and marks paid_audits status.
          await fulfilPaidAudit({ sessionId: session.id, email: auditEmail, targetUrl });
        } else {
          console.error("[webhook] one_time_audit missing url/email", session.id);
        }
        break;
      }

      if (session.mode === "subscription" && session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
        const userId = subscription.metadata.supabase_user_id || session.metadata?.supabase_user_id;
        const firstItem = subscription.items.data[0];
        const planId = getPlanIdFromSubscription(subscription);

        if (userId) {
          const customerId = typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

          const { error: subError } = await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: firstItem.price.id,
            status: subscription.status,
            current_period_start: new Date(firstItem.current_period_start * 1000).toISOString(),
            current_period_end: new Date(firstItem.current_period_end * 1000).toISOString(),
          });
          if (subError) console.error("Subscription upsert error:", subError);

          const { error: profileError } = await supabase.from("profiles").update({
            subscription_status: "active",
            subscription_plan: planId,
            stripe_customer_id: customerId,
          }).eq("id", userId);
          if (profileError) console.error("Profile update error:", profileError);

          void logAuditEvent({
            userId,
            eventType: "subscription.created",
            actorType: "webhook",
            actorId: "stripe",
            resource: `subscription:${subscription.id}`,
            summary: `Subscribed to ${planId} plan`,
            meta: { plan: planId, stripe_subscription_id: subscription.id, price_id: firstItem.price.id },
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        const firstItem = subscription.items.data[0];
        const planId = getPlanIdFromSubscription(subscription);

        await supabase.from("subscriptions").update({
          status: subscription.status,
          stripe_price_id: firstItem.price.id,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(firstItem.current_period_end * 1000).toISOString(),
        }).eq("stripe_subscription_id", subscription.id);

        // Plan stays at the paid tier until customer.subscription.deleted fires;
        // subscription_status carries the past_due/unpaid/incomplete signal so the
        // frontend can render a "fix your card" banner without revoking access during
        // Stripe's dunning retry window. Previously this branch reset plan to "free"
        // on any non-active status, which incorrectly punished users for transient
        // billing failures (expired card, temporary decline) that Stripe was still
        // retrying.
        await supabase.from("profiles").update({
          subscription_status: subscription.status,
          subscription_plan: planId,
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        await supabase.from("subscriptions").update({
          status: "canceled",
          cancel_at_period_end: false,
        }).eq("stripe_subscription_id", subscription.id);

        await supabase.from("profiles").update({
          subscription_status: "canceled",
          subscription_plan: "free",
        }).eq("id", userId);

        void logAuditEvent({
          userId,
          eventType: "subscription.canceled",
          actorType: "webhook",
          actorId: "stripe",
          resource: `subscription:${subscription.id}`,
          summary: "Subscription canceled — downgraded to free",
          meta: { stripe_subscription_id: subscription.id },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as any).subscription;
      if (subscriptionId && typeof subscriptionId === "string") {
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.supabase_user_id;
        if (userId) {
          await supabase.from("profiles").update({ subscription_status: "past_due" }).eq("id", userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
