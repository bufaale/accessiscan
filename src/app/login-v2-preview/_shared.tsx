"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ============================================================
//  Tokens
// ============================================================
const C = {
  navy900: "#0b1f3a",
  navy950: "#071428",
  navy800: "#122c4f",
  cyan500: "#06b6d4",
  cyan400: "#22d3ee",
  cyan50: "#ecfeff",
  red600: "#dc2626",
  red700: "#b91c1c",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate900: "#0f172a",
} as const;

const F_DISPLAY = "var(--font-display), sans-serif";
const F_SANS = "var(--font-inter), sans-serif";
const F_MONO = "var(--font-mono), monospace";

export type Mode = "login" | "signup";

// ============================================================
//  Icons
// ============================================================
type IconProps = { size?: number; sw?: number; style?: CSSProperties };

function IconShield({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
    </svg>
  );
}
function IconArrowR({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconCheck({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconEye({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3.17 4.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 5.39-1.39" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
function IconMail({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}
function IconLock({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function IconUser({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconAlert({ size = 16, sw = 1.7, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.2C41.5 35.5 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.3.8 1 .8 2v3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

// ============================================================
//  Brand mark
// ============================================================
function Logo({ dark = false, size = "md" }: { dark?: boolean; size?: "md" | "lg" }) {
  const dim = size === "lg" ? { tile: 32, ic: 18, font: 24, gap: 10 } : { tile: 24, ic: 14, font: 18, gap: 8 };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: dim.gap, fontFamily: F_DISPLAY, fontWeight: 700, fontSize: dim.font, letterSpacing: "-0.01em", color: dark ? "#fff" : C.navy900 }}>
      <span style={{ width: dim.tile, height: dim.tile, borderRadius: 6, background: C.cyan500, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <IconShield size={dim.ic} sw={2.5} />
      </span>
      AccessiScan
    </div>
  );
}

// ============================================================
//  Form primitives
// ============================================================
type EyebrowColor = "slate" | "cyan" | "white55";

function Eyebrow({ children, color = "slate" }: { children: ReactNode; color?: EyebrowColor }) {
  return (
    <span
      style={{
        fontFamily: F_SANS,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color === "cyan" ? C.cyan500 : color === "white55" ? "rgba(255,255,255,0.55)" : C.slate500,
      }}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  trailing,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: F_SANS, fontSize: 13, fontWeight: 600, color: C.slate700 }}>{label}</span>
        {trailing}
      </div>
      {children}
      {error ? (
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, color: C.red600, fontSize: 12 }}>
          <IconAlert size={12} sw={2.2} /> {error}
        </div>
      ) : hint ? (
        <div style={{ marginTop: 6, fontSize: 12, color: C.slate500 }}>{hint}</div>
      ) : null}
    </label>
  );
}

function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  leadIcon,
  error,
  onBlur,
  onFocus,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  leadIcon?: ReactNode;
  error?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
}) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? C.red600 : focus ? C.navy900 : C.slate200;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 44,
        background: "#fff",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        transition: "border-color .15s ease, box-shadow .15s ease",
        boxShadow: focus ? `0 0 0 3px ${error ? "rgba(220,38,38,.12)" : "rgba(11,31,58,.08)"}` : "none",
      }}
    >
      {leadIcon ? (
        <span style={{ display: "inline-flex", color: C.slate400, paddingLeft: 12, paddingRight: 8 }}>{leadIcon}</span>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14.5,
          color: C.navy900,
          paddingLeft: leadIcon ? 0 : 14,
          paddingRight: 12,
          fontFamily: F_SANS,
        }}
      />
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  error,
  onBlur,
  placeholder = "********",
}: {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  const borderColor = error ? C.red600 : focus ? C.navy900 : C.slate200;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 44,
        background: "#fff",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        transition: "border-color .15s ease, box-shadow .15s ease",
        boxShadow: focus ? `0 0 0 3px ${error ? "rgba(220,38,38,.12)" : "rgba(11,31,58,.08)"}` : "none",
      }}
    >
      <span style={{ display: "inline-flex", color: C.slate400, paddingLeft: 12, paddingRight: 8 }}>
        <IconLock size={16} sw={1.8} />
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocus(true)}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14.5,
          color: C.navy900,
          paddingRight: 8,
          fontFamily: F_SANS,
          letterSpacing: show ? "normal" : "0.06em",
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: C.slate500,
          padding: "0 12px",
          height: "100%",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {show ? <IconEyeOff size={16} sw={1.8} /> : <IconEye size={16} sw={1.8} />}
      </button>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  trailIcon,
  loading,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  trailIcon?: ReactNode;
  loading?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        height: 48,
        borderRadius: 8,
        border: "none",
        cursor: disabled || loading ? "default" : "pointer",
        background: disabled ? C.slate300 : hover ? C.navy950 : C.navy900,
        color: "#fff",
        fontWeight: 600,
        fontSize: 14.5,
        fontFamily: F_SANS,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background-color .15s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid rgba(255,255,255,.4)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "av2-spin 0.7s linear infinite",
          }}
        />
      ) : null}
      {children}
      {!loading ? trailIcon : null}
    </button>
  );
}

