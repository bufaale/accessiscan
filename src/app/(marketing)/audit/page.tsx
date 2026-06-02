import type { Metadata } from "next";
import { AuditCheckoutForm } from "@/components/audit/audit-checkout-form";

export const metadata: Metadata = {
  title: "WCAG Audit + VPAT report — AccessiScan",
  description:
    "Got an ADA demand letter or a procurement VPAT request? Get an automated WCAG 2.1 AA audit, a prioritized fix list, and a VPAT-style conformance report for $149. No subscription.",
  alternates: { canonical: "/audit" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          One-time audit · no subscription
        </p>
        <h1
          className="mt-2 text-4xl font-semibold text-[#0b1f3a]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          A documented WCAG 2.1 AA audit, for $149
        </h1>
        <p className="mt-4 text-base text-slate-600">
          For when you have an ADA demand letter on your desk, a procurement form
          asking for a VPAT, or a DOJ Title II deadline coming. You enter your
          URL, pay once, and we email you a prioritized audit you can act on or
          hand to your attorney. No account, no monthly fee.
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0b1f3a]">What you get</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• An automated WCAG 2.1 AA scan of your page</li>
          <li>• A prioritized fix list, most lawsuit-cited issues first, with the WCAG reference and a concrete fix for each</li>
          <li>• A VPAT-style conformance summary you can hand to procurement or counsel</li>
          <li>• A free re-scan after you remediate, to document your improved score</li>
          <li>• Emailed to you, usually within an hour</li>
        </ul>
      </section>

      <div className="mt-8">
        <AuditCheckoutForm />
      </div>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">What this is, and what it isn&apos;t (read this)</h2>
        <p className="mt-2">
          This is an <strong>automated</strong> WCAG 2.1 AA audit. Automated
          checks reliably catch roughly 30 to 40 percent of WCAG issues, the
          mechanical ones like missing alt text, color contrast, unlabeled form
          fields, and broken heading structure. They cannot judge whether your
          alt text is meaningful or whether a custom widget makes sense to a
          screen reader.
        </p>
        <p className="mt-2">
          So this audit documents a good-faith remediation effort and gives you
          a concrete, prioritized starting point. It is <strong>not</strong> a
          certificate of compliance, and it does not make your site
          &quot;lawsuit-proof.&quot; Full WCAG conformance still requires manual
          testing with a screen reader. Nothing here is legal advice; if you have
          a demand letter, talk to an attorney too.
        </p>
        <p className="mt-3 text-xs text-amber-900/80">
          Refunds: if the scan can&apos;t reach your site or you&apos;re not
          satisfied, reply to the delivery email within 7 days for a full refund.
        </p>
      </section>

      <p className="mt-6 text-center text-sm text-slate-500">
        Want ongoing monitoring across many pages instead?{" "}
        <a href="/pricing" className="font-medium text-[#0b1f3a] underline">
          See the monthly plans
        </a>
        .
      </p>
    </div>
  );
}
