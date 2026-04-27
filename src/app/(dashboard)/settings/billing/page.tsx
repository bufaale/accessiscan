import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButtons } from "./upgrade-buttons";
import { ManageSubscriptionButton } from "./manage-subscription-button";

export const metadata = {
  title: "Billing - AccessiScan",
  description: "Manage your AccessiScan subscription, payment method, and tier upgrades.",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const SLATE_200 = "#e2e8f0";
const SLATE_500 = "#64748b";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isActive = profile?.subscription_status === "active";
  const planName = profile?.subscription_plan
    ? profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)
    : "Free";
  const statusLabel = isActive ? "active" : profile?.subscription_status || "free";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          Billing
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER }}>
          Manage your subscription, tier, and payment method.
        </p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24, maxWidth: 720 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: SLATE_500, fontWeight: 600, marginBottom: 6, fontFamily: FONT_INTER }}>
          Current plan
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {isActive ? planName : "Free"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderRadius: 9999,
              background: isActive ? "rgba(22,163,74,0.10)" : "rgba(100,116,139,0.10)",
              color: isActive ? "#16a34a" : SLATE_500,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: FONT_INTER,
              textTransform: "lowercase",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "#16a34a" : SLATE_500 }} aria-hidden />
            {statusLabel}
          </span>
        </div>

        {isActive ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ManageSubscriptionButton />
            <p style={{ fontSize: 12, color: SLATE_500, fontFamily: FONT_INTER, margin: 0 }}>
              Open the Stripe portal to update payment method, change plan, view invoices, or cancel.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <UpgradeButtons />
            {profile?.stripe_customer_id && (
              <div>
                <ManageSubscriptionButton label="View billing history" />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 20, maxWidth: 720 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: NAVY, marginBottom: 8 }}>
          What you get on each tier
        </div>
        <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 12.5, color: SLATE_500, listStyle: "none", padding: 0, margin: 0, fontFamily: FONT_INTER }}>
          {[
            { tier: "Free", desc: "2 scans / mo · WCAG 2.1 AA" },
            { tier: "Pro · $19/mo", desc: "30 scans · VPAT 2.5 · CI/CD action" },
            { tier: "Agency · $49/mo", desc: "Unlimited · white-label · API" },
            { tier: "Business · $299/mo", desc: "Auto-Fix PRs · continuous monitoring" },
            { tier: "Team · $599/mo", desc: "SSO · audit log · org-wide policy" },
          ].map((row) => (
            <li key={row.tier} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: CYAN, flexShrink: 0, marginTop: 6 }} aria-hidden />
              <div>
                <div style={{ fontWeight: 600, color: NAVY }}>{row.tier}</div>
                <div style={{ fontSize: 11.5, color: SLATE_500, marginTop: 1 }}>{row.desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
