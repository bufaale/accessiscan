import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButtons } from "./upgrade-buttons";
import { ManageSubscriptionButton } from "./manage-subscription-button";
import { InvoicesList } from "./invoices-list";

export const metadata = {
  title: "Billing - AccessiScan",
  description: "Manage your AccessiScan subscription, payment method, and tier upgrades.",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const SLATE_50 = "#f8fafc";
const SLATE_200 = "#e2e8f0";
const SLATE_500 = "#64748b";
const SLATE_400 = "#94a3b8";
const SLATE_700 = "#334155";

const PLAN_PRICING: Record<string, { price: string; tagline: string }> = {
  pro: {
    price: "$39/mo",
    tagline: "Weekly re-scans · regression alerts · score history · CI/CD action · priority email support.",
  },
  agency: {
    price: "$99/mo",
    tagline: "Unlimited scans · white-label PDFs · API access · multi-site portfolios.",
  },
  business: {
    price: "$299/mo",
    tagline: "Auto-Fix PRs · continuous monitoring · GitHub App · SLA-backed support.",
  },
  team: {
    price: "$599/mo",
    tagline: "SSO · audit log · org-wide policy · dedicated CSM.",
  },
  free: {
    price: "$0",
    tagline: "2 scans / month · WCAG 2.1 AA report · email-only support.",
  },
};

function formatMemberSince(createdAt: string | null | undefined): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function Eyebrow({ children, color = CYAN }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        fontWeight: 600,
        fontFamily: FONT_INTER,
      }}
    >
      {children}
    </span>
  );
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: SLATE_400,
          fontWeight: 600,
          marginBottom: 4,
          fontFamily: FONT_INTER,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: NAVY,
          fontWeight: 600,
          fontFamily: FONT_INTER,
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 11.5, color: SLATE_500, marginTop: 2, fontFamily: FONT_INTER }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

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
  const planKey: string = profile?.subscription_plan || "free";
  const planName = planKey.charAt(0).toUpperCase() + planKey.slice(1);
  const statusLabel = isActive ? "active" : profile?.subscription_status || "free";

  const pricing = PLAN_PRICING[planKey] || PLAN_PRICING.free;
  const memberSince = formatMemberSince(profile?.created_at);

  let billingCycle = isActive ? "Monthly" : "—";
  let nextRenewal = isActive ? "Managed in Stripe portal" : "—";
  if (isActive && profile?.stripe_subscription_id) {
    try {
      const { getStripe } = await import("@/lib/stripe/server");
      const sub = await getStripe().subscriptions.retrieve(profile.stripe_subscription_id);
      const item = sub.items.data[0];
      const recurring = item?.price?.recurring;
      if (recurring?.interval === "year") billingCycle = "Annual";
      else if (recurring?.interval === "month") billingCycle = "Monthly";
      const subAny = sub as unknown as { current_period_end?: number };
      const itemAny = item as unknown as { current_period_end?: number };
      const periodEnd = itemAny?.current_period_end ?? subAny.current_period_end;
      if (typeof periodEnd === "number") {
        nextRenewal = new Date(periodEnd * 1000).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      // Fall through with placeholder values; never break the page on a Stripe outage.
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        padding: "24px 28px 48px",
        color: NAVY,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: NAVY,
            margin: 0,
          }}
        >
          Billing
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: SLATE_500,
            marginTop: 4,
            fontFamily: FONT_INTER,
          }}
        >
          Manage your subscription, tier, and payment method.
        </p>
      </div>

      {/* Current plan card — cyan accent border-top, two-column layout */}
      <div
        data-testid="current-plan-card"
        style={{
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderTop: `3px solid ${CYAN}`,
          borderRadius: 8,
          maxWidth: 960,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            minHeight: 200,
          }}
        >
          {/* Left: plan info */}
          <div
            style={{
              padding: "26px 28px",
              borderRight: `1px solid ${SLATE_200}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Eyebrow>Current plan</Eyebrow>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 9px",
                  borderRadius: 4,
                  background: isActive
                    ? "rgba(22,163,74,0.10)"
                    : "rgba(100,116,139,0.10)",
                  border: isActive
                    ? "1px solid rgba(22,163,74,0.25)"
                    : `1px solid ${SLATE_200}`,
                  color: isActive ? "#15803d" : SLATE_500,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  fontFamily: FONT_INTER,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isActive ? "#16a34a" : SLATE_500,
                  }}
                />
                {statusLabel}
              </span>
            </div>

            <div
              data-testid="plan-name-display"
              className="plan-name-display"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 40,
                  lineHeight: 1,
                  color: NAVY,
                  letterSpacing: "-0.02em",
                }}
              >
                {isActive ? planName : "Free"}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 600,
                  fontSize: 18,
                  color: NAVY,
                }}
              >
                {pricing.price}
              </span>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 13.5,
                color: SLATE_700,
                fontFamily: FONT_INTER,
                lineHeight: 1.55,
                maxWidth: 460,
              }}
            >
              {pricing.tagline}
            </div>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexWrap: "wrap",
                gap: 28,
                fontFamily: FONT_INTER,
              }}
            >
              <Meta
                label="Next renewal"
                value={nextRenewal}
                sub={isActive ? "Auto-renews · cancel anytime" : undefined}
              />
              <Meta
                label="Billing cycle"
                value={billingCycle}
                sub={isActive ? "Switch to annual in Stripe portal" : undefined}
              />
              <Meta label="Member since" value={memberSince} />
            </div>
          </div>

          {/* Right: subscription actions */}
          <div
            style={{
              padding: "26px 28px",
              background: SLATE_50,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <Eyebrow color={SLATE_500}>Subscription</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: SLATE_700,
                  lineHeight: 1.55,
                  fontFamily: FONT_INTER,
                }}
              >
                {isActive
                  ? "Manage card, switch billing cycle, change tier, or cancel — all via Stripe's secure portal."
                  : "Upgrade to a paid plan below to unlock VPAT exports, Auto-Fix PRs, and continuous monitoring."}
              </div>
            </div>

            {isActive ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <ManageSubscriptionButton />
                <ManageSubscriptionButton label="Cancel subscription" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <UpgradeButtons />
                {profile?.stripe_customer_id ? (
                  <ManageSubscriptionButton label="View billing history" />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {profile?.stripe_customer_id ? <InvoicesList /> : null}

      {/* Tier comparison — preserved from previous version */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          padding: 20,
          maxWidth: 960,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: 15,
            color: NAVY,
            marginBottom: 8,
          }}
        >
          What you get on each tier
        </div>
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 24px",
            fontSize: 12.5,
            color: SLATE_500,
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontFamily: FONT_INTER,
          }}
        >
          {[
            { tier: "Free", desc: "2 scans / mo · WCAG 2.1 AA" },
            { tier: "Pro · $39/mo", desc: "monitoring · CI/CD action" },
            { tier: "Agency · $99/mo", desc: "Unlimited · white-label · API" },
            { tier: "Business · $299/mo", desc: "Auto-Fix PRs · continuous monitoring" },
            { tier: "Team · $599/mo", desc: "SSO · audit log · org-wide policy" },
          ].map((row) => (
            <li key={row.tier} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                aria-hidden
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: CYAN,
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
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
