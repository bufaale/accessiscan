"use client";

import { useState } from "react";
import { updateBranding } from "./actions";

const FONT_INTER = "var(--font-inter), sans-serif";
const NAVY = "#0b1f3a";
const SLATE_500 = "#64748b";
const LINE = "#e2e8f0";

export function BrandingForm({
  isAgency,
  initial,
}: {
  isAgency: boolean;
  initial: { agencyName: string; accent: string };
}) {
  const [agencyName, setAgencyName] = useState(initial.agencyName);
  const [accent, setAccent] = useState(initial.accent || "#0e7490");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await updateBranding({ agencyName: agencyName.trim(), accent: accent.trim() });
      setMsg(res.ok ? { ok: true, text: "Saved — your next report download will carry your brand." } : { ok: false, text: res.error });
    } catch {
      setMsg({ ok: false, text: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  }

  const card: React.CSSProperties = {
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    padding: 24,
    background: "#fff",
    fontFamily: FONT_INTER,
  };
  const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 6 };
  const input: React.CSSProperties = { width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: NAVY, outline: "none" };

  if (!isAgency) {
    return (
      <div style={{ ...card, background: "#f8fafc" }}>
        <p style={{ margin: 0, fontSize: 14, color: NAVY, fontWeight: 600 }}>White-label is an Agency-plan feature</p>
        <p style={{ margin: "8px 0 16px", fontSize: 13.5, color: SLATE_500, lineHeight: 1.55 }}>
          Upgrade to the Agency plan (or above) to deliver WCAG reports under your own agency name and color — no AccessiScan mark.
        </p>
        <a href="/pricing" style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          See Agency pricing →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={save} style={card}>
      <div style={{ marginBottom: 18 }}>
        <label style={label} htmlFor="agencyName">Agency name (shown as &ldquo;Prepared by …&rdquo; on reports)</label>
        <input id="agencyName" style={input} value={agencyName} maxLength={80} placeholder="Acme Web Studio" onChange={(e) => setAgencyName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 22 }}>
        <label style={label} htmlFor="accent">Accent color (hex)</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input id="accent" style={{ ...input, maxWidth: 160, fontFamily: "monospace" }} value={accent} maxLength={7} placeholder="#0e7490" onChange={(e) => setAccent(e.target.value)} />
          <span aria-hidden style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${LINE}`, background: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#fff" }} />
        </div>
      </div>
      <button type="submit" disabled={saving} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving…" : "Save branding"}
      </button>
      {msg && (
        <p style={{ marginTop: 14, fontSize: 13, color: msg.ok ? "#15803d" : "#b91c1c" }}>{msg.text}</p>
      )}
    </form>
  );
}
