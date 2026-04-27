"use client";

import { useEffect, useState } from "react";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const SLATE_200 = "#e2e8f0";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";
const SLATE_50 = "#f8fafc";
const GREEN = "#10b981";
const AMBER = "#f59e0b";
const RED = "#dc2626";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount_paid: number;
  amount_due: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string | null;
}

function statusColor(status: string | null) {
  switch (status) {
    case "paid":
      return GREEN;
    case "open":
    case "draft":
      return AMBER;
    case "uncollectible":
    case "void":
      return RED;
    default:
      return SLATE_500;
  }
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/invoices")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load invoices");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setInvoices(data.invoices ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        data-testid="invoices-list-error"
        style={{
          padding: 16,
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          fontFamily: FONT_INTER,
          fontSize: 13,
          color: RED,
        }}
      >
        Could not load invoices: {error}
      </div>
    );
  }

  if (invoices === null) {
    return (
      <div
        data-testid="invoices-list-loading"
        style={{
          padding: 16,
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          fontFamily: FONT_INTER,
          fontSize: 13,
          color: SLATE_500,
        }}
      >
        Loading invoices…
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div
        data-testid="invoices-list-empty"
        style={{
          padding: 18,
          background: SLATE_50,
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          fontFamily: FONT_INTER,
          fontSize: 13,
          color: SLATE_500,
        }}
      >
        No invoices yet. Once you upgrade, your billing history will appear here.
      </div>
    );
  }

  return (
    <div
      data-testid="invoices-list"
      style={{
        background: "#fff",
        border: `1px solid ${SLATE_200}`,
        borderRadius: 8,
        padding: 20,
        maxWidth: 960,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 15,
          color: NAVY,
          marginBottom: 12,
        }}
      >
        Billing history
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${SLATE_200}`, color: SLATE_500, textAlign: "left" }}>
            <th style={{ padding: "8px 4px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</th>
            <th style={{ padding: "8px 4px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</th>
            <th style={{ padding: "8px 4px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
            <th style={{ padding: "8px 4px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right" }}>Amount</th>
            <th style={{ padding: "8px 4px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right" }}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: `1px solid ${SLATE_200}` }}>
              <td style={{ padding: "10px 4px", fontFamily: FONT_MONO, color: SLATE_700 }}>
                {formatDate(inv.created)}
              </td>
              <td style={{ padding: "10px 4px", color: NAVY }}>
                {inv.description ?? inv.number ?? "Subscription"}
              </td>
              <td style={{ padding: "10px 4px" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: statusColor(inv.status),
                  }}
                >
                  {inv.status ?? "—"}
                </span>
              </td>
              <td
                style={{
                  padding: "10px 4px",
                  fontFamily: FONT_MONO,
                  fontWeight: 600,
                  color: NAVY,
                  textAlign: "right",
                }}
              >
                {formatAmount(inv.amount_paid || inv.amount_due, inv.currency)}
              </td>
              <td style={{ padding: "10px 4px", textAlign: "right" }}>
                {inv.invoice_pdf ? (
                  <a
                    href={inv.invoice_pdf}
                    target="_blank"
                    rel="noopener"
                    style={{ color: "#0e7490", fontWeight: 600, fontSize: 12 }}
                  >
                    PDF
                  </a>
                ) : inv.hosted_invoice_url ? (
                  <a
                    href={inv.hosted_invoice_url}
                    target="_blank"
                    rel="noopener"
                    style={{ color: "#0e7490", fontWeight: 600, fontSize: 12 }}
                  >
                    View
                  </a>
                ) : (
                  <span style={{ color: SLATE_500 }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
