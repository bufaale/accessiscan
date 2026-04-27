"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateProfileDetails,
  updateNotificationPreferences,
  sendPasswordResetEmail,
} from "./actions";
import type { NotificationPreferences } from "@/types/database";

// ===== design tokens (match billing page + design reference) =====
const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_400 = "#94a3b8";
const SLATE_500 = "#64748b";
const SLATE_700 = "#334155";

// Common timezones (subset — covers the vast majority of users)
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "UTC",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Argentina",
  "Mexico",
  "Brazil",
  "Spain",
  "France",
  "Germany",
  "Italy",
  "Netherlands",
  "Australia",
  "Japan",
  "India",
  "Other",
];

export interface ProfileFormProps {
  userId: string;
  email: string;
  emailVerified: boolean;
  lastSignInAt: string | null;
  memberSince: string;
  role: string; // "admin" | "user"
  plan: string; // "free" | "pro" | "agency" | "business"
  initial: {
    full_name: string;
    avatar_url: string;
    company: string;
    country: string;
    timezone: string;
    notifications: NotificationPreferences;
  };
}

// ===== inline icon components (avoid dangerouslySetInnerHTML) =====
const iconBaseProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CheckIcon({ size = 14, sw = 2 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} {...iconBaseProps} strokeWidth={sw} aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function InfoIcon({ size = 14, sw = 1.7, style }: { size?: number; sw?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} {...iconBaseProps} strokeWidth={sw} style={style} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function TrashIcon({ size = 14, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} {...iconBaseProps} strokeWidth={sw} aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
function LockIcon({ size = 18, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} {...iconBaseProps} strokeWidth={sw} aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function MonitorIcon({ size = 18, sw = 1.8 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} {...iconBaseProps} strokeWidth={sw} aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function deriveInitials(fullName: string, email: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email.slice(0, 2) || "??").toUpperCase();
}

function rolePillStyle(plan: string, role: string): {
  label: string;
  bg: string;
  fg: string;
  dot: string;
} {
  if (role === "admin") return { label: "ADMIN", bg: "rgba(245,158,11,0.10)", fg: AMBER, dot: AMBER };
  switch (plan) {
    case "business":
      return { label: "BUSINESS", bg: "rgba(16,185,129,0.10)", fg: GREEN, dot: GREEN };
    case "agency":
      return { label: "AGENCY", bg: "rgba(11,31,58,0.08)", fg: NAVY, dot: NAVY };
    case "pro":
      return { label: "PRO", bg: "rgba(6,182,212,0.10)", fg: CYAN, dot: CYAN };
    default:
      return { label: "FREE", bg: "rgba(100,116,139,0.10)", fg: SLATE_500, dot: SLATE_500 };
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

// ===== reusable section wrapper =====
function Section({
  eyebrow,
  title,
  description,
  children,
  footer,
  danger,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  danger?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        background: "#fff",
        border: danger ? `1px solid rgba(220,38,38,0.35)` : `1px solid ${SLATE_200}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "22px 24px 4px" }}>
        {eyebrow && (
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: danger ? RED : CYAN, marginBottom: 8, fontFamily: FONT_INTER }}>
            {eyebrow}
          </div>
        )}
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: danger ? "#7f1d1d" : NAVY, letterSpacing: "-0.01em" }}>
          {title}
        </div>
        {description && (
          <div style={{ marginTop: 6, fontSize: 13, color: SLATE_500, lineHeight: 1.55, maxWidth: 640, fontFamily: FONT_INTER }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ padding: "18px 24px 22px" }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "14px 24px",
            background: danger ? "rgba(220,38,38,0.04)" : SLATE_50,
            borderTop: `1px solid ${danger ? "rgba(220,38,38,0.18)" : SLATE_200}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

function FormRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 32,
        alignItems: "flex-start",
        padding: "14px 0",
        borderTop: `1px solid ${SLATE_100}`,
      }}
    >
      <div style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: FONT_INTER }}>{label}</div>
        {hint && (
          <div style={{ marginTop: 4, fontSize: 12, color: SLATE_500, lineHeight: 1.5, fontFamily: FONT_INTER }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

const baseInputStyle: React.CSSProperties = {
  height: 38,
  width: "100%",
  maxWidth: 380,
  padding: "0 12px",
  border: `1px solid ${SLATE_300}`,
  borderRadius: 6,
  fontSize: 14,
  fontFamily: FONT_INTER,
  color: NAVY,
  background: "#fff",
  outline: "none",
};

// ===== main component =====
export function ProfileForm(props: ProfileFormProps) {
  const { userId: _userId, email, emailVerified, lastSignInAt, memberSince, role, plan, initial } = props;
  void _userId;

  // ----- Account details state -----
  const [fullName, setFullName] = useState(initial.full_name);
  const [company, setCompany] = useState(initial.company);
  const [country, setCountry] = useState(initial.country);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);

  const [origDetails] = useState({
    full_name: initial.full_name,
    company: initial.company,
    country: initial.country,
    timezone: initial.timezone,
    avatar_url: initial.avatar_url,
  });
  const [savedToast, setSavedToast] = useState(false);
  const [savingDetails, startSaveDetails] = useTransition();

  const dirty =
    fullName !== origDetails.full_name ||
    company !== origDetails.company ||
    country !== origDetails.country ||
    timezone !== origDetails.timezone ||
    avatarUrl !== origDetails.avatar_url;

  // ----- Notifications state -----
  const [notifs, setNotifs] = useState<NotificationPreferences>(initial.notifications);
  const [savingNotifs, startSaveNotifs] = useTransition();

  // ----- Security state -----
  const [pwResetSending, startPwReset] = useTransition();

  // ----- Sessions: TODO B7 -----
  // The "Sign out all devices" / active session list backend isn't shipped yet.
  // We render a placeholder + toast. Wire up to /api/auth/signout-all in B7.

  // ----- Danger zone -----
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const initials = deriveInitials(fullName, email);
  const pill = rolePillStyle(plan, role);

  function handleSaveDetails() {
    startSaveDetails(async () => {
      const res = await updateProfileDetails({
        full_name: fullName,
        company,
        country,
        timezone,
        avatar_url: avatarUrl,
      });
      if (res.ok) {
        toast.success("Profile updated");
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2400);
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDiscard() {
    setFullName(origDetails.full_name);
    setCompany(origDetails.company);
    setCountry(origDetails.country);
    setTimezone(origDetails.timezone);
    setAvatarUrl(origDetails.avatar_url);
  }

  function toggleNotif(key: keyof NotificationPreferences) {
    const previous = notifs;
    const next: NotificationPreferences = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    startSaveNotifs(async () => {
      const res = await updateNotificationPreferences(next);
      if (!res.ok) {
        // Roll back on failure
        setNotifs(previous);
        toast.error(res.error);
        return;
      }
      toast.success("Notification preferences saved");
    });
  }

  function handlePasswordReset() {
    startPwReset(async () => {
      const res = await sendPasswordResetEmail();
      if (res.ok) {
        toast.success("Password reset link sent — check your inbox.");
      } else {
        toast.error(res.error);
      }
    });
  }

  async function handleDelete() {
    if (deleteConfirm !== email) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE MY ACCOUNT" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Delete failed");
        setDeleting(false);
        return;
      }
      toast.success("Account deleted");
      window.location.href = "/";
    } catch {
      toast.error("Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, color: NAVY }}>
      {/* Header card with avatar + name + role pill + meta */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          padding: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <ProfileAvatar initials={initials} avatarUrl={avatarUrl} size={84} ring />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 26,
                color: NAVY,
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
              }}
              data-testid="profile-display-name"
            >
              {fullName || email.split("@")[0]}
            </div>
            <span
              data-testid="role-pill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 9999,
                background: pill.bg,
                color: pill.fg,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.10em",
                fontFamily: FONT_INTER,
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: pill.dot }} aria-hidden />
              {pill.label}
            </span>
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12.5, color: SLATE_500, fontFamily: FONT_INTER }}>
            <span>
              <span style={{ color: SLATE_400 }}>Email · </span>
              <span style={{ color: SLATE_700, fontFamily: FONT_MONO, fontSize: 12 }}>{email}</span>
            </span>
            <span>
              <span style={{ color: SLATE_400 }}>Member since · </span>
              <span style={{ color: SLATE_700 }}>{formatDate(memberSince)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Account details section */}
      <Section
        title="Account details"
        description="Your name appears on VPAT 2.5 and Section 508 exports as the report author. Company and timezone help us format compliance reports for procurement."
        footer={
          <>
            <div
              style={{
                fontSize: 12,
                color: SLATE_500,
                fontFamily: FONT_INTER,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              data-testid="details-footer-status"
            >
              {dirty ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER }} aria-hidden />
                  Unsaved changes.
                </>
              ) : savedToast ? (
                <span style={{ color: "#0e7490", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <CheckIcon size={12} sw={2.5} /> Saved.
                </span>
              ) : (
                "Last updated " + formatDate(memberSince) + "."
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!dirty || savingDetails}
                style={outlineBtn(!dirty || savingDetails)}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={!dirty || savingDetails}
                style={primaryBtn(!dirty || savingDetails)}
                data-testid="save-details"
              >
                {savingDetails ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        }
      >
        <FormRow label="Full name" hint="As it should appear on procurement-grade reports.">
          <input
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-label="Full Name"
            style={baseInputStyle}
            placeholder="Jane Doe"
          />
        </FormRow>

        <FormRow label="Work email" hint="We send scan summaries and DOJ deadline reminders here. Email cannot be changed here.">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              id="email"
              value={email}
              disabled
              readOnly
              aria-label="Email"
              style={{
                ...baseInputStyle,
                background: SLATE_50,
                color: SLATE_500,
                fontFamily: FONT_MONO,
                fontSize: 13,
                maxWidth: 320,
              }}
            />
            {emailVerified ? (
              <span
                data-testid="email-verified-badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "rgba(16,185,129,0.10)",
                  color: GREEN,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  fontFamily: FONT_INTER,
                }}
              >
                <CheckIcon size={11} sw={2.5} />
                Verified
              </span>
            ) : (
              <span style={{ fontSize: 11, color: AMBER, fontWeight: 600, fontFamily: FONT_INTER }}>Unverified</span>
            )}
          </div>
        </FormRow>

        <FormRow label="Company" hint="Optional. Shown next to your signature on VPAT exports.">
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            aria-label="Company"
            style={baseInputStyle}
            placeholder="Acme Agency"
          />
        </FormRow>

        <FormRow label="Country" hint="Used to default report jurisdiction (DOJ Title II vs EAA / EN 301 549).">
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Country"
            style={{ ...baseInputStyle, background: "#fff", appearance: "auto" }}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label="Timezone" hint="Used for scheduled scans and digest emails.">
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            aria-label="Timezone"
            style={{ ...baseInputStyle, background: "#fff", appearance: "auto" }}
          >
            <option value="">Auto-detect from browser</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label="Avatar URL" hint="Optional. PNG/JPG, square, 512×512 recommended.">
          <input
            id="avatar_url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            aria-label="Avatar URL"
            placeholder="https://example.com/me.png"
            style={baseInputStyle}
          />
        </FormRow>
      </Section>

      {/* Notifications */}
      <Section
        title="Notifications"
        description="Choose which emails you want to receive. We'll never share your email with third parties."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
          <NotifRow
            id="scan_complete"
            label="Scan completion"
            description="Email me when a scan finishes — score, critical count, and a link to the report."
            checked={notifs.scan_complete}
            disabled={savingNotifs}
            onToggle={() => toggleNotif("scan_complete")}
          />
          <NotifRow
            id="weekly_summary"
            label="Weekly summary"
            description="Every Monday at 09:00 UTC. Trend, top violations, and DOJ countdown."
            checked={notifs.weekly_summary}
            disabled={savingNotifs}
            onToggle={() => toggleNotif("weekly_summary")}
          />
          <NotifRow
            id="compliance_alerts"
            label="Compliance alerts"
            description="Critical regressions, new violations on monitored sites, and DOJ deadline reminders."
            checked={notifs.compliance_alerts}
            disabled={savingNotifs}
            onToggle={() => toggleNotif("compliance_alerts")}
          />
          <NotifRow
            id="marketing_emails"
            label="Product updates & tips"
            description="Occasional emails about new features, accessibility best practices, and case studies. No more than 1 per week."
            checked={notifs.marketing_emails}
            disabled={savingNotifs}
            onToggle={() => toggleNotif("marketing_emails")}
          />
        </div>
      </Section>

      {/* Security */}
      <Section
        title="Security"
        description="AccessiScan supports SSO and passkeys for organization-wide rollouts. For now, password is reset via email link."
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 4, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: SLATE_100,
                color: NAVY,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LockIcon size={18} sw={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, color: NAVY, fontWeight: 600, fontFamily: FONT_INTER }}>Password</div>
              <div style={{ fontSize: 12, color: SLATE_500, fontFamily: FONT_INTER }}>
                Last sign-in {formatDateTime(lastSignInAt)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={pwResetSending}
            style={outlineBtn(pwResetSending)}
            data-testid="reset-password"
          >
            {pwResetSending ? "Sending…" : "Reset via email"}
          </button>
        </div>
      </Section>

      {/* Sessions (placeholder — backend deferred to B7) */}
      <Section
        title="Active sessions"
        description="Devices currently signed in to your AccessiScan account. Sign out everywhere if you suspect a compromise."
      >
        <div
          style={{
            paddingTop: 4,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              border: `1px dashed ${SLATE_200}`,
              borderRadius: 8,
              background: SLATE_50,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#fff",
                border: `1px solid ${SLATE_200}`,
                color: SLATE_500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MonitorIcon size={18} sw={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: NAVY, fontWeight: 600, fontFamily: FONT_INTER }}>
                Current session
              </div>
              <div style={{ fontSize: 12, color: SLATE_500, fontFamily: FONT_INTER }}>
                Last active just now · this browser
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.message("Multi-device session management is coming in the next release.")
              }
              style={outlineBtn(false)}
            >
              Sign out all devices
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: SLATE_400, fontFamily: FONT_INTER }}>
            <InfoIcon size={11} sw={2} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Multi-device session listing ships in the next release.
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section
        danger
        eyebrow="Danger zone"
        title="Delete account"
        description="Permanently delete your AccessiScan account, all scan history, VPAT exports, and any pending Auto-Fix PRs authored by you. This cannot be undone."
      >
        {!showDelete ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              paddingTop: 4,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12.5, color: "#7f1d1d", fontFamily: FONT_INTER, lineHeight: 1.5, maxWidth: 540 }}>
              Under GDPR Art. 17 / CCPA, you can request permanent deletion of your account and all associated data
              (scans, VPATs, sites, monitored sites, tracker integrations). Active Stripe subscriptions are cancelled first.
            </div>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              style={dangerOutlineBtn(false)}
              data-testid="open-delete"
            >
              <TrashIcon size={12} sw={2} />
              <span style={{ marginLeft: 6 }}>Delete account…</span>
            </button>
          </div>
        ) : (
          <div style={{ paddingTop: 4, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, color: "#7f1d1d", fontFamily: FONT_INTER, lineHeight: 1.55 }}>
              Type your account email{" "}
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  color: RED,
                  background: "rgba(220,38,38,0.08)",
                  padding: "1px 6px",
                  borderRadius: 3,
                }}
              >
                {email}
              </span>{" "}
              below to confirm. This action is permanent.
            </div>
            <input
              id="delete_confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={email}
              aria-label="Type account email to confirm"
              style={{
                ...baseInputStyle,
                fontFamily: FONT_MONO,
                maxWidth: 420,
              }}
              autoComplete="off"
              data-testid="delete-confirm-input"
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false);
                  setDeleteConfirm("");
                }}
                style={ghostBtn()}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirm !== email || deleting}
                style={dangerBtn(deleteConfirm !== email || deleting)}
                data-testid="confirm-delete"
                aria-disabled={deleteConfirm !== email || deleting}
              >
                <TrashIcon size={12} sw={2} />
                <span style={{ marginLeft: 6 }}>{deleting ? "Deleting…" : "Permanently delete account"}</span>
              </button>
            </div>
          </div>
        )}
      </Section>

      <div
        style={{
          marginTop: 8,
          fontSize: 11.5,
          color: SLATE_400,
          fontFamily: FONT_INTER,
          textAlign: "center",
        }}
      >
        AccessiScan does not warrant legal compliance. Consult qualified counsel.
      </div>
    </div>
  );
}

