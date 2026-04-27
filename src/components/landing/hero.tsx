import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b1f3a] text-white">
      {/* subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e7490]">
              ADA Title II · WCAG 2.1 AA · VPAT 2.5
            </span>
          </div>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-[72px]">
            Real WCAG 2.1 AA compliance — not an overlay band-aid.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            22.6% of ADA lawsuits target overlay users. AccessiScan ships actual
            fix code, a VPAT 2.5 export, and a CI/CD action — from{" "}
            <span className="font-semibold text-white">$19/mo</span>.
          </p>

          {/* Pull quote: FTC $1M fine — editorial treatment */}
          <figure className="mt-8 max-w-xl rounded-md border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <span
                className="font-display text-5xl font-bold leading-none text-[#0e7490]"
                aria-hidden
              >
                “
              </span>
              <div className="flex-1 pt-1">
                <blockquote className="text-xl leading-snug text-white">
                  The FTC fined accessiBe{" "}
                  <span className="text-[#0e7490]">$1M</span> for deceptive
                  &ldquo;fully compliant&rdquo; claims.
                </blockquote>
                <figcaption className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/50">
                  U.S. Federal Trade Commission · 2025 consent order
                </figcaption>
              </div>
            </div>
          </figure>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-md bg-[#dc2626] px-6 text-base font-semibold text-white shadow-none transition-colors hover:bg-[#b91c1c]"
              asChild
            >
              <Link href="/signup">
                Start free Title II scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-md border-white/25 bg-transparent px-6 text-base font-semibold text-white shadow-none transition-colors hover:border-white hover:bg-white/5"
              asChild
            >
              <Link href="#comparison">See how we compare</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55">
            <TrustItem>No credit card required</TrustItem>
            <TrustItem>Free tier · 2 scans/mo</TrustItem>
            <TrustItem>Not an overlay</TrustItem>
          </div>
        </div>

        <WcagSchematic />
      </div>
    </section>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="h-3.5 w-3.5 text-[#0e7490]" />
      {children}
    </span>
  );
}

/**
 * Monochrome line-art schematic of a website with floating WCAG success
 * criterion IDs — replaces the prior dashboard mockup for a more editorial feel.
 */
function WcagSchematic() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      {/* Floating WCAG criterion chips */}
      <CriterionChip id="1.1.1" label="Non-text content" className="left-[-8%] top-[4%]" />
      <CriterionChip id="1.4.3" label="Contrast (min)" className="right-[-6%] top-[22%]" />
      <CriterionChip id="2.4.4" label="Link purpose" className="left-[-4%] top-[58%]" />
      <CriterionChip id="4.1.2" label="Name · role · value" className="right-[-4%] bottom-[6%]" />

      {/* Website schematic */}
      <svg
        viewBox="0 0 420 520"
        className="relative z-10 h-auto w-full text-white/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {/* Outer frame */}
        <rect x="8" y="8" width="404" height="504" rx="6" />
        {/* Browser dots */}
        <circle cx="28" cy="30" r="3" fill="currentColor" stroke="none" />
        <circle cx="42" cy="30" r="3" fill="currentColor" stroke="none" />
        <circle cx="56" cy="30" r="3" fill="currentColor" stroke="none" />
        <line x1="8" y1="52" x2="412" y2="52" />

        {/* Header region */}
        <rect x="32" y="78" width="120" height="14" rx="2" />
        <rect x="170" y="78" width="60" height="14" rx="2" />
        <rect x="244" y="78" width="60" height="14" rx="2" />
        <rect x="318" y="78" width="70" height="22" rx="2" className="fill-[#06b6d4]/25" />

        {/* Hero heading */}
        <line x1="32" y1="136" x2="260" y2="136" strokeWidth="2.4" />
        <line x1="32" y1="152" x2="220" y2="152" strokeWidth="2.4" />
        <line x1="32" y1="180" x2="320" y2="180" />
        <line x1="32" y1="194" x2="290" y2="194" />

        {/* Hero image + CTA */}
        <rect x="32" y="220" width="88" height="26" rx="3" className="fill-[#06b6d4]/20" />
        <rect x="128" y="220" width="88" height="26" rx="3" />

        {/* Illustration placeholder (diagonal hatching) */}
        <rect x="260" y="116" width="128" height="128" rx="4" />
        <line x1="260" y1="244" x2="388" y2="116" strokeWidth="0.8" strokeDasharray="3,3" />
        <line x1="260" y1="116" x2="388" y2="244" strokeWidth="0.8" strokeDasharray="3,3" />

        {/* Feature grid */}
        <rect x="32" y="282" width="112" height="100" rx="4" />
        <rect x="154" y="282" width="112" height="100" rx="4" />
        <rect x="276" y="282" width="112" height="100" rx="4" />

        {/* Cards headers */}
        <line x1="44" y1="310" x2="120" y2="310" strokeWidth="2" />
        <line x1="44" y1="328" x2="132" y2="328" />
        <line x1="44" y1="342" x2="108" y2="342" />
        <line x1="166" y1="310" x2="242" y2="310" strokeWidth="2" />
        <line x1="166" y1="328" x2="254" y2="328" />
        <line x1="166" y1="342" x2="230" y2="342" />
        <line x1="288" y1="310" x2="364" y2="310" strokeWidth="2" />
        <line x1="288" y1="328" x2="376" y2="328" />
        <line x1="288" y1="342" x2="352" y2="342" />

        {/* Form region */}
        <line x1="32" y1="418" x2="140" y2="418" strokeWidth="2" />
        <rect x="32" y="430" width="356" height="32" rx="4" />
        <rect x="32" y="470" width="356" height="32" rx="4" />

        {/* Highlighted contrast indicator (issue) */}
        <circle cx="374" cy="186" r="5" className="fill-[#dc2626]" stroke="none" />
      </svg>

      {/* Subtle gradient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[32px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(6,182,212,0.18), transparent 70%)",
        }}
        aria-hidden
      />
    </div>
  );
}

function CriterionChip({
  id,
  label,
  className = "",
}: {
  id: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-2 rounded-sm border border-[#06b6d4]/40 bg-[#0b1f3a] px-2.5 py-1.5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <span className="font-mono text-[11px] font-bold text-[#0e7490]">{id}</span>
      <span className="text-[10px] uppercase tracking-[0.1em] text-white/70">
        {label}
      </span>
    </div>
  );
}
