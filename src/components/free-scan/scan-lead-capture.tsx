"use client";

import { useState } from "react";

interface Props {
  token: string;
  url: string;
  score: number;
}

type Status = "idle" | "sending" | "sent" | "already" | "error";

export function ScanLeadCapture({ token, url, score }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/free/scan-result/${token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setStatus("already");
        return;
      }
      if (!res.ok || !data?.ok) {
        setErrorMsg(typeof data?.error === "string" ? data.error : "Couldn't send the email — try again in a moment.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        data-testid="lead-capture-sent"
        className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"
      >
        Sent. Check <span className="font-medium">{email}</span> in a minute for the scorecard, top 5 fix hints, and a permalink you can forward.
      </div>
    );
  }

  return (
    <section
      data-testid="lead-capture"
      className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5"
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
        GET A COPY EMAILED
      </div>
      <h2 className="text-base font-semibold text-amber-950">
        Save this report + top 5 fix hints
      </h2>
      <p className="mt-1 text-sm text-amber-900/90">
        We&apos;ll send you this scorecard for {url}, the top 5 prioritized fix hints,
        and a permalink you can forward to your team. No newsletter, no signup.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.slice(0, 254))}
          placeholder="you@company.com"
          data-testid="lead-capture-email"
          autoComplete="email"
          className="min-w-0 flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={status === "sending" || !email}
          data-testid="lead-capture-submit"
          className="inline-flex items-center gap-2 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428] disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Email me a copy"}
        </button>
      </form>
      {status === "error" && errorMsg ? (
        <p className="mt-2 text-xs text-rose-900" role="alert">
          {errorMsg}
        </p>
      ) : null}
      {status === "already" ? (
        <p className="mt-2 text-xs text-amber-900">
          This scan already has an email on file. Check your inbox.
        </p>
      ) : null}
      <p className="mt-3 text-[11px] text-amber-900/60">
        Score: {score}/100. We only use your email to send this one report and (optionally) a follow-up if AccessiScan would help with the remediation work — reply &quot;stop&quot; once and you&apos;re off the list permanently.
      </p>
    </section>
  );
}
