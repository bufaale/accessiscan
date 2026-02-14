"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
      <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
      >
        {loading === "google" ? "Connecting..." : "Google"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOAuth("github")}
        disabled={loading !== null}
      >
        {loading === "github" ? "Connecting..." : "GitHub"}
      </Button>
      </div>
    </div>
  );
}
