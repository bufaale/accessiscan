import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/content/blog/registry";

export const metadata: Metadata = {
  title: "AccessiScan Blog — WCAG, ADA, EN 301 549, and overlay news",
  description:
    "In-depth articles on WCAG 2.1/2.2, DOJ Title II, EN 301 549, the accessiBe FTC consent order, and procurement-grade accessibility audits.",
  alternates: { canonical: "/blog" },
};

const CATEGORY_LABEL: Record<string, string> = {
  compliance: "Compliance",
  wcag: "WCAG",
  procurement: "Procurement",
  comparisons: "Comparisons",
  "how-to": "How-to",
};

export default function BlogIndex() {
  const sorted = [...POSTS].sort((a, b) => (a.date > b.date ? -1 : 1));
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-[#0b1f3a] text-white">
        <div className="mx-auto max-w-[1100px] px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e7490]">
            AccessiScan · blog
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Accessibility compliance, explained by operators
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            WCAG 2.1 AA is the technical standard — but the real work is
            knowing which lawsuits to read, which procurement language to use,
            and which vendor claims to ignore. These are our field notes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col rounded-md border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e7490]">
                <span>{CATEGORY_LABEL[p.category] ?? p.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{p.readMinutes} min read</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-[#0b1f3a] group-hover:text-[#0e7490]">
                {p.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {p.excerpt}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Published {p.date}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
