import type { Metadata } from "next";
import Link from "next/link";
import { SnapshotCheckoutForm } from "@/components/audit/snapshot-checkout-form";

export const metadata: Metadata = {
  title: "WCAG Snapshot — see where your site stands for $39 | AccessiScan",
  description:
    "A $39 automated WCAG 2.1 AA snapshot: your top accessibility issues ranked by severity, each with the WCAG reference and a concrete fix, emailed within the hour. No subscription.",
  alternates: { canonical: "/snapshot" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const NAVY = "#0b1f3a";

export default function SnapshotPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          One-time snapshot · no subscription
        </p>
        <h1 className="mt-2 text-4xl font-semibold" style={{ fontFamily: FONT_DISPLAY, color: NAVY }}>
          See exactly where your site stands, for $39
        </h1>
        <p className="mt-4 text-base text-slate-600">
          The fast, low-risk way to find out how accessible your site is before committing to a full
          audit. You enter your URL, pay once, and we email you an automated WCAG 2.1 AA snapshot of
          your most important pages: your top issues ranked by severity, each with the WCAG reference
          and a concrete fix. Usually within the hour. No account, no monthly fee.
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>What you get</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• An automated WCAG 2.1 AA scan of your homepage and your most important pages</li>
          <li>• Your top issues ranked by severity (most lawsuit-cited first), each with the WCAG reference and a concrete fix</li>
          <li>• Your automated-coverage score, so you know where you stand at a glance</li>
          <li>• Emailed to you, usually within an hour</li>
        </ul>
      </section>

      <div className="mt-8">
        <SnapshotCheckoutForm />
      </div>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">What this is, and what it isn&apos;t (read this)</h2>
        <p className="mt-2">
          This is an <strong>automated</strong> WCAG 2.1 AA scan. Automated checks reliably catch
          roughly 30 to 40 percent of WCAG issues, the mechanical ones like missing alt text, color
          contrast, unlabeled form fields, and broken heading structure. They cannot judge whether
          your alt text is meaningful or whether a custom widget makes sense to a screen reader.
        </p>
        <p className="mt-2">
          So the snapshot documents a good-faith starting point and shows you exactly where to focus.
          It is <strong>not</strong> a certificate of compliance, and full WCAG conformance still
          requires manual testing with a screen reader. Nothing here is legal advice.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>Need the full picture?</h2>
        <p className="mt-2 text-sm text-slate-700">
          If you have an ADA demand letter on your desk or a procurement form asking for a VPAT, the
          {" "}<Link href="/audit" className="font-medium underline" style={{ color: NAVY }}>$149 documented audit</Link>{" "}
          adds manual review of your key pages, a hash-signed Legal Evidence Pack (the dated proof a
          demand-letter response needs), a VPAT-style conformance report, and a 30/60/90-day
          remediation plan.
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-slate-500">
        Want ongoing monitoring across many pages instead?{" "}
        <Link href="/pricing" className="font-medium underline" style={{ color: NAVY }}>See the monthly plans</Link>.
      </p>
    </div>
  );
}
