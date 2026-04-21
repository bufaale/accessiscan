import type { Metadata } from "next";
import { OverlayDetectorClient } from "./overlay-detector-client";
import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { OVERLAY_VENDORS } from "@/lib/overlay/detect";

export const metadata: Metadata = {
  title: "Free Accessibility Overlay Detector | AccessiScan",
  description:
    "Scan any URL to check if it's using accessiBe, UserWay, AudioEye, EqualWeb or another accessibility overlay widget. Learn the FTC and class-action risks. Free, no signup.",
  alternates: { canonical: "/overlay-detector" },
  openGraph: {
    title: "Free Accessibility Overlay Detector | AccessiScan",
    description:
      "Check any site for accessiBe, UserWay, AudioEye overlays. Understand the $1M FTC penalty and ongoing class actions.",
    url: "/overlay-detector",
    type: "website",
  },
};

export default function OverlayDetectorPage() {
  return (
    <main className="min-h-screen bg-white text-[#0b1f3a]">
      <section className="bg-[#0b1f3a] text-white">
        <div className="mx-auto max-w-[1100px] px-6 py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-sm border border-[#dc2626]/50 bg-[#dc2626]/10 px-3 py-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-[#fca5a5]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fca5a5]">
              Free Tool · No Signup
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Is your site secretly exposed to ADA lawsuits?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            Paste any URL. We check for 6+ accessibility overlay widgets (accessiBe,
            UserWay, AudioEye, EqualWeb, Accessibly, Max Access) and show you the
            regulatory exposure that comes with each.
          </p>

          <div className="mt-10 rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <OverlayDetectorClient />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span>Checks without executing JavaScript · 8s timeout</span>
            <span>·</span>
            <span>Rate-limited to 60 checks/min per IP</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
            Why overlays are a liability
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            The FTC fined accessiBe $1M. Class actions are active. ADA demand letters keep coming.
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-slate-700">
            <p>
              An accessibility overlay is a JavaScript widget that promises to make your
              site WCAG-compliant by adding a toolbar. <strong>It cannot.</strong> The
              W3C, WebAIM, the National Federation of the Blind and every major
              disability advocacy organization have publicly opposed overlays. 22.6% of
              US ADA lawsuits in 2024 targeted sites using an overlay — because the
              underlying accessibility barriers remain.
            </p>
            <p>
              In March 2025 the Federal Trade Commission entered a consent order fining
              <strong> accessiBe $1M</strong> for deceptive claims that its product
              provided WCAG 2.1 AA compliance. UserWay is the subject of an active class
              action. AudioEye&apos;s own SEC 10-K discloses ongoing litigation risk for
              deploying customers.
            </p>
            <p>
              If your site is running one of these widgets, you are relying on a product
              that regulators have already penalized and that courts continue to hold
              insufficient for ADA purposes.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="font-display text-xl font-semibold">Overlays we detect</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {OVERLAY_VENDORS.map((v) => (
              <div
                key={v.id}
                className="rounded-md border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#dc2626]" />
                  <div>
                    <p className="font-display text-base font-semibold">{v.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{v.tagline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-[1100px] px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
                The real solution
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Get a real audit, not a widget.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-700">
                AccessiScan ships actual fix code per violation, a VPAT 2.5 export for
                procurement, an EN 301 549 report for EU buyers, and a GitHub Action
                that blocks merges on critical issues. From $19/mo — cheaper than most
                overlays, and defensible when a demand letter arrives.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-md bg-[#0b1f3a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#071428]"
                >
                  Start a free real audit
                </Link>
                <Link
                  href="/why-not-overlays"
                  className="inline-flex h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-[#0b1f3a] transition-colors hover:border-[#0b1f3a]"
                >
                  Why overlays fail, in depth
                </Link>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
                What AccessiScan ships that overlays don&apos;t
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2"><Dot /> Per-issue fix code you paste into your codebase</li>
                <li className="flex gap-2"><Dot /> VPAT 2.5 export for US federal + state procurement</li>
                <li className="flex gap-2"><Dot /> EN 301 549 report for EU procurement under the EAA</li>
                <li className="flex gap-2"><Dot /> GitHub Action that blocks PRs with critical WCAG violations</li>
                <li className="flex gap-2"><Dot /> Audit trail that stands up in litigation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dot() {
  return (
    <span
      className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#06b6d4]"
      aria-hidden
    />
  );
}
