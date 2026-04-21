import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileBadge, GitPullRequest, ShieldCheck } from "lucide-react";

const CARDS = [
  {
    icon: FileBadge,
    title: "VPAT 2.5 export",
    body:
      "One-click VPAT 2.5 mapped to WCAG 2.1 A and AA success criteria. Hand it to procurement, RFPs, or your Section 508 officer.",
  },
  {
    icon: GitPullRequest,
    title: "GitHub Action",
    body:
      "Drop-in CI/CD action blocks merges on critical or serious WCAG violations. Posts a summary comment on every pull request.",
  },
  {
    icon: ShieldCheck,
    title: "Title II ready",
    body:
      "Evaluates against the WCAG 2.1 AA standard required by the DOJ Title II rule — deadlines extended (Apr 2026 IFR): April 26, 2027 for 50,000+ residents; April 26, 2028 for smaller entities.",
  },
];

export function GovCTA() {
  return (
    <section id="government" className="bg-slate-50">
      <div className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
            For government &amp; enterprise procurement
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-[#0b1f3a] sm:text-5xl">
            VPAT 2.5 and CI/CD — built in.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Procurement teams ask for VPATs. Engineering teams need accessibility checks
            in CI. AccessiScan is the only tool under $50/mo that ships both.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-md border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#0b1f3a]">
                <card.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-[#0b1f3a]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-11 rounded-md bg-[#0b1f3a] px-6 text-sm font-semibold text-white shadow-none hover:bg-[#071428]"
            asChild
          >
            <Link href="/signup">Start a free scan</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 rounded-md border-slate-300 bg-white px-6 text-sm font-semibold text-[#0b1f3a] shadow-none hover:border-[#0b1f3a] hover:bg-slate-50"
            asChild
          >
            <Link href="#pricing">View Pro &amp; Agency plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