function SsoButton({
  children,
  icon,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        height: 44,
        borderRadius: 8,
        border: `1px solid ${hover && !disabled ? C.navy900 : C.slate300}`,
        background: disabled ? C.slate100 : hover ? C.slate50 : "#fff",
        color: C.navy900,
        fontWeight: 600,
        fontSize: 14,
        fontFamily: F_SANS,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all .15s ease",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        cursor: "pointer",
        fontSize: 13,
        color: C.slate600,
        lineHeight: 1.5,
        position: "relative",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `1.5px solid ${checked ? C.navy900 : C.slate300}`,
          background: checked ? C.navy900 : "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          transition: "all .15s ease",
          color: "#fff",
        }}
      >
        {checked ? <IconCheck size={12} sw={3} /> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
      />
      <span>{children}</span>
    </label>
  );
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
      <span style={{ flex: 1, height: 1, background: C.slate200 }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.slate500 }}>
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: C.slate200 }} />
    </div>
  );
}

// ============================================================
//  Right panel
// ============================================================
function RightPanel() {
  return (
    <aside
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.navy900,
        color: "#fff",
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-10% -20% auto auto",
          width: 520,
          height: 520,
          background: "radial-gradient(60% 60% at 50% 50%, rgba(6,182,212,0.20), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "auto auto -30% -20%",
          width: 480,
          height: 480,
          background: "radial-gradient(60% 60% at 50% 50%, rgba(220,38,38,0.10), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo dark size="lg" />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            border: "1px solid rgba(6,182,212,.40)",
            background: "rgba(6,182,212,.10)",
            borderRadius: 4,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan500 }} />
          <Eyebrow color="cyan">Title II Apr 2027</Eyebrow>
        </div>
      </div>

      <div style={{ position: "relative", maxWidth: 520 }}>
        <Eyebrow color="white55">2025 federal docket - DOJ Title II</Eyebrow>
        <blockquote
          style={{
            margin: "20px 0 0",
            padding: 0,
            fontFamily: F_DISPLAY,
            fontWeight: 600,
            fontSize: 36,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "block",
              fontFamily: F_DISPLAY,
              fontSize: 64,
              lineHeight: 0.6,
              color: C.cyan500,
              marginBottom: 14,
              fontWeight: 700,
            }}
          >
            &ldquo;
          </span>
          <span style={{ color: C.cyan400 }}>5,100+</span> federal ADA suits in 2025. Ours is the workflow that ships fix code.
        </blockquote>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "stretch",
            gap: 24,
            padding: "20px 24px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            backdropFilter: "blur(2px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontFamily: F_DISPLAY,
                fontWeight: 700,
                fontSize: 56,
                lineHeight: 1,
                color: C.cyan500,
                letterSpacing: "-0.02em",
              }}
            >
              $19<span style={{ fontSize: 22, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>/mo</span>
            </span>
            <Eyebrow color="white55">What AccessiScan costs</Eyebrow>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.10)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
            <span style={{ fontFamily: F_MONO, fontSize: 13, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>
              <span
                style={{
                  color: C.slate400,
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(255,255,255,0.4)",
                }}
              >
                $15,000/yr
              </span>
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              vs. Siteimprove enterprise contract
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 18px",
            fontSize: 12.5,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {["No credit card required", "Free tier - 2 scans/mo", "Not an overlay"].map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <IconCheck size={13} sw={2.5} style={{ color: C.cyan500 }} /> {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["WCAG 2.1 AA", "Section 508", "EN 301 549", "VPAT 2.5"].map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 4,
                fontFamily: F_SANS,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan500 }} />
              {t}
            </span>
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11.5,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.55,
            fontFamily: F_SANS,
          }}
        >
          AccessiScan is a sub-brand of Pipo Labs. AccessiScan does not warrant legal compliance. Consult qualified counsel.
        </div>
      </div>
    </aside>
  );
}

