const REASONS = [
  {
    number: "01",
    title: "Overlays don't fix the underlying HTML.",
    body:
      "An overlay widget injects a script into the page. It does not correct the semantic HTML, the ARIA attributes, the contrast ratios, or the keyboard traps that plaintiffs sue over.",
  },
  {
    number: "02",
    title: "22.6% of ADA lawsuits now target overlay users.",
    body:
      "Plaintiffs' firms explicitly advertise that overlay-installed sites are their preferred target. The widget is a signal that a real audit was never performed.",
  },
  {
    number: "03",
    title: "The FTC fined accessiBe $1M for deceptive claims.",
    body:
      "In 2025 the FTC issued a consent order over accessiBe's 'fully compliant' marketing. Buyers of overlay products inherited the reputational and legal exposure.",
  },
];

export function ProductTruth() {
  return (
    <section id="product" className="bg-[#0b1f3a] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e7490]">
            The case against overlays
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Three reasons overlay widgets get sued.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            Drawn from 2025 federal lawsuit data and public FTC filings. Overlays are the
            single largest recurring failure pattern in ADA web-accessibility litigation.
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.number} className="flex flex-col">
              <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-[#0e7490]">
                {r.number}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-white">
                {r.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
