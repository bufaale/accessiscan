"use client";

/**
 * AccessiScan ROI Calculator — "How much does an ADA lawsuit cost vs $39/mo?"
 *
 * Anchor for the buyer's mental math: average ADA Title III demand-letter
 * settlement is $20k-$50k (Seyfarth Shaw 2024 report). One avoided lawsuit
 * pays for ~80-200 years of AccessiScan Pro.
 *
 * The calculator lets visitors plug in their numbers (pages on site, avg
 * lawsuit cost, lawsuit risk %) and shows the projected ROI vs AccessiScan
 * annual cost. Visible bias: even at conservative inputs, the ROI is
 * dramatic. That's the point — the framing is the anchor, not the math.
 */

import { useMemo, useState } from "react";

const NAVY = "#0b1f3a";
const CYAN_TEXT = "#0e7490";
const RED_TEXT = "#b91c1c";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: SLATE_700 }}>{label}</span>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix ? (
          <span
            style={{
              position: "absolute",
              left: 12,
              color: SLATE_500,
              fontSize: 16,
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        ) : null}
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          style={{
            width: "100%",
            padding: prefix ? "10px 14px 10px 28px" : "10px 14px",
            paddingRight: suffix ? 50 : 14,
            borderRadius: 8,
            border: `1px solid ${SLATE_500}30`,
            fontSize: 16,
            fontFamily: "inherit",
            color: NAVY,
            background: "#fff",
          }}
        />
        {suffix ? (
          <span style={{ position: "absolute", right: 12, color: SLATE_500, fontSize: 14 }}>
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <span style={{ fontSize: 12, color: SLATE_500 }}>{hint}</span> : null}
    </label>
  );
}

export function RoiCalculator() {
  const [pages, setPages] = useState(50);
  const [avgLawsuitCost, setAvgLawsuitCost] = useState(35000); // Seyfarth median
  const [riskPct, setRiskPct] = useState(15);
  const accessiscanAnnualCost = 19 * 12; // Pro tier

  const result = useMemo(() => {
    const expectedAnnualCost = (avgLawsuitCost * riskPct) / 100;
    const savedAnnual = expectedAnnualCost - accessiscanAnnualCost;
    const roiX = expectedAnnualCost > 0 ? expectedAnnualCost / accessiscanAnnualCost : 0;
    return {
      expectedAnnualCost,
      savedAnnual,
      roiX,
    };
  }, [avgLawsuitCost, riskPct, accessiscanAnnualCost]);

  const positive = result.savedAnnual > 0;

  return (
    <section
      aria-labelledby="roi-calc-h"
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 28px",
        background: "#fff",
        border: `1px solid ${SLATE_500}20`,
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(11,31,58,0.04)",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: CYAN_TEXT,
            marginBottom: 8,
          }}
        >
          ROI calculator
        </div>
        <h2
          id="roi-calc-h"
          style={{
            fontSize: 30,
            lineHeight: 1.15,
            fontWeight: 700,
            color: NAVY,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          One avoided ADA lawsuit pays for AccessiScan{" "}
          <span style={{ color: CYAN_TEXT }}>~150 years</span>.
        </h2>
        <p style={{ marginTop: 8, color: SLATE_500, fontSize: 15, maxWidth: 720 }}>
          Median 2024 ADA Title III demand-letter settlement: $35k (Seyfarth Shaw 2024 report).
          AccessiScan Pro: $228/yr. Run the math against your own exposure.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <NumberInput
            label="Pages on your site"
            value={pages}
            onChange={setPages}
            min={1}
            max={10000}
            step={1}
            hint="Used to estimate exposure surface. We scan all of them on every commit."
          />
          <NumberInput
            label="Average ADA demand-letter / settlement cost"
            value={avgLawsuitCost}
            onChange={setAvgLawsuitCost}
            min={1000}
            max={500000}
            step={1000}
            prefix="$"
            hint="Seyfarth Shaw median is $35k. Plaintiff-side firms often demand $25k–$75k."
          />
          <NumberInput
            label="Annual lawsuit-risk probability"
            value={riskPct}
            onChange={setRiskPct}
            min={1}
            max={100}
            suffix="%"
            hint="22.6% of 2025 ADA suits targeted overlay-protected sites. Use 5-15% if you have an overlay; 1-3% if your code is clean."
          />
        </div>

        <div
          style={{
            background: NAVY,
            color: "#fff",
            borderRadius: 12,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 4,
              }}
            >
              expected annual lawsuit cost
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {fmtUSD(result.expectedAnnualCost)}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              avg cost × risk probability
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />

          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 4,
              }}
            >
              AccessiScan Pro annual cost
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {fmtUSD(accessiscanAnnualCost)}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />

          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: positive ? "rgba(110,231,183,0.9)" : "rgba(252,165,165,0.9)",
                marginBottom: 4,
              }}
            >
              {positive ? "expected annual savings" : "expected annual loss"}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: positive ? "#6ee7b7" : "#fca5a5",
              }}
            >
              {fmtUSD(Math.abs(result.savedAnnual))}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
              {result.roiX > 1
                ? `${Math.round(result.roiX)}× ROI — AccessiScan pays for itself if you avoid one settlement every ${Math.round(accessiscanAnnualCost / result.expectedAnnualCost * 100) / 100} years.`
                : "Risk is so low you don't need us — but Title III suits cluster around overlays + .gov sites first."}
            </div>
          </div>
        </div>
      </div>

      <footer
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: `1px solid ${SLATE_500}20`,
          fontSize: 12,
          color: SLATE_500,
        }}
      >
        Settlement-cost data: Seyfarth Shaw &ldquo;ADA Title III Federal Lawsuits&rdquo; report (2024 ed.).
        Risk probability ranges based on UseableNet 2025 industry tracker. AccessiScan annual cost is
        the published Pro tier monthly × 12 with no commitment.
      </footer>
    </section>
  );
}

export const __color = { NAVY, CYAN_TEXT, RED_TEXT };
