import Link from "next/link";
import { Shield, ArrowUpRight } from "lucide-react";
import { CROSS_PROMO_OTHER_APPS as CROSS_PROMO } from "@/config/cross-promo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "WCAG scanner", href: "#product" },
      { label: "VPAT 2.5", href: "#government" },
      { label: "GitHub Action", href: "#government" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "WCAG 2.1 AA", href: "#product" },
      { label: "Section 508", href: "#government" },
      { label: "DOJ Title II", href: "/" },
      { label: "EN 301 549", href: "#government" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Overlay detector (free)", href: "/overlay-detector" },
      { label: "Why not overlays", href: "/why-not-overlays" },
      { label: "Sample VPAT", href: "#government" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0b1f3a] text-white">
      <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#06b6d4]">
                <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              AccessiScan
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Real WCAG 2.1 AA compliance — not an overlay band-aid. Built for public
              entities racing the DOJ Title II deadline.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section aria-labelledby="cross-promo" className="mt-12 border-t border-white/10 pt-8">
          <p
            id="cross-promo"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55"
          >
            More from Pipo Labs
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CROSS_PROMO.map((app) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#06b6d4]/40 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">
                    {app.name}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#06b6d4]"
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-sm text-white/60">{app.tagline}</p>
                <p className="mt-auto pt-3 font-mono text-xs text-white/40">
                  {app.price}
                </p>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} AccessiScan, Inc. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            AccessiScan does not warrant legal compliance. Consult qualified counsel.
          </p>
        </div>
      </div>
    </footer>
  );
}
