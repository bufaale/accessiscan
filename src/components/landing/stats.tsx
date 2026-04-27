const STATS = [
  { value: "5,100+", label: "Federal ADA lawsuits 2025", accent: false },
  { value: "+37%", label: "Year-over-year increase", accent: false },
  { value: "$15K/yr", label: "What Siteimprove costs", accent: false },
  { value: "$19/mo", label: "What AccessiScan costs", accent: true },
];

export function Stats() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-slate-200 px-6 py-16 md:grid-cols-4 md:divide-x">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-start px-0 md:px-6 py-4">
            <span
              className={`font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-[56px] ${
                stat.accent ? "text-[#0e7490]" : "text-[#0b1f3a]"
              }`}
            >
              {stat.value}
            </span>
            <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
