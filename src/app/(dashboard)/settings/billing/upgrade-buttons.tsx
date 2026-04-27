"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/stripe/plans";

const CONTACT_SALES_URL = "mailto:alex@piposlab.com?subject=AccessiScan%20Team%20tier%20-%20enterprise%20inquiry";

export function UpgradeButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  const paidPlans = pricingPlans.filter((p) => p.monthlyPrice > 0);

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {paidPlans.map((plan) => {
          if (plan.contactSales) {
            return (
              <Button
                key={plan.id}
                asChild
                variant="outline"
                disabled={loading !== null}
              >
                <a href={CONTACT_SALES_URL}>
                  {plan.ctaLabel || `Contact sales (${plan.name})`}
                </a>
              </Button>
            );
          }
          return (
            <Button
              key={plan.id}
              onClick={() => handleCheckout(plan.stripePriceIdMonthly)}
              disabled={loading !== null || !plan.stripePriceIdMonthly}
              variant={plan.recommended ? "default" : "outline"}
            >
              {loading === plan.stripePriceIdMonthly ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading === plan.stripePriceIdMonthly
                ? "Loading..."
                : `Upgrade to ${plan.name} ($${plan.monthlyPrice}/mo)`}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
