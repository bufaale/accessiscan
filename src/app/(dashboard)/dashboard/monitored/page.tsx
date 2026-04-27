"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const AMBER_50 = "#fffbeb";
const AMBER_700 = "#b45309";
const AMBER_900 = "#78350f";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_500 = "#64748b";

interface MonitoredSite {
  id: string;
  url: string;
  label: string | null;
  cadence: "daily" | "weekly" | "monthly";
  enabled: boolean;
  last_scan_at: string | null;
  last_score: number | null;
  last_critical: number;
  last_serious: number;
  alert_email: string | null;
  regression_threshold: number;
  created_at: string;
}

const inputStyle: CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 14px",
  border: `1px solid ${SLATE_200}`,
  borderRadius: 6,
  fontSize: 13.5,
  fontFamily: FONT_INTER,
  color: NAVY,
  background: "#fff",
  outline: "none",
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  appearance: "auto",
};

export default function MonitoredSitesPage() {
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [cadence, setCadence] = useState<MonitoredSite["cadence"]>("weekly");
  const [alertEmail, setAlertEmail] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/monitored");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSites(data.sites ?? []);
    } catch {
      toast.error("Failed to load monitored sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/monitored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          label: label || undefined,
          cadence,
          alert_email: alertEmail || undefined,
          regression_threshold: threshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setGated(true);
          toast.error(data.error ?? "Business plan required");
        } else {
          toast.error(data.error ?? "Create failed");
        }
        return;
      }
      toast.success("Site added to monitoring");
      setUrl("");
      setLabel("");
      setAlertEmail("");
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleEnabled(site: MonitoredSite) {
    await fetch(`/api/monitored/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !site.enabled }),
    });
    await load();
  }

  async function remove(site: MonitoredSite) {
    if (!confirm(`Stop monitoring ${site.label ?? site.url}?`)) return;
    await fetch(`/api/monitored/${site.id}`, { method: "DELETE" });
    toast.success("Removed");
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          Continuous monitoring
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER, maxWidth: 720 }}>
          Business tier feature. We re-scan each registered URL on your chosen cadence and email you when the compliance score drops or the critical issue count increases vs the last baseline. Up to 10 sites.
        </p>
      </div>

      {gated && (
        <div role="alert" style={{ background: AMBER_50, border: `1px solid #fcd34d`, borderRadius: 8, padding: 16, display: "flex", gap: 12, fontFamily: FONT_INTER }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: AMBER_700, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }} aria-hidden>!</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: AMBER_900, margin: 0 }}>
              Continuous monitoring is on the Business plan
            </p>
            <p style={{ fontSize: 12.5, color: AMBER_900, marginTop: 4, marginBottom: 12 }}>
              Upgrade to unlock weekly/daily re-scans, regression alerts via email, and up to 10 monitored properties.
            </p>
            <Link
              href="/settings/billing"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", textDecoration: "none" }}
            >
              See Business plan →
            </Link>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY, marginBottom: 4 }}>
          Add a site
        </div>
        <p style={{ fontSize: 12.5, color: SLATE_500, fontFamily: FONT_INTER, marginTop: 0, marginBottom: 18 }}>
          We&apos;ll take the first snapshot on the next cron tick. Regression alerts begin from the second snapshot onward.
        </p>

        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="URL" htmlFor="monitored-url" colSpan>
            <input
              id="monitored-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/checkout"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Label (optional)" htmlFor="monitored-label">
            <input
              id="monitored-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Marketing checkout"
              maxLength={80}
              style={inputStyle}
            />
          </Field>

          <Field label="Cadence" htmlFor="monitored-cadence">
            <select
              id="monitored-cadence"
              value={cadence}
              onChange={(e) => setCadence(e.target.value as MonitoredSite["cadence"])}
              style={selectStyle}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Field>

          <Field label="Alert email (optional)" htmlFor="monitored-alert">
            <input
              id="monitored-alert"
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Defaults to your account email"
              style={inputStyle}
            />
          </Field>

          <Field label="Regression threshold (score drop)" htmlFor="monitored-threshold">
            <input
              id="monitored-threshold"
              type="number"
              min={1}
              max={50}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={inputStyle}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              disabled={creating}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: creating ? SLATE_300 : NAVY, color: "#fff", border: "none", cursor: creating ? "not-allowed" : "pointer" }}
            >
              {creating ? "Adding..." : "+ Add to monitoring"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: NAVY, marginBottom: 12 }}>
          Your monitored sites <span style={{ fontFamily: FONT_MONO, color: SLATE_500, fontWeight: 500 }}>({sites.length}/10)</span>
        </h2>

        {loading ? (
          <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 32, textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER, fontSize: 13.5 }}>
            Loading...
          </div>
        ) : sites.length === 0 ? (
          <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY }}>
              No sites monitored yet
            </div>
            <p style={{ fontSize: 13, color: SLATE_500, marginTop: 6, marginBottom: 0, fontFamily: FONT_INTER }}>
              Add one above to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {sites.map((site) => (
              <SiteRow
                key={site.id}
                site={site}
                onToggle={() => toggleEnabled(site)}
                onRemove={() => remove(site)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  colSpan,
  children,
}: {
  label: string;
  htmlFor: string;
  colSpan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: FONT_INTER,
        gridColumn: colSpan ? "1 / -1" : undefined,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function SiteRow({
  site,
  onToggle,
  onRemove,
}: {
  site: MonitoredSite;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: FONT_INTER }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}>
            {site.label ?? site.url}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 8px",
              borderRadius: 9999,
              fontSize: 10.5,
              fontWeight: 600,
              background: site.enabled ? "rgba(22,163,74,0.10)" : SLATE_100,
              color: site.enabled ? "#16a34a" : SLATE_500,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: site.enabled ? "#16a34a" : SLATE_500 }} aria-hidden />
            {site.enabled ? "active" : "paused"}
          </span>
          <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 4, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", background: SLATE_100, color: SLATE_500 }}>
            {site.cadence}
          </span>
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: SLATE_500, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {site.url}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 11.5, color: SLATE_500, marginTop: 8 }}>
          {site.last_scan_at ? (
            <>
              <span>
                Last scan: <span style={{ fontFamily: FONT_MONO, color: NAVY }}>{new Date(site.last_scan_at).toLocaleString()}</span>
              </span>
              <span style={{ fontWeight: 600 }}>
                Score: <span style={{ fontFamily: FONT_MONO, color: NAVY }}>{site.last_score ?? "—"}</span>
              </span>
              {site.last_critical > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: RED, fontWeight: 600 }}>
                  ↓ {site.last_critical} critical
                </span>
              )}
            </>
          ) : (
            <span>Awaiting first scan on next cron tick…</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Toggle checked={site.enabled} onClick={onToggle} />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Stop monitoring ${site.label ?? site.url}`}
          style={{ width: 32, height: 32, border: `1px solid ${SLATE_200}`, borderRadius: 6, background: "#fff", color: SLATE_500, cursor: "pointer", fontSize: 14 }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      style={{ position: "relative", width: 36, height: 20, borderRadius: 9999, background: checked ? CYAN : SLATE_300, border: "none", cursor: "pointer", padding: 0, transition: "background-color .15s ease" }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          transition: "left .15s ease",
        }}
        aria-hidden
      />
    </button>
  );
}
