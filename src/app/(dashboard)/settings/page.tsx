"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";

/**
 * /settings remains the legacy thin profile route. The richer profile UX
 * (header, role pill, notifications, security, danger zone) lives at
 * /settings/profile. This page is kept as a thin compatibility shim so that
 * existing inbound links + smoke tests continue to work — sidebar and
 * top-nav have been updated to point at /settings/profile directly.
 */
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const NAVY = "#0b1f3a";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_500 = "#64748b";

const inputStyle: React.CSSProperties = {
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

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: SLATE_50,
  color: SLATE_500,
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          Profile settings
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER }}>
          Manage your account information.{" "}
          <a href="/settings/profile" style={{ color: "#0e7490", fontWeight: 600 }}>
            Open the full profile experience →
          </a>
        </p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24, maxWidth: 640 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY, marginBottom: 4 }}>
          Profile
        </div>
        <p style={{ fontSize: 12.5, color: SLATE_500, fontFamily: FONT_INTER, marginTop: 0, marginBottom: 18 }}>
          Update your personal information.
        </p>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 40, background: SLATE_100, borderRadius: 6 }} aria-hidden />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Full name" htmlFor="fullName">
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                aria-label="Full Name"
                style={inputStyle}
              />
            </Field>

            <Field label="Email" htmlFor="email" hint="Email cannot be changed here">
              <input id="email" value={email} disabled placeholder="you@example.com" aria-label="Email" style={disabledInputStyle} />
            </Field>

            <Field label="Avatar URL" htmlFor="avatarUrl">
              <input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                style={inputStyle}
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              style={{ alignSelf: "flex-start", marginTop: 6, height: 40, padding: "0 18px", fontSize: 14, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: saving ? SLATE_300 : NAVY, color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>

      <DeleteAccountButton />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontFamily: FONT_INTER }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: SLATE_500, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}
