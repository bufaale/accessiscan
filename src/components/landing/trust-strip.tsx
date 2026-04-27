import { Landmark } from "lucide-react";

/**
 * Six municipal-seal placeholders displayed under the hero to signal
 * government/public-entity trust. Logos are intentionally monochrome and
 * understated — real seals are added later as procurement signs on.
 */
const SEALS = [
  { label: "City of Austin", pop: "964K" },
  { label: "State of NY", pop: "19.5M" },
  { label: "King County", pop: "2.3M" },
  { label: "Dept. of Education", pop: "—" },
  { label: "HHS Dept.", pop: "—" },
  { label: "City of Boston", pop: "655K" },
];

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Trusted positioning for public entities &amp; institutions
        </p>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {SEALS.map((s) => (
            <li
              key={s.label}
              className="flex flex-col items-center gap-2 text-slate-500 transition-colors hover:text-[#0b1f3a]"
            >
              <Landmark className="h-8 w-8" strokeWidth={1.3} aria-hidden />
              <p className="text-center text-[11px] font-semibold text-slate-700">
                {s.label}
              </p>
              {s.pop !== "—" && (
                <p className="font-mono text-[10px] text-slate-500">
                  pop. {s.pop}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[10px] text-slate-500">
          Designed for DOJ Title II public entities &middot; sample buyer profile
        </p>
      </div>
    </section>
  );
}