// ===== Avatar (with image fallback to initials) =====
function ProfileAvatar({
  initials,
  avatarUrl,
  size,
  ring,
}: {
  initials: string;
  avatarUrl: string;
  size: number;
  ring?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = avatarUrl && !errored;

  return (
    <div
      data-testid="profile-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: NAVY,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: "-0.01em",
        flexShrink: 0,
        boxShadow: ring ? `0 0 0 4px #fff, 0 0 0 5px ${SLATE_200}` : "none",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label={`Avatar showing initials ${initials}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span data-testid="profile-initials">{initials}</span>
      )}
    </div>
  );
}

// ===== Notification toggle row =====
function NotifRow({
  id,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      htmlFor={`notif-${id}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "12px 0",
        borderTop: `1px solid ${SLATE_100}`,
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, fontFamily: FONT_INTER }}>{label}</div>
        <div style={{ marginTop: 3, fontSize: 12, color: SLATE_500, lineHeight: 1.5, fontFamily: FONT_INTER }}>
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        id={`notif-${id}`}
        data-testid={`notif-${id}`}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onToggle();
        }}
        disabled={disabled}
        style={{
          flexShrink: 0,
          width: 40,
          height: 22,
          borderRadius: 9999,
          border: 0,
          padding: 2,
          background: checked ? CYAN : SLATE_300,
          cursor: disabled ? "wait" : "pointer",
          position: "relative",
          transition: "background-color .15s",
          marginTop: 2,
        }}
      >
        <span
          aria-hidden
          style={{
            display: "block",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transform: `translateX(${checked ? 18 : 0}px)`,
            transition: "transform .15s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        />
      </button>
    </label>
  );
}

// ===== button styles =====
function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 36,
    padding: "0 16px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    background: disabled ? SLATE_300 : NAVY,
    color: "#fff",
    border: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}
function outlineBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 36,
    padding: "0 14px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    background: "#fff",
    color: NAVY,
    border: `1px solid ${SLATE_300}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}
function dangerOutlineBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 36,
    padding: "0 14px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    background: "#fff",
    color: RED,
    border: `1px solid rgba(220,38,38,0.4)`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}
function dangerBtn(disabled: boolean): React.CSSProperties {
  return {
    height: 36,
    padding: "0 16px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    background: disabled ? "rgba(220,38,38,0.45)" : RED,
    color: "#fff",
    border: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}
function ghostBtn(): React.CSSProperties {
  return {
    height: 36,
    padding: "0 12px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: FONT_INTER,
    borderRadius: 6,
    background: "transparent",
    color: SLATE_500,
    border: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}
