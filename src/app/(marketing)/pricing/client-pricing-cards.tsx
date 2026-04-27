"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { pricingPlans, type PricingPlan } from "@/lib/stripe/plans";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";

const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const SLATE_500 = "#64748b";

const CONTACT_SALES_URL =
  "mailto:alex@piposlab.com?subject=AccessiScan%20Team%20tier";

type Billing = "monthly" | "annual";

type CtaVariant = "primary" | "outline" | "outline-mailto";

function IconCheck({
  size = 16,
  sw = 2.5,
  color = CYAN,
  style,
}: {
  size?: number;
  sw?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({
  size = 14,
  sw = 2,
  color = "#cbd5e1",
  style,
}: {
  size?: number;
  sw?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant: CtaVariant;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  testId?: string;
  ariaLabel?: string;
};

function Btn({
  children,
  variant,
  onClick,
  href,
  disabled,
  testId,
  ariaLabel,
}: ButtonProps) {
  const variants: Record<CtaVariant, { bg: string; color: string; border: string }> = {
    primary: { bg: NAVY, color: "#fff", border: "none" },
    outline: { bg: "#fff", color: NAVY, border: "1px solid #cbd5e1" },
    "outline-mailto": { bg: "#fff", color: NAVY, border: "1px solid #cbd5e1" },
  };
  const v = variants[variant];
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 44,
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    transition: "all .15s ease",
    background: v.bg,
    color: v.color,
    border: v.border,
    opacity: disabled ? 0.6 : 1,
  };
  if (href) {
    return (
      <a href={href} style={baseStyle} data-testid={testId} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={baseStyle}
      disabled={disabled}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// ---- Tier display content (descriptions/taglines layered on top of plans.ts) ----

const TIER_DISPLAY: Record<
  string,
  {
    tagline: string;
    excluded?: string[];
  }
> = {
  free: {
    tagline: "Kick the tires. No credit card.",
    excluded: ["VPAT 2.5 export", "Auto-Fix PRs", "Continuous monitoring", "API access"],
  },
  pro: {
    tagline: "The plan that ships fixes.",
  },
  agency: {
    tagline: "For shops billing remediation.",
  },
  business: {
    tagline: "Mid-market procurement-ready.",
  },
  team: {
    tagline: "Enterprise governance & SSO.",
  },
};

function formatPrice(plan: PricingPlan, billing: Billing): string {
  const value = billing === "annual" ? plan.yearlyPrice : plan.monthlyPrice;
  if (value === 0 && plan.id === "free") return "$0";
  // Team is contact-sales but we still surface the published floor price so
  // procurement officers see the indicative anchor on the public page. The
  // CTA still routes to mailto (handled in the render below).
  return `$${value}`;
}

function priceSuffix(plan: PricingPlan, billing: Billing): string {
  if (plan.id === "free") return "/forever";
  return billing === "annual" ? "/yr" : "/mo";
}

function ctaLabel(plan: PricingPlan): string {
  if (plan.id === "free") return "Start free scan";
  if (plan.contactSales) return plan.ctaLabel || "Contact sales";
  return "Start 14-day trial";
}

function ctaVariant(plan: PricingPlan): CtaVariant {
  if (plan.recommended) return "primary";
  if (plan.contactSales) return "outline-mailto";
  return "outline";
}

export function PricingCards() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: PricingPlan) {
    const priceId =
      billing === "annual" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

    if (!priceId) {
      setError(
        `Checkout is temporarily unavailable for ${plan.name}. Please try again later or email alex@piposlab.com.`,
      );
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      // 401 = not authenticated → bounce to signup with return path
      if (res.status === 401) {
        window.location.href = "/signup?next=/pricing";
        return;
      }

      const data = await res.json().catch(() => ({}) as { url?: string; error?: string });

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setError(data?.error || "Failed to start checkout. Please try again.");
      setLoading(null);
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  return (
    <section
      style={{
        background: "#f8fafc",
        padding: "64px 32px 96px",
        fontFamily: FONT_INTER,
      }}
      data-testid="pricing-cards-section"
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Billing toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            role="tablist"
            aria-label="Billing period"
            style={{
              display: "inline-flex",
              padding: 4,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            {(["monthly", "annual"] as Billing[]).map((opt) => {
              const active = billing === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`billing-toggle-${opt}`}
                  onClick={() => setBilling(opt)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT_INTER,
                    fontSize: 13,
                    fontWeight: 600,
                    background: active ? NAVY : "transparent",
                    color: active ? "#fff" : "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {opt === "monthly" ? "Monthly" : "Annual"}
                  {opt === "annual" && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: active ? CYAN : "#ecfeff",
                        color: active ? "#fff" : "#0e7490",
                      }}
                    >
                      Save ~17%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              maxWidth: 720,
              margin: "0 auto 24px",
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#991b1b",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* Tier cards: 5 tiers, responsive grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {pricingPlans.map((plan) => {
            const display = TIER_DISPLAY[plan.id] ?? { tagline: plan.description };
            const popular = plan.recommended;
            const variant = ctaVariant(plan);
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                data-testid={`pricing-card-${plan.id}`}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "28px 24px",
                  borderTop: popular ? `3px solid ${CYAN}` : "1px solid #e2e8f0",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: -1,
                      right: 18,
                      transform: "translateY(-50%)",
                      padding: "5px 10px",
                      background: NAVY,
                      color: "#fff",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      borderRadius: 4,
                    }}
                  >
                    Most popular
                  </span>
                )}
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 22,
                    color: NAVY,
                    letterSpacing: "-0.01em",
                  }}
                  data-testid={`tier-name-${plan.id}`}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: SLATE_500,
                    lineHeight: 1.45,
                    minHeight: 38,
                  }}
                >
                  {display.tagline}
                </div>

                {/* Price */}
                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: 44,
                      color: NAVY,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                    data-testid={`tier-price-${plan.id}`}
                  >
                    {formatPrice(plan, billing)}
                  </span>
                  <span style={{ fontSize: 13, color: SLATE_500 }}>
                    {priceSuffix(plan, billing)}
                  </span>
                </div>

                {billing === "annual" && plan.monthlyPrice > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: SLATE_500 }}>
                    {`~$${Math.round(plan.yearlyPrice / 12)}/mo billed annually`}
                  </div>
                )}

                {/* CTA */}
                <div style={{ marginTop: 22 }}>
                  {plan.id === "free" ? (
                    <Btn
                      variant="outline"
                      href="/signup"
                      testId={`cta-${plan.id}`}
                      ariaLabel={`Sign up for ${plan.name}`}
                    >
                      {ctaLabel(plan)}
                    </Btn>
                  ) : plan.contactSales ? (
                    <Btn
                      variant="outline-mailto"
                      href={CONTACT_SALES_URL}
                      testId={`cta-${plan.id}`}
                      ariaLabel={`Contact sales for ${plan.name}`}
                    >
                      {ctaLabel(plan)}
                    </Btn>
                  ) : (
                    <Btn
                      variant={variant === "primary" ? "primary" : "outline"}
                      onClick={() => handleCheckout(plan)}
                      disabled={isLoading}
                      testId={`cta-${plan.id}`}
                      ariaLabel={`Start trial for ${plan.name}`}
                    >
                      {isLoading ? "Loading…" : ctaLabel(plan)}
                    </Btn>
                  )}
                </div>

                {/* Features */}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid #f1f5f9",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: SLATE_500,
                      marginBottom: 14,
                    }}
                  >
                    What&apos;s included
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", lineHeight: 1.45 }}
                      >
                        <IconCheck
                          size={15}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {display.excluded && display.excluded.length > 0 && (
                    <ul
                      style={{
                        marginTop: 16,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {display.excluded.map((e) => (
                        <li
                          key={e}
                          style={{
                            display: "flex",
                            gap: 10,
                            fontSize: 12.5,
                            color: "#64748b",
                            lineHeight: 1.4,
                          }}
                        >
                          <IconX
                            size={14}
                            style={{ flexShrink: 0, marginTop: 3 }}
                          />
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 13,
            color: SLATE_500,
          }}
        >
          Unlimited team members on every plan. Need a custom procurement quote?{" "}
          <a
            href={CONTACT_SALES_URL}
            style={{ color: NAVY, fontWeight: 600, textDecoration: "underline" }}
          >
            Talk to sales →
          </a>
        </div>
      </div>
    </section>
  );
}
