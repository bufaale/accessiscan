import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { SnapshotCheckoutForm } from "@/components/audit/snapshot-checkout-form";

export const metadata: Metadata = {
  title: "Automated WCAG Report — see where your site stands for $79 | AccessiScan",
  description:
    "A $79 automated WCAG 2.1/2.2 AA report: a deep multi-page scan, your issues ranked by severity with the WCAG reference and a concrete fix for each, plus a 30/60/90-day plan, emailed within the hour. No subscription.",
  alternates: { canonical: "/snapshot" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const NAVY = "#0b1f3a";

export default function SnapshotPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          One-time report · no subscription
        </p>
        <h1 className="mt-2 text-4xl font-semibold" style={{ fontFamily: FONT_DISPLAY, color: NAVY }}>
          See exactly where your site stands, for $79
        </h1>
        <p className="mt-4 text-base text-slate-600">
          The fast, low-risk way to find out how accessible your site really is before committing to a
          full documented audit. You enter your URL, pay once, and we run a deep automated WCAG 2.1 &amp;
          2.2 AA scan across your most important pages. You get back a ranked report of every issue we
          can detect &mdash; each with its WCAG reference and a concrete fix &mdash; plus a 30/60/90-day
          plan to work through them. Usually within the hour. No account, no monthly fee.
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>What you get</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• A deep automated WCAG 2.1 &amp; 2.2 AA scan across your homepage and most important pages</li>
          <li>• Every detectable issue ranked by severity (most lawsuit-cited first), each with the WCAG reference and a concrete fix</li>
          <li>• Your automated-coverage score, so you know where you stand at a glance</li>
          <li>• A 30/60/90-day remediation plan to work through the findings</li>
          <li>• Delivered as a PDF by email, usually within an hour</li>
        </ul>
      </section>

      <div className="mt-8">
        <SnapshotCheckoutForm />
      </div>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">What this is, and what it isn&apos;t (read this)</h2>
        <p className="mt-2">
          This is an <strong>automated</strong> WCAG scan. Automated checks reliably catch roughly 30
          to 40 percent of WCAG issues &mdash; the mechanical ones like missing alt text, color
          contrast, unlabeled form fields, and broken heading structure. They cannot judge whether
          your alt text is meaningful or whether a custom widget makes sense to a screen reader.
        </p>
        <p className="mt-2">
          So this report documents a good-faith starting point and shows you exactly where to focus. It
          is <strong>not</strong> a certificate of compliance, and full WCAG conformance still requires
          manual testing with a screen reader. Nothing here is legal advice.
        </p>
      </section>

      {/* Decoy block: the $79 automated report sits next to the $149 documented audit so the
          difference (human review + hash-signed Evidence Pack + VPAT + demand-letter readiness)
          is unmistakable. The $79 is honest about what it is NOT, on purpose. */}
      <section className="mt-12">
        <h2 className="text-center text-lg font-semibold" style={{ color: NAVY, fontFamily: FONT_DISPLAY }}>
          Which one do you need?
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Same scan engine underneath. The difference is what gets done with the results &mdash; and
          whether you can hand it to a lawyer.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* $79 automated */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Automated report</p>
            <p className="mt-1 text-3xl font-bold" style={{ color: NAVY }}>$79</p>
            <p className="text-xs text-slate-500">one-time</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Deep automated scan, multiple pages</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Ranked PDF with a fix for each issue</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> 30/60/90-day remediation plan</li>
              <li className="flex gap-2 text-slate-400"><X className="mt-0.5 h-4 w-4 shrink-0" /> No human review</li>
              <li className="flex gap-2 text-slate-400"><X className="mt-0.5 h-4 w-4 shrink-0" /> No hash-signed Legal Evidence Pack</li>
              <li className="flex gap-2 text-slate-400"><X className="mt-0.5 h-4 w-4 shrink-0" /> No public /verify proof URL</li>
              <li className="flex gap-2 text-slate-400"><X className="mt-0.5 h-4 w-4 shrink-0" /> Not built to answer a demand letter</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">Best when you just want to know where you stand.</p>
          </div>

          {/* $149 documented — the target */}
          <div className="relative rounded-xl border-2 p-6" style={{ borderColor: NAVY, background: "#f8fafc" }}>
            <span className="absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: NAVY }}>
              Most chosen
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: NAVY }}>Documented audit</p>
            <p className="mt-1 text-3xl font-bold" style={{ color: NAVY }}>$149</p>
            <p className="text-xs text-slate-500">one-time</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Everything in the automated report</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Manual review of your key pages</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Hash-signed Legal Evidence Pack (dated proof of good-faith effort)</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Public /verify URL for the record</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> VPAT-style conformance report</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Built to put in front of a lawyer or procurement</li>
            </ul>
            <Link
              href="/audit"
              className="mt-5 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: NAVY }}
            >
              Get the $149 documented audit
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              Best when there&apos;s a demand letter, a procurement form, or a VPAT request on your desk.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-slate-500">
        Want ongoing monitoring across many pages instead?{" "}
        <Link href="/pricing" className="font-medium underline" style={{ color: NAVY }}>See the monthly plans</Link>.
      </p>
    </div>
  );
}