// ============================================================
//  Password strength
// ============================================================
type Strength = { score: number; label: string; color: string };

function strengthOf(pw: string): Strength {
  if (!pw) return { score: 0, label: "", color: C.slate200 };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const tiers: { label: string; color: string }[] = [
    { label: "Too short", color: C.red600 },
    { label: "Weak", color: C.red600 },
    { label: "Fair", color: "#d97706" },
    { label: "Good", color: C.cyan500 },
    { label: "Strong", color: C.cyan500 },
    { label: "Excellent", color: C.cyan500 },
  ];
  const tier = tiers[s] ?? tiers[tiers.length - 1]!;
  return { score: s, label: tier.label, color: tier.color };
}

// ============================================================
//  LOGIN form
// ============================================================
type LoginErrors = { email?: string; password?: string };

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors & { _form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    setErrors({});
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
        queryParams: provider === "google" ? { prompt: "select_account" } : {},
      },
    });
    if (error) {
      setErrors({ _form: error.message });
      setOauthLoading(null);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: LoginErrors = {};
    if (!email.trim()) errs.email = "Enter your email";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Enter your password";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrors({ _form: error.message });
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SsoButton icon={<GoogleG size={18} />} onClick={() => handleOAuth("google")} disabled={!!oauthLoading || submitting}>
          {oauthLoading === "google" ? "Connecting..." : "Google"}
        </SsoButton>
        <SsoButton icon={<GithubMark size={18} />} onClick={() => handleOAuth("github")} disabled={!!oauthLoading || submitting}>
          {oauthLoading === "github" ? "Connecting..." : "GitHub"}
        </SsoButton>
      </div>

      <Divider>or sign in with email</Divider>

      {errors._form && (
        <div role="alert" style={{ padding: "10px 12px", background: "rgba(220,38,38,0.08)", border: `1px solid ${C.red600}`, borderRadius: 6, fontSize: 13, color: C.red700, fontFamily: F_SANS }}>
          {errors._form}
        </div>
      )}

      <Field label="Work email" htmlFor="login-email" error={errors.email}>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@agency.gov"
          autoComplete="email"
          leadIcon={<IconMail size={16} sw={1.8} />}
          error={errors.email}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="login-password"
        error={errors.password}
        trailing={
          <a href="/forgot-password" style={{ fontSize: 13, color: C.navy900, fontWeight: 600, textDecoration: "none" }}>
            Forgot password?
          </a>
        }
      >
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={errors.password}
        />
      </Field>

      <div style={{ marginTop: 2 }}>
        <Checkbox id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}>
          Keep me signed in for 30 days on this device
        </Checkbox>
      </div>

      <PrimaryButton type="submit" loading={submitting} trailIcon={<IconArrowR size={16} sw={2.5} />}>
        {submitting ? "Signing in..." : "Sign in"}
      </PrimaryButton>

      <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 14, color: C.slate600 }}>
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
          style={{ color: C.navy900, fontWeight: 600, textDecoration: "none" }}
        >
          Sign up
        </a>
      </p>
    </form>
  );
}

