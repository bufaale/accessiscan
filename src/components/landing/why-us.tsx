import { Code, ShieldOff, DollarSign, FileCode } from "lucide-react";

const reasons = [
  {
    icon: ShieldOff,
    title: "Not an Overlay",
    description:
      "Overlays patch the surface. We scan your source code and generate real fixes. The FTC fined the leading overlay provider $1M for deceptive claims — overlays don't prevent lawsuits.",
  },
  {
    icon: Code,
    title: "AI-Generated Fix Code",
    description:
      "Every tool tells you what's wrong. We're the only affordable tool that writes the actual code to fix it. Copy-paste our AI suggestions and resolve issues in minutes, not hours.",
  },
  {
    icon: DollarSign,
    title: "10-50x Cheaper Than Enterprise",
    description:
      "Siteimprove charges $15,000/yr. Deque axe Monitor costs $27,000/yr. Level Access starts at $15,000/yr. We start at $39/mo with the same AI fix capabilities.",
  },
  {
    icon: FileCode,
    title: "Flat, Predictable Pricing",
    description:
      "No traffic-based pricing that balloons as you grow. No per-user fees. No surprise add-ons. One flat price per tier, cancel anytime.",
  },
];

export function WhyUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Why AccessiScan over alternatives?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Real compliance scanning with AI fix code — not a cosmetic overlay
            that puts you at legal risk.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
