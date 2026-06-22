import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VPAT Generator for RFPs & Section 508 | AccessiScan",
  description:
    "A procurement team asked for a VPAT? Get a VPAT 2.5 / Section 508 conformance report built from a real scan of your product, usually within an hour.",
  alternates: { canonical: "/vpat" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const NAVY = "#0b1f3a";

const WHAT_YOU_GET = [
  "A completed VPAT 2.5 report in the correct ITI format, populated from a real automated scan of your product, not a blank template you have to fill in yourself",
  "Each WCAG 2.1 / 2.2 AA criterion marked Supports, Partially Supports, or Does Not Support, with remarks tied to the specific issues the scan found",
  'Content-dependent criteria honestly marked "Not Evaluated — requires manual testing" instead of guessed, so the report holds up when a reviewer reads it closely',
  "WCAG and Section 508 editions; EN 301 549 (EU) available if your buyer is in Europe",
  "Emailed to you, usually within an hour, plus a durable link to view, print, and re-download the report",
  "A free re-run after you fix the flagged issues, so you can hand over an updated report once your score improves",
];

const WHY_NOT_CHEAP = [
  "You can download a blank VPAT for free. The problem isn't getting the template, it's filling in 50-plus criteria correctly, knowing which ones a scan can answer and which ones can't, and writing remarks that survive a procurement reviewer's follow-up questions. A blank form on your desk doesn't move the deal.",
  'The cheap route usually hands you boilerplate: a report where most criteria are marked "Supports" with no evidence behind them. That is the version that gets your deal stalled further. When the buyer\'s accessibility team asks "how did you test 1.4.3 contrast?" and the answer is nothing, trust evaporates and you are back to square one with less credibility than before.',
  "Ours starts from a real scan of your actual product and maps those machine-tested results to each criterion. The marks reflect what we found, and the criteria a scanner cannot judge are labeled as needing manual testing instead of being filled in to look clean. It is a report you can defend, delivered in about an hour instead of weeks.",
];

const FAQ = [
  {
    q: "What is a VPAT?",
    a: "A VPAT (Voluntary Product Accessibility Template) is the standard form for documenting how accessible a product is against standards like WCAG and Section 508. You complete it criterion by criterion, marking each as Supports, Partially Supports, or Does Not Support. The completed version is called an ACR (Accessibility Conformance Report). Procurement and accessibility teams use it to assess a product before buying.",
  },
  {
    q: "Do I actually need a VPAT for an RFP or procurement?",
    a: "If the buyer asked for one, yes, and the deal usually can't proceed without it. Federal agencies are required to consider accessibility under Section 508, so a VPAT is effectively mandatory to sell to them. Large enterprises and universities increasingly require one too. If the RFP or procurement form has a line item for a VPAT or ACR, that is a hard gate, not a nice-to-have.",
  },
  {
    q: "How long does it take to get my VPAT?",
    a: "You give us your product URL, pay once, and the scan runs immediately. The completed report is usually emailed to you within an hour, along with a durable link to view and download it. Agencies typically quote one to three weeks for the same document, which is the gap we are closing.",
  },
  {
    q: "Is an automated VPAT enough on its own?",
    a: "It depends on your buyer and your product. An automated VPAT honestly covers the criteria a scanner can test, roughly 30 to 40 percent of WCAG, and clearly marks the rest as needing manual testing. For many procurement requests, a credible scan-backed report that documents a good-faith effort is exactly what is asked for. For high-stakes or government contracts with their own accessibility review, you will likely want manual testing on top to claim full conformance. Our report is honest about that line so you know where you stand.",
  },
  {
    q: "What's the difference between a VPAT and an ACR?",
    a: 'The VPAT is the blank template. The ACR (Accessibility Conformance Report) is the completed version, your product evaluated against it. In everyday use people say "VPAT" to mean both. When you order here, you get a completed report, which is technically the ACR your buyer wants.',
  },
  {
    q: "Can you do Section 508 or EN 301 549 editions?",
    a: "Yes. We produce the WCAG and Section 508 editions out of the box. If your buyer is in the EU and wants the EN 301 549 edition, that is available too, just tell us when you order or reply to the delivery email. All editions use the same honest Supports / Partially Supports / Does Not Support reporting based on the scan.",
  },
];

export default function VpatPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          VPAT 2.5 · Section 508 conformance report · one-time, no subscription
        </p>
        <h1
          className="mt-2 text-4xl font-semibold"
          style={{ fontFamily: FONT_DISPLAY, color: NAVY }}
        >
          Your deal is stuck on a VPAT. Get one built from a real scan, usually within an hour.
        </h1>
        <p className="mt-4 text-base text-slate-600">
          An enterprise or government buyer asked for a VPAT or a Section 508
          conformance report, and now a five or six figure contract is waiting on
          a 40-page template you have never filled out. You give us your product
          URL, we scan it, and you get a completed report in the correct ITI
          format, with each criterion marked Supports, Partially Supports, or Does
          Not Support based on what the scan actually found. One-time, no monthly fee.
        </p>
        <div className="mt-6">
          <Link
            href="/audit"
            className="inline-flex items-center rounded-lg bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b1f3a]/90"
          >
            Build my VPAT, from $149
          </Link>
          <span className="ml-3 text-sm text-slate-500">No account needed</span>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          What is a VPAT, and what&apos;s an ACR?
        </h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p>
            A VPAT (Voluntary Product Accessibility Template) is the standard
            document procurement teams use to evaluate how accessible a product
            is. You fill in the template, and the filled-in result is called an
            ACR (Accessibility Conformance Report). People say &quot;VPAT&quot;
            for both, but the VPAT is the blank form and the ACR is your completed
            report.
          </p>
          <p>
            It is a self-disclosure document. You report, criterion by criterion,
            whether your product Supports, Partially Supports, or Does Not Support
            each requirement, and you add remarks explaining the gaps. There are
            four editions of VPAT 2.x: WCAG, Section 508, EN 301 549 (the EU
            standard), and an international edition that combines all three.
            Buyers usually ask for the WCAG or 508 edition.
          </p>
          <p>
            Why buyers want it: a VPAT lets their accessibility and legal teams
            assess risk before they sign. Federal agencies are required to
            consider it under Section 508, and large companies use it the same
            way. No VPAT, no purchase order. That is why a missing one can hold up
            an otherwise-closed deal.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          What you get
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {WHAT_YOU_GET.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          Why not a free template or a $300 boilerplate VPAT?
        </h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {WHY_NOT_CHEAP.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          How to get yours
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Your VPAT is built from a real scan as part of our documented WCAG 2.1
          AA audit. It is one-time, priced to unblock a contract rather than to
          add another subscription, since a VPAT is usually the last thing
          standing between you and a signed purchase order.
        </p>
        <p className="mt-3 text-sm text-slate-700">
          Need a formal VPAT 2.5 in the Section 508 or EN 301 549 edition for a
          specific buyer, multiple products, or a recurring arrangement for your
          agency? Start with the audit and reply to the delivery email, and we
          will produce the exact edition your buyer asked for.
        </p>
        <div className="mt-5">
          <Link
            href="/audit"
            className="inline-flex items-center rounded-lg bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b1f3a]/90"
          >
            Get my VPAT, from $149
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">What this is, and what it isn&apos;t (read this)</h2>
        <p className="mt-2">
          This VPAT is built from an automated WCAG 2.1 / 2.2 AA scan. Automated
          checks reliably catch roughly 30 to 40 percent of WCAG issues, the
          mechanical ones like missing alt text, color contrast, unlabeled form
          fields, and broken heading structure. They cannot judge whether your
          alt text is meaningful, whether a custom widget works with a screen
          reader, or whether your keyboard flow makes sense. Those criteria are
          marked as needing manual testing in the report.
        </p>
        <p className="mt-2">
          A VPAT is a self-disclosure document, not a certificate and not a
          third-party certification. It reports what you found; it does not prove
          conformance and it does not make your product &quot;compliant.&quot;
          Full WCAG conformance still requires manual testing with assistive
          technology. We give you an honest, scan-backed starting point that
          documents a good-faith effort and answers the procurement request
          quickly.
        </p>
        <p className="mt-2 text-xs text-amber-900/80">
          Nothing here is legal advice. If a contract or a regulator hangs on
          this, loop in your accessibility team or counsel too.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold" style={{ color: NAVY }}>
          Questions buyers and founders ask
        </h2>
        <div className="mt-4 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                {f.q}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-slate-500">
        Facing a demand letter instead of a procurement form?{" "}
        <Link href="/audit" className="font-medium underline" style={{ color: NAVY }}>
          See the documented audit
        </Link>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
