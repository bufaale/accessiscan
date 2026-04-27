"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import type { OverlayDetectionResult } from "@/lib/overlay/detect";
import Link from "next/link";

interface State {
  status: "idle" | "loading" | "success" | "error";
  result?: OverlayDetectionResult;
  error?: string;
}

export function OverlayDetectorClient() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/overlay-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();

      if (!res.ok) {
        setState({ status: "error", error: json.error ?? "Check failed" });
        return;
      }
      setState({ status: "success", result: json.data });
    } catch {
      setState({ status: "error", error: "Network error. Please try again." });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="h-12 flex-1 rounded-md border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
          required
          autoComplete="url"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#06b6d4] px-6 text-sm font-semibold text-[#0b1f3a] transition-colors hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning
            </>
          ) : (
            <>
              Check URL
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {state.status === "error" && (
        <div className="mt-5 rounded-md border border-[#dc2626]/40 bg-[#dc2626]/10 p-4 text-sm text-white">
          {state.error}
        </div>
      )}

      {state.status === "success" && state.result && (
        <Results result={state.result} />
      )}
    </div>
  );
}

function Results({ result }: { result: OverlayDetectionResult }) {
  if (result.clean) {
    return (
      <div className="mt-6 rounded-md border border-emerald-400/30 bg-emerald-400/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <p className="font-semibold text-white">
              No accessibility overlay detected
            </p>
            <p className="mt-1 text-sm text-white/70">
              {result.url} does not appear to be using any of the overlays we
              currently detect. That doesn&apos;t mean the site is accessible — it
              means it isn&apos;t hiding behind a widget. Run a real WCAG audit next.
            </p>
            <Link
              href={`/signup?url=${encodeURIComponent(result.url)}`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-[#0b1f3a] transition-colors hover:bg-slate-100"
            >
              Run a real audit on {hostOf(result.url)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-md border border-[#dc2626]/40 bg-[#dc2626]/10 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#fca5a5]" />
          <div>
            <p className="font-semibold text-white">
              {result.hits.length} overlay
              {result.hits.length === 1 ? "" : "s"} detected on {hostOf(result.url)}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Sites using these products continue to receive ADA demand letters.
              Below is the regulatory exposure for each. This detection is public
              record — attorneys who send demand letters use similar signals.
            </p>
          </div>
        </div>
      </div>

      {result.hits.map((hit) => (
        <div
          key={hit.vendor.id}
          className="rounded-md border border-white/10 bg-white/5 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold text-white">
                {hit.vendor.name}
              </p>
              <p className="mt-1 text-sm text-white/70">{hit.vendor.tagline}</p>
            </div>
            <code className="rounded-sm bg-white/10 px-2 py-1 font-mono text-[10px] text-white/60">
              matched: {hit.matched}
            </code>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {hit.vendor.notes}
          </p>
        </div>
      ))}

      <div className="rounded-md border border-[#06b6d4]/30 bg-[#06b6d4]/5 p-5">
        <p className="font-display text-lg font-semibold text-white">
          What to do next
        </p>
        <p className="mt-2 text-sm text-white/70">
          Get a real audit — actual fix code, VPAT 2.5 export, GitHub Action.
          Ship from $19/mo. Remove the overlay once the underlying issues are
          resolved — that removes the liability.
        </p>
        <Link
          href={`/signup?url=${encodeURIComponent(result.url)}`}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#06b6d4] px-4 text-sm font-semibold text-[#0b1f3a] transition-colors hover:bg-[#22d3ee]"
        >
          Start a real audit on {hostOf(result.url)}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
