"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const CYAN = "#06b6d4";
const RED = "#dc2626";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_500 = "#64748b";

interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

interface CreatedKey {
  id: string;
  label: string;
  prefix: string;
  created_at: string;
  plaintext: string;
}

export function ApiKeysClient({ isBusinessTier }: { isBusinessTier: boolean }) {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/account/keys");
      if (!r.ok) {
        setKeys([]);
        return;
      }
      const data = await r.json();
      setKeys(data.keys ?? []);
    } catch {
      setKeys([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setError(null);
    setCreating(true);
    try {
      const r = await fetch("/api/account/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to create key");
      setCreated(data.key);
      setLabel("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this key? Anything using it will start failing immediately.")) return;
    setRevoking(id);
    try {
      const r = await fetch(`/api/account/keys/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to revoke");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setRevoking(null);
    }
  }

  if (!isBusinessTier) {
    return (
      <div
        data-testid="api-keys-upsell"
        style={{
          background: SLATE_50,
          border: `1px solid ${SLATE_200}`,
          borderLeft: `3px solid ${CYAN}`,
          borderRadius: 8,
          padding: 24,
          maxWidth: 640,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: NAVY, marginBottom: 8 }}>
          API Keys are a Business tier feature
        </div>
        <p style={{ fontSize: 13.5, color: SLATE_500, margin: 0, lineHeight: 1.55, maxWidth: 540 }}>
          Programmatic access requires the Business plan ($299/mo). It comes with Auto-Fix PRs, continuous monitoring, GitHub App, and SLA-backed support.
        </p>
        <Link
          href="/settings/billing"
          style={{
            display: "inline-block",
            marginTop: 14,
            padding: "8px 14px",
            background: CYAN,
            color: NAVY,
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Upgrade to Business →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
      {created && (
        <div
          data-testid="api-keys-created-banner"
          style={{
            background: "rgba(6,182,212,0.06)",
            border: `1px solid ${CYAN}`,
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: NAVY, marginBottom: 6 }}>
            Key created — save it now
          </div>
          <p style={{ fontSize: 12.5, color: SLATE_500, margin: "0 0 10px" }}>
            This is the only time we&apos;ll show the full key. Copy it and store it somewhere secure.
          </p>
          <code
            data-testid="api-keys-plaintext"
            style={{
              display: "block",
              padding: 10,
              background: NAVY,
              color: "#fff",
              borderRadius: 6,
              fontFamily: FONT_MONO,
              fontSize: 12,
              wordBreak: "break-all",
            }}
          >
            {created.plaintext}
          </code>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(created.plaintext).catch(() => {})}
              style={{
                padding: "6px 12px",
                background: CYAN,
                color: NAVY,
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Copy to clipboard
            </button>
            <button
              type="button"
              onClick={() => setCreated(null)}
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: SLATE_500,
                border: `1px solid ${SLATE_200}`,
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              I&apos;ve saved it
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        data-testid="api-keys-create-form"
        style={{
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          padding: 18,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 240px", minWidth: 0 }}>
          <label htmlFor="api-key-label" style={{ fontSize: 11.5, fontWeight: 700, color: SLATE_500, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Label
          </label>
          <input
            id="api-key-label"
            type="text"
            placeholder="e.g. CI · GitHub Actions"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={80}
            style={{
              padding: "8px 10px",
              border: `1px solid ${SLATE_200}`,
              borderRadius: 6,
              fontSize: 13,
              fontFamily: FONT_INTER,
              color: NAVY,
            }}
          />
        </div>
        <button
          type="submit"
          disabled={creating || !label.trim()}
          style={{
            padding: "9px 16px",
            background: creating || !label.trim() ? SLATE_100 : CYAN,
            color: creating || !label.trim() ? SLATE_500 : NAVY,
            border: "none",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            cursor: creating || !label.trim() ? "not-allowed" : "pointer",
          }}
        >
          {creating ? "Creating…" : "Generate key"}
        </button>
      </form>

      {error && (
        <div
          data-testid="api-keys-error"
          style={{
            padding: 12,
            background: "rgba(220,38,38,0.06)",
            border: `1px solid ${RED}`,
            borderRadius: 6,
            color: RED,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div
        data-testid="api-keys-list"
        style={{
          background: "#fff",
          border: `1px solid ${SLATE_200}`,
          borderRadius: 8,
          padding: 18,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: NAVY, marginBottom: 10 }}>
          Active keys
        </div>
        {keys === null ? (
          <div style={{ fontSize: 13, color: SLATE_500 }}>Loading…</div>
        ) : keys.length === 0 ? (
          <div style={{ fontSize: 13, color: SLATE_500 }}>No keys yet. Create one above.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {keys.map((k) => (
              <li
                key={k.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: `1px solid ${SLATE_100}`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: NAVY, fontSize: 13 }}>{k.label}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: SLATE_500 }}>
                    {k.prefix}…{k.revoked_at ? " · revoked" : ""}
                    {k.last_used_at ? ` · last used ${new Date(k.last_used_at).toLocaleDateString()}` : ""}
                  </span>
                </div>
                {!k.revoked_at && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    disabled={revoking === k.id}
                    data-testid={`revoke-${k.id}`}
                    style={{
                      padding: "5px 10px",
                      background: "transparent",
                      color: RED,
                      border: `1px solid ${RED}`,
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {revoking === k.id ? "Revoking…" : "Revoke"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