// ============================================================
//  SIGNUP form
// ============================================================
type SignupErrors = { name?: string; email?: string; password?: string; agree?: string };

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<SignupErrors & { _form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => strengthOf(password), [password]);

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    setErrors({});
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
        queryParams: provider === "google" ? { prompt: "select_account" } : {},
      },
    });
    if (error) {
      setErrors({ _form: error.message });
      setOauthLoading(null);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: SignupErrors = {};
    if (!name.trim()) errs.name = "What should we call you?";
    if (!email.trim()) errs.email = "Enter your email";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Choose a password";
    else if (password.length < 8) errs.password = "Use at least 8 characters";
    if (!agree) errs.agree = "Please accept the terms to continue";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setErrors({ _form: error.message });
      setSubmitting(false);
      return;
    }

    // Detect existing-account: when email confirmation is disabled, Supabase
    // silently logs in pre-existing users. Tell them to sign in instead.
    if (data.user) {
      const createdAt = new Date(data.user.created_at);
      const diffSeconds = (Date.now() - createdAt.getTime()) / 1000;
      if (diffSeconds > 10) {
        await supabase.auth.signOut();
        setErrors({ _form: "An account with this email already exists. Please sign in instead." });
        setSubmitting(false);
        return;
      }
    }

    setSuccess(true);
    setSubmitting(false);
    // If email confirmation is disabled, also push to dashboard. Otherwise the
    // success state shows "check your email".
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (success) {
    return (
      <div role="status" style={{ padding: 24, background: C.cyan50, border: `1px solid ${C.cyan500}`, borderRadius: 8, fontFamily: F_SANS }}>
        <h3 style={{ margin: 0, fontFamily: F_DISPLAY, fontSize: 20, fontWeight: 600, color: C.navy900 }}>
          Check your email
        </h3>
        <p style={{ margin: "12px 0 0", fontSize: 14, color: C.slate700, lineHeight: 1.55 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start your first WCAG scan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SsoButton icon={<GoogleG size={18} />} onClick={() => handleOAuth("google")} disabled={!!oauthLoading || submitting}>
          {oauthLoading === "google" ? "Connecting..." : "Google"}
        </SsoButton>
        <SsoButton icon={<GithubMark size={18} />} onClick={() => handleOAuth("github")} disabled={!!oauthLoading || submitting}>
          {oauthLoading === "github" ? "Connecting..." : "GitHub"}
        </SsoButton>
      </div>

      <Divider>or sign up with email</Divider>

      {errors._form && (
        <div role="alert" style={{ padding: "10px 12px", background: "rgba(220,38,38,0.08)", border: `1px solid ${C.red600}`, borderRadius: 6, fontSize: 13, color: C.red700, fontFamily: F_SANS }}>
          {errors._form}
        </div>
      )}

      <Field label="Full name" htmlFor="signup-name" error={errors.name}>
        <Input
          id="signup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Rivera"
          autoComplete="name"
          leadIcon={<IconUser size={16} sw={1.8} />}
          error={errors.name}
        />
      </Field>

      <Field
        label="Work email"
        htmlFor="signup-email"
        error={errors.email}
        hint={!errors.email ? "We'll use this to deliver your scan report and VPAT export." : undefined}
      >
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@agency.gov"
          autoComplete="email"
          leadIcon={<IconMail size={16} sw={1.8} />}
          error={errors.email}
        />
      </Field>

      <div>
        <Field label="Password" htmlFor="signup-password" error={errors.password}>
          <PasswordInput
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={errors.password}
            placeholder="At least 8 characters"
          />
        </Field>
        {password ? (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i < strength.score ? strength.color : C.slate200,
                    transition: "background-color .15s ease",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: strength.color,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                minWidth: 60,
                textAlign: "right",
              }}
            >
              {strength.label}
            </span>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 2 }}>
        <Checkbox id="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)}>
          I agree to the{" "}
          <a
            href="/terms"
            style={{
              color: C.navy900,
              fontWeight: 600,
              textDecoration: "underline",
              textDecorationColor: C.slate300,
              textUnderlineOffset: 2,
            }}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            style={{
              color: C.navy900,
              fontWeight: 600,
              textDecoration: "underline",
              textDecorationColor: C.slate300,
              textUnderlineOffset: 2,
            }}
          >
            Privacy Policy
          </a>
          .
        </Checkbox>
        {errors.agree ? (
          <div
            style={{
              marginTop: 6,
              marginLeft: 28,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: C.red600,
              fontSize: 12,
            }}
          >
            <IconAlert size={12} sw={2.2} /> {errors.agree}
          </div>
        ) : null}
      </div>

      <PrimaryButton type="submit" loading={submitting} trailIcon={<IconArrowR size={16} sw={2.5} />}>
        {submitting ? "Creating account..." : "Start free WCAG scan"}
      </PrimaryButton>

      <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 14, color: C.slate600 }}>
        Already have an account?{" "}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
          style={{ color: C.navy900, fontWeight: 600, textDecoration: "none" }}
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

