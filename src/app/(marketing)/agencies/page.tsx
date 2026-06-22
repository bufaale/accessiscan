import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "White-Label Accessibility Audits for Agencies | AccessiScan",
  description:
    "Add an accessibility service line without hiring a specialist. Branded WCAG reports, VPATs, and per-client monitoring under your logo. The engine is ours, the client is yours.",
  alternates: { canonical: "/agencies" },
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const NAVY = "#0b1f3a";

const PROBLEM = [
  'A client emails you: "Are we ADA compliant?" Right now you either say "I\'ll find out" and scramble, or you point them at someone else and lose the work. Either way it is a gap in what you offer, and a client question you can\'t answer fast.',
  "You could hire an accessibility specialist, but that is a salary against a service you haven't sold yet. You could resell an overlay widget, but those carry real legal baggage now (more on that below). So the line stays empty, and a recurring revenue stream sits on the table.",
  "What you actually need is a way to deliver real accessibility work under your own brand, without becoming a WCAG expert yourself. That is the whole point of this.",
];

const HOW_IT_WORKS = [
  {
    step: "1. Scan a client site",
    detail:
      "Run a free scan on any client URL and see where it stands against WCAG 2.1 AA. Use it to show a client their gaps in plain language, or to qualify a prospect before you pitch.",
  },
  {
    step: "2. Generate a branded report and VPAT",
    detail:
      "Turn the scan into a report and a VPAT-style conformance document with your logo, not ours. It lists the issues found, fix code, and the scope of automated testing. You hand it to the client as your deliverable.",
  },
  {
    step: "3. Sell remediation plus ongoing monitoring",
    detail:
      'Quote the fixes as a project, then keep the relationship alive with per-client continuous monitoring. New page ships, accessibility drifts, you catch it. That is the retainer: "ongoing accessibility," priced and owned by you.',
  },
];

const WHAT_YOU_GET = [
  "White-label reports and VPAT-style documents with your branding, so the work reads as your agency's, not a vendor's.",
  "A multi-site view to manage every client site from one place, instead of juggling separate logins or spreadsheets.",
  "Per-client continuous monitoring you can sell as a recurring retainer, with alerts when a site regresses.",
  "A free scan to show prospects their gaps and start the conversation before you ever send an invoice.",
  "Fix code alongside each issue, so your developers know what to change instead of guessing.",
  "Honest scope built into every report: automated checks cover roughly 30 to 40 percent of WCAG, manual testing still recommended. Your clients trust documents that tell the truth.",
];

const WHY_NOT_OVERLAYS = [
  "Overlay widgets (the one-line script that promises instant compliance) are a liability to resell now. In 2025 the FTC fined accessiBe $1M for deceptive accessibility claims. Reselling a product like that puts your agency's name next to a promise that doesn't hold up, and your client's site still fails real users.",
  "We don't do overlays. AccessiScan scans the actual code, surfaces the real issues, and gives you fix guidance plus documentation. The value you sell is genuine remediation and a paper trail of good-faith effort, not a band-aid script that invites a demand letter.",
];

const FAQ = [
  {
    q: "What does white-label mean here?",
    a: "Your logo and branding go on the scan reports and VPAT-style documents, not ours. The client sees your agency's deliverable. We are the engine running underneath, invisible to them. You own the relationship, the pricing, and the markup.",
  },
  {
    q: "Do I need an accessibility specialist on staff?",
    a: "No. The scan engine finds the WCAG issues and the reports document them, so you don't need in-house expertise to deliver the audit and the paperwork. For the remediation work itself, your existing developers can use the fix code we provide. If a client needs deep manual testing, you can bring in a specialist for that piece, but you don't need one to start selling the service.",
  },
  {
    q: "How do I price this to my clients?",
    a: "However the market in your niche supports. Agencies typically charge a one-time fee for the initial audit and remediation project, then a monthly retainer for ongoing monitoring. Your subscription cost stays flat while you add clients, so each new client widens the margin. We don't set or see your client pricing.",
  },
  {
    q: "Can I put my own logo on the reports?",
    a: "Yes. That is the core of the Agency plan. Reports and VPAT-style documents carry your branding so they read as your work product when you hand them to a client or their procurement team.",
  },
  {
    q: "Is an automated audit enough?",
    a: "No, and you should never tell a client it is. Automated scanning catches roughly 30 to 40 percent of WCAG issues; full conformance needs manual testing too. What an automated audit does well is find the most common, lawsuit-cited failures fast, generate fix code, and document a good-faith effort. We say this plainly inside every report so neither you nor your client mistakes it for a compliance certificate. It is a strong starting point, not a guarantee.",
  },
];

export default function AgenciesPage() {
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
          For web, dev, and marketing agencies
        </p>
        <h1
          className="mt-2 text-4xl font-semibold"
          style={{ fontFamily: FONT_DISPLAY, color: NAVY }}
        >
          Sell accessibility to your clients. We run the engine in the background.
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Put your logo on WCAG scan reports and VPAT-style documents, manage
          every client site from one view, and bill an ongoing monitoring
          retainer. No accessibility hire needed. You own the client relationship
          and the markup.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b1f3a]/90"
          >
            Start the Agency plan
          </Link>
          <Link
            href="/free/wcag-scanner"
            className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            style={{ color: NAVY }}
          >
            See how it works (run a free scan)
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          The bind you&apos;re in
        </h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {PROBLEM.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          How it works
        </h2>
        <div className="mt-4 space-y-4">
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>
                {s.step}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{s.detail}</p>
            </div>
          ))}
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
          Why not just resell an overlay?
        </h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {WHY_NOT_OVERLAYS.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
          Pricing
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          The Agency plan is a flat recurring subscription that covers your client
          sites, branded reports, the multi-site view, and monitoring. What you
          charge each client for audits, remediation, and ongoing monitoring is
          yours to set. The markup is the business. Our price is your cost of
          goods.
        </p>
        <div className="mt-5">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b1f3a]/90"
          >
            See the Agency plan
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold" style={{ color: NAVY }}>
          Agency questions
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
        Not an agency, just need one audit?{" "}
        <Link href="/audit" className="font-medium underline" style={{ color: NAVY }}>
          See the one-time audit
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
