import { Check, X, MinusCircle } from "lucide-react";

interface Row {
  tool: string;
  price: string;
  aiFix: "yes" | "no" | "partial";
  vpat: "yes" | "no" | "partial";
  ci: "yes" | "no" | "partial";
  highlight?: boolean;
}

const ROWS: Row[] = [
  { tool: "AccessiScan", price: "$19/mo", aiFix: "yes", vpat: "yes", ci: "yes", highlight: true },
  { tool: "accessiBe", price: "$49/mo", aiFix: "no", vpat: "no", ci: "no" },
  { tool: "UserWay", price: "$49/mo", aiFix: "no", vpat: "no", ci: "no" },
  { tool: "Siteimprove", price: "$15,000/yr", aiFix: "partial", vpat: "yes", ci: "no" },
  { tool: "Deque axe", price: "Free / $45/user", aiFix: "no", vpat: "no", ci: "partial" },
];

function Cell({ value }: { value: "yes" | "no" | "partial" }) {
  if (value === "yes") return <Check className="h-4 w-4 text-[#0e7490]" strokeWidth={2.5} />;
  if (value === "partial")
    return <MinusCircle className="h-4 w-4 text-slate-500" strokeWidth={2} />;
  return <X className="h-4 w-4 text-slate-300" strokeWidth={2} />;
}

export function Comparison() {
  return (
    <section id="comparison" className="bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0e7490]">
            Competitive landscape
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-[#0b1f3a] sm:text-5xl">
            How AccessiScan compares.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Compiled April 2026 from public pricing pages.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-md border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="px-5 py-4 font-semibold">Tool</th>
                  <th className="px-5 py-4 font-semibold">Starting price</th>
                  <th className="px-5 py-4 font-semibold">AI fix code</th>
                  <th className="px-5 py-4 font-semibold">VPAT 2.5 export</th>
                  <th className="px-5 py-4 font-semibold">CI/CD action</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.tool}
                    className={
                      row.highlight
                        ? "border-b border-slate-200 bg-[#ecfeff]/40 border-l-[3px] border-l-[#06b6d4]"
                        : "border-b border-slate-200 last:border-0"
                    }
                  >
                    <td className={`px-5 py-4 font-semibold ${row.highlight ? "text-[#0b1f3a]" : "text-slate-700"}`}>
                      {row.tool}
                      {row.highlight && (
                        <span className="ml-2 rounded-sm bg-[#0b1f3a] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Us
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 ${row.highlight ? "font-semibold text-[#0b1f3a]" : "text-slate-600"}`}>
                      {row.price}
                    </td>
                    <td className="px-5 py-4"><Cell value={row.aiFix} /></td>
                    <td className="px-5 py-4"><Cell value={row.vpat} /></td>
                    <td className="px-5 py-4"><Cell value={row.ci} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3 w-3 text-[#0e7490]" strokeWidth={3} /> Fully supported
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MinusCircle className="h-3 w-3 text-slate-500" /> Partial or add-on
          </span>
          <span className="inline-flex items-center gap-1.5">
            <X className="h-3 w-3 text-slate-300" /> Not available
          </span>
        </div>
      </div>
    </section>
  );
}
