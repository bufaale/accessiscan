export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  features: string[];
  limits: { scansPerMonth: number; canDeepScan: boolean };
  recommended: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try ADA Scanner with limited scans",
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
    features: [
      "2 scans per month",
      "Quick scan only",
      "WCAG 2.1 Level A/AA checks",
      "Basic compliance reports",
      "Issue detection",
    ],
    limits: { scansPerMonth: 2, canDeepScan: false },
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals who need detailed compliance insights",
    monthlyPrice: 19,
    yearlyPrice: 190,
    stripePriceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "").trim(),
    stripePriceIdYearly: (process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "").trim(),
    features: [
      "30 scans per month",
      "Quick + deep scan",
      "WCAG 2.1 & 2.2 A/AA checks",
      "AI-powered fix suggestions",
      "Detailed compliance reports",
      "PDF report export",
      "VPAT 2.5 generation",
      "EN 301 549 (EU) report export",
      "GitHub Action for CI/CD",
      "Multi-site tracking",
      "Priority support",
    ],
    limits: { scansPerMonth: 30, canDeepScan: true },
    recommended: false,
  },
  {
    id: "agency",
    name: "Agency",
    description: "Unlimited scans for agencies and teams",
    monthlyPrice: 49,
    yearlyPrice: 490,
    stripePriceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID || "").trim(),
    stripePriceIdYearly: (process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID || "").trim(),
    features: [
      "Unlimited scans",
      "Everything in Pro",
      "White-label PDF + VPAT reports",
      "API access",
      "Team collaboration",
      "Custom branding",
      "Dedicated support",
      "SLA guarantee",
    ],
    limits: { scansPerMonth: -1, canDeepScan: true }, // -1 = unlimited
    recommended: true,
  },
  {
    id: "business",
    name: "Business",
    description: "Mid-market procurement: continuous monitoring + EU + ticket push",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    stripePriceIdMonthly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || "").trim(),
    stripePriceIdYearly: (process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || "").trim(),
    features: [
      "Everything in Agency",
      "Continuous monitoring (weekly auto-scans)",
      "Regression alerts via email + Slack",
      "Up to 10 monitored properties",
      "Jira / Linear / GitHub Issue push",
      "EN 301 549 + EAA procurement pack",
      "WCAG 2.2 expanded manual review guidance",
      "Priority SLA (next-business-day response)",
    ],
    limits: { scansPerMonth: -1, canDeepScan: true },
    recommended: false,
  },
];

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return pricingPlans.find(
    (p) => p.stripePriceIdMonthly === priceId || p.stripePriceIdYearly === priceId,
  );
}
