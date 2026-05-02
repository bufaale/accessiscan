// GitHub App installation callback. Fires after the user clicks "Install" on
// the AccessiScan Auto-Fix App page on github.com.
//
// GitHub redirects to: /api/github-app/callback?installation_id=...&setup_action=install&state=<signedState>
//
// We persist the installation_id in github_installations so the auto-fix
// endpoint can use it. RLS only allows the owning user to see/delete.
//
// Security: the `state` param is HMAC-signed when the install URL is generated
// (see src/app/(dashboard)/settings/github/page.tsx). On callback we
// REQUIRE an authenticated session AND a state whose signed payload matches
// that authenticated user_id. We never use `state` as a fallback identity —
// doing so would let an attacker forge `?state=<victim_user_id>` and have
// their installation persisted against the victim's account.

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { appOctokit } from "@/lib/github/app-client";
import { verifyState } from "@/lib/security/tokens";

export async function GET(req: NextRequest) {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://accessiscan.piposlab.com";
  const url = new URL(req.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");
  const state = url.searchParams.get("state");

  const settingsUrl = (params: Record<string, string>) => {
    const u = new URL("/settings/github", baseURL);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u;
  };

  const loginUrl = () => {
    const u = new URL("/login", baseURL);
    u.searchParams.set("next", "/settings/github");
    return u;
  };

  if (!installationId || !setupAction) {
    return NextResponse.redirect(settingsUrl({ error: "missing_install_params" }));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Hard requirement: must be a real authenticated session. If the cookie
  // expired or the user is not logged in, send them to /login?next=… and
  // persist NOTHING. We never trust the `state` param to identify the user.
  if (!user) {
    return NextResponse.redirect(loginUrl());
  }
  const userId = user.id;

  // Defense-in-depth: even with a valid session, if the signed state does not
  // verify (or names a different user_id), reject. This blocks the case where
  // an attacker tricks an authenticated victim into clicking a callback URL
  // crafted with their own installation_id and a forged/old state.
  const verifiedPayload = verifyState(state);
  if (!verifiedPayload || verifiedPayload !== userId) {
    return NextResponse.redirect(settingsUrl({ error: "invalid_state" }));
  }

  // Pull installation metadata from GitHub so we can show repo count + account in the UI.
  let accountLogin = "";
  let accountType: "Organization" | "User" | null = null;
  let repoSelection: "all" | "selected" | null = null;
  try {
    const octokit = appOctokit();
    const { data } = await octokit.apps.getInstallation({ installation_id: Number(installationId) });
    accountLogin =
      (data.account && "login" in data.account ? data.account.login : "") || "";
    accountType =
      data.account && "type" in data.account
        ? (data.account.type as "Organization" | "User")
        : null;
    repoSelection = (data.repository_selection as "all" | "selected" | null) ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "github_app_install_lookup_failed";
    return NextResponse.redirect(settingsUrl({ error: encodeURIComponent(message) }));
  }

  const admin = createAdminClient();
  // github_installations is post-migration; not yet in generated Database type.
  const db = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await db
    .from("github_installations")
    .upsert(
      {
        user_id: userId,
        github_installation_id: Number(installationId),
        github_account_login: accountLogin,
        github_account_type: accountType,
        repository_selection: repoSelection,
        installed_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: "github_installation_id" },
    );
  if (upsertError) {
    return NextResponse.redirect(settingsUrl({ error: encodeURIComponent(upsertError.message) }));
  }

  return NextResponse.redirect(
    settingsUrl({ installed: accountLogin, repos: repoSelection ?? "" }),
  );
}
