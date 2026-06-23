"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

export function SnapshotCheckoutForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snapshot/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        const map: Record<string, string> = {
          url_not_allowed: "That URL can't be scanned (must be a public http/https site).",
          invalid_url: "Please enter a valid URL, like https://example.com.",
          invalid_input: "Please check the URL and email.",
          rate_limited: "Too many attempts, give it a minute.",
          not_configured: "Checkout is temporarily unavailable. Try again shortly.",
        };
        setError(map[data?.error] || "Couldn't start checkout. Try again in a moment.");
        return;
      }
      window.location.href = data.url; // Stripe Checkout
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border-2 border-[#0b1f3a] bg-[#0b1f3a] p-6 text-white">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Get your snapshot</h2>
        <span className="text-2xl font-bold">$39</span>
      </div>
      <p className="mt-1 text-sm text-white/70">One-time. No account, no subscription.</p>

      <label className="mt-4 block">
        <span className="text-sm font-medium">Website URL to scan</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourcompany.com"
          required
          data-testid="snapshot-url"
          className="mt-1 w-full rounded-md border border-white/20 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-sm font-medium">Email to send the report to</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.slice(0, 200))}
          placeholder="you@company.com"
          required
          data-testid="snapshot-email"
          className="mt-1 w-full rounded-md border border-white/20 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </label>

      <button
        type="submit"
        disabled={loading || !url || !email}
        data-testid="snapshot-submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1f3a] hover:bg-slate-100 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Starting checkout…
          </>
        ) : (
          <>
            Continue to payment <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {error ? (
        <p className="mt-3 text-sm text-amber-200" role="alert" data-testid="snapshot-error">
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-white/50">
        Secure payment via Stripe. You&apos;ll get the report by email, usually within an hour.
        7-day refund if we can&apos;t scan your site or you&apos;re not satisfied.
      </p>
    </form>
  );
}
