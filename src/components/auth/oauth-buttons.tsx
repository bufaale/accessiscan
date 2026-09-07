"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// BUG-4 (2026-09-06 UI coverage pass, row 79): the GitHub button called
// supabase.auth.signInWithOAuth() and navigated off-site before Supabase
// could report anything — signInWithOAuth builds the /authorize URL and
// redirects the browser client-side with no network round trip, so a
// disabled provider fails only AFTER navigation, rendering raw JSON
// (`{"code":400,...,"msg":"Unsupported provider: provider is not enabled"}`)
// on the Supabase auth host with no way back. There is no client-side error
// to catch for this case. Supabase's external_github_enabled is false today
// (confirmed via the auth config API) and turning it on requires the
// operator to register a GitHub OAuth App and add its client id/secret to
// Supabase — a new external integration, not a code fix. Until that
// happens, don't render a button that leads to a dead end.
const GITHUB_OAUTH_ENABLED = false;

export function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(provider);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
          queryParams: provider === "google" ? { prompt: "select_account" } : {},
        },
      });
      if (error) {
        setError(error.message);
        setLoading(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className={GITHUB_OAUTH_ENABLED ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        <Button
          variant="outline"
          onClick={() => handleOAuth("google")}
          disabled={loading !== null}
        >
          {loading === "google" ? "Connecting..." : "Google"}
        </Button>
        {GITHUB_OAUTH_ENABLED && (
          <Button
            variant="outline"
            onClick={() => handleOAuth("github")}
            disabled={loading !== null}
          >
            {loading === "github" ? "Connecting..." : "GitHub"}
          </Button>
        )}
      </div>
    </div>
  );
}
