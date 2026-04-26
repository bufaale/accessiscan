"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { pricingPlans } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function SubscribeButton({
  priceId,
  recommended,
}: {
  priceId: string;
  recommended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      if (res.status === 401) {
        router.push("/signup");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to start checkout. Please try again.");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "h-11 w-full rounded-md text-sm font-semibold shadow-none",
        recommended
          ? "bg-[#0b1f3a] text-white hover:bg-[#071428]"
          : "border border-slate-300 bg-white text-[#0b1f3a] hover:border-[#0b1f3a] hover:bg-slate-50",
      )}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Loading..." : "Start free — upgrade anytime"}
    </Button>
  );
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  return (
    <section id="pricing" className="bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-[#0b1f3a] sm:text-5xl">
            Straightforward pricing.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            No per-user fees, no custom quotes. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              !isYearly ? "text-[#0b1f3a]" : "text-slate-500",
            )}
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={cn(
              "text-sm font-medium",
              isYearly ? "text-[#0b1f3a]" : "text-slate-500",
            )}
          >
            Yearly
            <span className="ml-2 rounded-sm bg-[#ecfeff] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0b1f3a]">
              Save 17%
            </span>
          </span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? "/yr" : "/mo";
            const priceId = isYearly
              ? plan.stripePriceIdYearly
              : plan.stripePriceIdMonthly;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-md border bg-white p-6 transition-shadow hover:shadow-sm",
                  plan.recommended
                    ? "border-slate-200 border-t-[3px] border-t-[#06b6d4]"
                    : "border-slate-200",
                )}
              >
                {plan.recommended && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-sm bg-[#ecfeff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b1f3a]">
                    Most popular
                  </span>
                )}
                <p className="font-display text-lg font-semibold text-[#0b1f3a]">
                  {plan.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight text-[#0b1f3a]">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-slate-500">{period}</span>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#06b6d4]"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm leading-snug text-slate-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  {plan.monthlyPrice === 0 ? (
                    <Button
                      asChild
                      className="h-11 w-full rounded-md border border-slate-300 bg-white text-sm font-semibold text-[#0b1f3a] shadow-none hover:border-[#0b1f3a] hover:bg-slate-50"
                    >
                      <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                        {isLoggedIn ? "Go to dashboard" : "Start free"}
                      </Link>
                    </Button>
                  ) : plan.contactSales ? (
                    <Button
                      asChild
                      className="h-11 w-full rounded-md bg-[#0b1f3a] text-sm font-semibold text-white shadow-none hover:bg-[#071428]"
                    >
                      <Link href="mailto:alex@piposlab.com?subject=AccessiScan%20Team%20tier%20inquiry">
                        {plan.ctaLabel ?? "Contact sales"}
                      </Link>
                    </Button>
                  ) : (
                    <SubscribeButton
                      priceId={priceId}
                      recommended={plan.recommended}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
