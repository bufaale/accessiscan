"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2027-04-26T00:00:00Z").getTime();

function calc() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function AlertIcon({ size = 18, sw = 2 }: { size?: number; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ArrowRightIcon({ size = 12, sw = 2.5 }: { size?: number; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function DojBannerLive() {
  const [t, setT] = useState(() => calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  const cells: [string, string][] = [
    [String(t.d), "Days"],
    [String(t.h).padStart(2, "0"), "Hrs"],
    [String(t.m).padStart(2, "0"), "Min"],
    [String(t.s).padStart(2, "0"), "Sec"],
  ];
  return (
    <div
      style={{
        background: "#dc2626",
        color: "#fff",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        fontFamily: "var(--font-inter), sans-serif",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AlertIcon />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            DOJ Title II Web Accessibility Deadline · Apr 26, 2027
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>
            Public entities with 50,000+ residents
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, fontFamily: "var(--font-mono), monospace" }}>
        {cells.map(([n, l], i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 38,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {n}
              </span>
              <span
                style={{
                  fontSize: 8.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: "rgba(255,255,255,.75)",
                  marginTop: 2,
                }}
              >
                {l}
              </span>
            </span>
            {i < cells.length - 1 && (
              <span style={{ color: "rgba(255,255,255,.4)" }}>·</span>
            )}
          </span>
        ))}
      </div>
      <a
        href="#cta"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "0 14px",
          height: 32,
          background: "#fff",
          color: "#7f1d1d",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Scan for Title II violations <ArrowRightIcon />
      </a>
    </div>
  );
}
