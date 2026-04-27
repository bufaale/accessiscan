"use client";

import { useState } from "react";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";

const ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "How does billing work?",
    a: "We bill monthly or annually via Stripe (Visa, Mastercard, Amex, ACH for US customers). Annual subscribers save roughly 17% and lock in their rate for the contract term. Government and Agency customers can pay by purchase order with net-30 or net-60 terms — email alex@piposlab.com to set up an invoice.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel any time?",
    a: "Yes. Upgrades are pro-rated and take effect immediately. Downgrades take effect at the start of your next billing cycle — you keep paid features until then. Cancellation is self-service from Settings → Billing. We retain your scan history for 90 days post-cancellation; after that, all data is deleted on request.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Within 30 days of your first paid charge, email alex@piposlab.com for a full refund — no forms, no exit interview. After 30 days, we pro-rate refunds for annual plans on a case-by-case basis. Government POs are governed by the terms of your contract.",
  },
  {
    q: "What payment terms do you offer government and education buyers?",
    a: "We accept purchase orders with net-30 or net-60 terms for government, K-12, higher ed, and Fortune 500 finance teams. For sole-source justifications, request our capability statement from alex@piposlab.com. Custom procurement timelines are typical for state and municipal IT shops.",
  },
  {
    q: "What counts as a 'site' on Pro and Agency plans?",
    a: "A site is a single domain or sub-domain (e.g. acme.com or staging.acme.com). www and root resolve to the same site. Subdomains for marketing, app, and docs each count separately. PDFs hosted on a counted domain do not consume an extra slot.",
  },
  {
    q: "Is there a per-seat charge for team members?",
    a: "No. Every plan — including Free — includes unlimited team members. Invite your entire engineering, design, legal, and procurement orgs at no extra cost. Seat-based pricing only kicks in on the Team tier for SSO governance and audit log access.",
  },
  {
    q: "How does the 14-day Pro trial work?",
    a: "Start the trial without a credit card. You get the full Pro feature set — VPAT 2.5 export, Auto-Fix PRs, CI/CD action, multi-site tracking — for 14 days. We email a reminder 3 days before it ends. If you don't upgrade, your account drops back to Free; nothing is auto-charged.",
  },
  {
    q: "Will my price increase at renewal?",
    a: "Monthly subscribers receive 60 days' notice before any list-price change takes effect on their account. Annual subscribers keep their original rate for the entire contract term, even if list pricing rises. Government customers' rates are governed by their contract.",
  },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(45deg)" : "rotate(0)",
        transition: "transform .15s",
      }}
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function PricingFaq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section
      id="faq"
      style={{
        background: "#fff",
        padding: "96px 32px",
        fontFamily: FONT_INTER,
      }}
      data-testid="pricing-faq-section"
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span
            style={{
              fontFamily: FONT_INTER,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#0e7490",
            }}
          >
            Pricing FAQ
          </span>
          <h2
            style={{
              marginTop: 12,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 40,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0b1f3a",
            }}
          >
            Questions about billing.
          </h2>
          <p
            style={{
              marginTop: 16,
              fontSize: 16,
              color: "#475569",
              maxWidth: 620,
              marginInline: "auto",
            }}
          >
            Don&apos;t see yours? Email{" "}
            <a
              href="mailto:alex@piposlab.com"
              style={{ color: "#0b1f3a", fontWeight: 600 }}
            >
              alex@piposlab.com
            </a>{" "}
            — a real human replies within 24 hours.
          </p>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0" }}>
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div
                key={it.q}
                style={{ borderBottom: "1px solid #e2e8f0" }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    padding: "20px 4px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                    fontFamily: FONT_INTER,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16.5,
                      fontWeight: 600,
                      color: "#0b1f3a",
                      lineHeight: 1.4,
                    }}
                  >
                    {it.q}
                  </span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginLeft: 16,
                      color: "#0b1f3a",
                    }}
                  >
                    <PlusIcon open={isOpen} />
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 4px 24px",
                      maxWidth: 760,
                      fontSize: 15,
                      lineHeight: 1.65,
                      color: "#475569",
                    }}
                  >
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
