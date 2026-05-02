import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { signState } from "@/lib/security/tokens";

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const FONT_MONO = "var(--font-mono), monospace";
const NAVY = "#0b1f3a";
const SLATE_50 = "#f8fafc";
const SLATE_100 = "#f1f5f9";
const SLATE_200 = "#e2e8f0";
const SLATE_300 = "#cbd5e1";
const SLATE_500 = "#64748b";

export default async function GithubSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string; error?: string; repos?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const isBusinessTier = profile?.subscription_plan === "business";

  const admin = createAdminClient();
  const db = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: installsRaw } = await db
    .from("github_installations")
    .select("id, github_installation_id, github_account_login, github_account_type, repository_selection, installed_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("installed_at", { ascending: false });
  const installs = installsRaw as Array<{
    id: string;
    github_installation_id: number;
    github_account_login: string;
    github_account_type: string | null;
    repository_selection: string | null;
    installed_at: string;
  }> | null;

  const appName = process.env.GITHUB_APP_NAME?.trim() || "accessiscan-auto-fix";
  // Sign the state with HMAC so a malicious party cannot forge a state pointing
  // at a different user_id and reassign an installation through a tricked
  // victim. The callback verifies the signature AND requires an authenticated
  // session matching the payload — so even a leaked signed state cannot
  // hijack another user's installation.
  const signedState = signState(user.id);
  const installUrl = `https://github.com/apps/${appName}/installations/new?state=${encodeURIComponent(signedState)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "24px 28px 48px", color: NAVY }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY, margin: 0 }}>
          GitHub Auto-Fix integration
        </h1>
        <p style={{ fontSize: 13.5, color: SLATE_500, marginTop: 4, fontFamily: FONT_INTER, maxWidth: 720 }}>
          Connect AccessiScan to your repository so we can open accessibility fix PRs directly in your codebase. Each scan can generate one PR with patched code for every fixable WCAG violation we find.
        </p>
      </div>

      {!isBusinessTier && (
        <div role="alert" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: 16, display: "flex", gap: 12, fontFamily: FONT_INTER }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: "#7c3aed", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }} aria-hidden>!</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#4c1d95", margin: 0 }}>
              Auto-Fix PRs is a Business plan feature ($299/mo)
            </p>
            <p style={{ fontSize: 12.5, color: "#5b21b6", marginTop: 4, marginBottom: 12 }}>
              Upgrade to generate accessibility fix PRs from your scan results — alt text, ARIA labels, language attributes, and more, with code Claude Sonnet generates from the rendered page.
            </p>
            <Link
              href="/settings/billing"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, background: NAVY, color: "#fff", textDecoration: "none" }}
            >
              Upgrade to Business →
            </Link>
          </div>
        </div>
      )}

      {params.installed && (
        <div role="status" style={{ background: "rgba(22,163,74,0.10)", border: "1px solid #16a34a", borderRadius: 8, padding: 16, display: "flex", gap: 12, fontFamily: FONT_INTER }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, fontSize: 12 }} aria-hidden>✓</span>
          <p style={{ fontSize: 13, color: "#14532d", margin: 0 }}>
            Connected to <strong>{decodeURIComponent(params.installed)}</strong> ({params.repos === "all" ? "all repositories" : "selected repositories"}). You can now generate fix PRs from any scan&apos;s issue list.
          </p>
        </div>
      )}

      {params.error && (
        <div role="alert" style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: 16, display: "flex", gap: 12, fontFamily: FONT_INTER }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: "#b45309", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }} aria-hidden>!</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#78350f", margin: 0 }}>Installation failed</p>
            <p style={{ fontSize: 12, fontFamily: FONT_MONO, color: "#78350f", marginTop: 4 }}>{decodeURIComponent(params.error)}</p>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY, marginBottom: 4 }}>
          Connected installations
        </div>
        <p style={{ fontSize: 12.5, color: SLATE_500, fontFamily: FONT_INTER, marginTop: 0, marginBottom: 18 }}>
          Each installation maps to a GitHub user or organization that authorized AccessiScan to open PRs.
        </p>

        {!installs || installs.length === 0 ? (
          <div style={{ border: `1px dashed ${SLATE_300}`, borderRadius: 6, padding: "32px 24px", textAlign: "center", color: SLATE_500, fontFamily: FONT_INTER, fontSize: 13.5, background: SLATE_50 }}>
            No GitHub accounts connected yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {installs.map((i) => (
              <div
                key={i.id}
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, border: `1px solid ${SLATE_200}`, borderRadius: 6, padding: 14, fontFamily: FONT_INTER }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span aria-hidden style={{ color: SLATE_500 }}>⌘</span>
                    <span style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}>
                      {i.github_account_login}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: SLATE_500, background: SLATE_100, padding: "2px 8px", borderRadius: 4 }}>
                      {i.github_account_type ?? "User"}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", background: i.repository_selection === "all" ? "rgba(6,182,212,0.12)" : SLATE_100, color: i.repository_selection === "all" ? "#06b6d4" : SLATE_500, padding: "2px 8px", borderRadius: 4 }}>
                      {i.repository_selection === "all" ? "all repos" : "selected repos"}
                    </span>
                  </div>
                  <p style={{ fontSize: 11.5, color: SLATE_500, margin: 0 }}>
                    Installed {new Date(i.installed_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`https://github.com/settings/installations/${i.github_installation_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 600, fontFamily: FONT_INTER, borderRadius: 6, border: `1px solid ${SLATE_300}`, background: "#fff", color: NAVY, textDecoration: "none" }}
                >
                  Manage on GitHub ↗
                </a>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <a
            href={installUrl}
            aria-disabled={!isBusinessTier}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 16px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT_INTER,
              borderRadius: 6,
              background: isBusinessTier ? NAVY : SLATE_300,
              color: "#fff",
              textDecoration: "none",
              pointerEvents: isBusinessTier ? "auto" : "none",
              opacity: isBusinessTier ? 1 : 0.6,
              cursor: isBusinessTier ? "pointer" : "not-allowed",
            }}
          >
            <span aria-hidden>⌘</span>
            {installs && installs.length > 0 ? "Install on another account" : "Install GitHub App"}
          </a>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${SLATE_200}`, borderRadius: 8, padding: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: NAVY, marginBottom: 12 }}>
          What we access
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontFamily: FONT_INTER, fontSize: 13, color: SLATE_500 }}>
          <li>
            <code style={{ fontFamily: FONT_MONO, background: SLATE_100, color: NAVY, padding: "2px 6px", borderRadius: 3, fontSize: 12 }}>contents (read+write)</code>
            {" "}— commit fix files to a new branch.
          </li>
          <li>
            <code style={{ fontFamily: FONT_MONO, background: SLATE_100, color: NAVY, padding: "2px 6px", borderRadius: 3, fontSize: 12 }}>pull_requests (read+write)</code>
            {" "}— open the PR with your fixes.
          </li>
          <li>
            <code style={{ fontFamily: FONT_MONO, background: SLATE_100, color: NAVY, padding: "2px 6px", borderRadius: 3, fontSize: 12 }}>metadata (read)</code>
            {" "}— list your repositories so you can choose where to PR.
          </li>
          <li style={{ paddingTop: 6 }}>
            We never auto-merge. We only commit when you explicitly click <em>&quot;Generate fix PR&quot;</em> on a scan issue.
          </li>
        </ul>
      </div>
    </div>
  );
}