// ============================================================
//  Left panel
// ============================================================
function tabStyle(active: boolean): CSSProperties {
  return {
    border: "none",
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: 6,
    background: active ? "#fff" : "transparent",
    color: active ? C.navy900 : C.slate500,
    fontFamily: F_SANS,
    fontWeight: 600,
    fontSize: 13,
    boxShadow: active ? "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)" : "none",
    transition: "all .15s ease",
  };
}

function LeftPanel({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const isLogin = mode === "login";
  return (
    <section
      style={{
        background: "#fff",
        padding: "40px 56px 56px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: C.slate500,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>
            <IconArrowR size={14} sw={2} />
          </span>
          Back to AccessiScan
        </a>
        <div
          style={{
            display: "inline-flex",
            padding: 4,
            background: C.slate100,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <button type="button" onClick={() => setMode("login")} style={tabStyle(isLogin)}>
            Sign in
          </button>
          <button type="button" onClick={() => setMode("signup")} style={tabStyle(!isLogin)}>
            Sign up
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", width: "100%" }}>
          <Eyebrow color="cyan">{isLogin ? "Sign in to AccessiScan" : "Create your account - 60 seconds"}</Eyebrow>
          <h1
            style={{
              margin: "14px 0 10px",
              fontFamily: F_DISPLAY,
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              color: C.navy900,
            }}
          >
            {isLogin ? "Welcome back." : "Start your free WCAG scan."}
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 15, lineHeight: 1.55, color: C.slate600 }}>
            {isLogin
              ? "Sign in to view scans, open auto-fix PRs, and export your VPAT 2.5."
              : "No credit card. 2 free scans per month. Connect a GitHub repo and we'll open a real auto-fix PR - usually in under a minute."}
          </p>

          {isLogin ? (
            <LoginForm onSwitch={() => setMode("signup")} />
          ) : (
            <SignupForm onSwitch={() => setMode("login")} />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: C.slate500,
        }}
      >
        <span style={{ fontFamily: F_MONO, letterSpacing: "0.04em" }}>
          <span style={{ color: C.cyan500 }}>{"●"}</span> All systems operational
        </span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
            Privacy
          </a>
          <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
            Terms
          </a>
          <a href="/security" style={{ color: "inherit", textDecoration: "none" }}>
            Security
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  Public component used by both routes
// ============================================================
export default function AuthShell({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);

  // Sync URL when user toggles mode in-page (without full reload).
  // After production swap, mode toggle navigates to the canonical /login and
  // /signup routes. The v2-preview routes still load this same shell as a
  // backup during the design-refresh window.
  useEffect(() => {
    if (mode !== initialMode) {
      const target = mode === "login" ? "/login" : "/signup";
      router.push(target);
    }
  }, [mode, initialMode, router]);

  return (
    <>
      <style>{`
        @keyframes av2-spin { to { transform: rotate(360deg); } }
        @media (max-width: 960px) {
          .av2-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <main className="av2-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
        <LeftPanel mode={mode} setMode={setMode} />
        <RightPanel />
      </main>
    </>
  );
}
