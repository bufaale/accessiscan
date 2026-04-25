"use client";

import { useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import Link from "next/link";

/**
 * Pre-signup ROI calculator. Asks for industry + traffic to estimate the
 * range of accessibility-lawsuit liability the prospect is sitting on,
 * then routes them to /signup with the inputs encoded so the dashboard
 * can pre-populate their first scan.
 *
 * Numbers sourced from public 2025 settlement data:
 *  - DOJ Title II avg settlement: ~$50K SMB, ~$250K mid-market
 *  - ADA Title III private suits 2024-2025: avg ~$15K-50K settle, plus
 *    plaintiff attorney fees (~$30K-80K)
 *  - Higher-ed + healthcare are 2-3x base rate
 */

const INDUSTRY_MULTIPLIERS: Record<string, { label: string; multiplier: number }> = {
  ecommerce: { label: "E-commerce / retail", multiplier: 1.5 },
  healthcare: { label: "Healthcare / telehealth", multiplier: 2.5 },
  education: { label: "Education / training", multiplier: 2.0 },
  saas: { label: "SaaS / software", multiplier: 1.0 },
  government: { label: "Government / municipal", multiplier: 3.0 },
  financial: { label: "Financial services", multiplier: 2.2 },
  other: { label: "Other", multiplier: 1.0 },
};

const TRAFFIC_BANDS = [
  { id: "small", label: "Under 10K visits/mo", base_low: 5_000, base_high: 25_000 },
  { id: "medium", label: "10K – 100K visits/mo", base_low: 15_000, base_high: 75_000 },
  { id: "large", label: "100K – 1M visits/mo", base_low: 50_000, base_high: 250_000 },
  { id: "enterprise", label: "1M+ visits/mo", base_low: 150_000, base_high: 500_000 },
];

export interface RoiEstimate {
  industry: string;
  traffic: string;
  liability_low_usd: number;
  liability_high_usd: number;
}

export function calculateRoi(industry: string, traffic: string): RoiEstimate | null {
  const ind = INDUSTRY_MULTIPLIERS[industry];
  const band = TRAFFIC_BANDS.find((b) => b.id === traffic);
  if (!ind || !band) return null;
  return {
    industry,
    traffic,
    liability_low_usd: Math.round(band.base_low * ind.multiplier),
    liability_high_usd: Math.round(band.base_high * ind.multiplier),
  };
}

export function RoiCalculator() {
  const [industry, setIndustry] = useState("ecommerce");
  const [traffic, setTraffic] = useState("medium");
  const estimate = calculateRoi(industry, traffic);

  return (
    <section
      id="roi"
      className="border-y border-slate-200 bg-slate-50 py-16"
      aria-labelledby="roi-heading"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
          <Calculator className="h-3.5 w-3.5" />
          Liability calculator
        </div>
        <h2 id="roi-heading" className="font-display text-3xl font-semibold text-[#0b1f3a]">
          What does NOT fixing accessibility cost you?
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          DOJ Title II + ADA Title III settlements averaged $15K–$250K in 2024–2025.
          Calculate your range based on industry + traffic.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-left">
            <span className="block text-sm font-medium text-slate-700">Industry</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#0b1f3a]"
            >
              {Object.entries(INDUSTRY_MULTIPLIERS).map(([id, v]) => (
                <option key={id} value={id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-left">
            <span className="block text-sm font-medium text-slate-700">Monthly traffic</span>
            <select
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#0b1f3a] focus:outline-none focus:ring-1 focus:ring-[#0b1f3a]"
            >
              {TRAFFIC_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {estimate && (
          <div
            className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            data-testid="roi-result"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Estimated annual liability range
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[#0b1f3a]">
              ${formatNumber(estimate.liability_low_usd)} – ${formatNumber(estimate.liability_high_usd)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Based on 2024–2025 DOJ + private suit settlement data, scaled by industry risk
              multiplier and audience size.
            </p>
            <Link
              href={`/signup?industry=${estimate.industry}&traffic=${estimate.traffic}`}
              className="mt-5 inline-flex items-center gap-1 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428]"
            >
              Run my first scan free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          <strong>Not legal advice.</strong> Numbers are illustrative ranges from public
          settlement data. Consult counsel for liability assessment.
        </p>
      </div>
    </section>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
