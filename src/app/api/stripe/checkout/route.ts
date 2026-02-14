import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { pricingPlans } from "@/lib/stripe/plans";

export async function POST(req: Request) {
  const { priceId, mode = "subscription" } = await req.json();

  // Validate mode
  if (mode !== "subscription" && mode !== "payment") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  // Validate priceId against known plans
  const validPriceIds = pricingPlans
    .flatMap((p) => [p.stripePriceIdMonthly, p.stripePriceIdYearly])
    .filter(Boolean);

  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // If user already has an active subscription, redirect to portal instead
    if (profile?.subscription_status === "active" && profile?.stripe_customer_id) {
      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        ...(process.env.STRIPE_PORTAL_CONFIG_ID && {
          configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
        }),
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=canceled`,
      subscription_data: mode === "subscription" ? { metadata: { supabase_user_id: user.id } } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
