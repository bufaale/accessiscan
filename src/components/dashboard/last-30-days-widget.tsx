import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Last30DaysStats {
  scans_run: number;
  issues_found: number;
  issues_fixed: number;
  scans_run_prev: number;
  issues_found_prev: number;
  issues_fixed_prev: number;
}

export function calcDelta(current: number, prev: number): { pct: number; direction: "up" | "down" | "flat" } {
  if (prev === 0) {
    if (current === 0) return { pct: 0, direction: "flat" };
    return { pct: 100, direction: "up" };
  }
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct > 0) return { pct, direction: "up" };
  if (pct < 0) return { pct: Math.abs(pct), direction: "down" };
  return { pct: 0, direction: "flat" };
}

interface MetricProps {
  label: string;
  current: number;
  prev: number;
  positiveIsGood?: boolean;
}

function Metric({ label, current, prev, positiveIsGood = true }: MetricProps) {
  const delta = calcDelta(current, prev);
  const goodDirection = positiveIsGood ? "up" : "down";
  const isGood = delta.direction === "flat" || delta.direction === goodDirection;
  const Icon =
    delta.direction === "up" ? TrendingUp : delta.direction === "down" ? TrendingDown : Minus;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{current.toLocaleString()}</p>
      <div
        className={`mt-1 inline-flex items-center gap-1 text-xs ${isGood ? "text-emerald-700" : "text-rose-700"}`}
      >
        <Icon className="h-3 w-3" />
        {delta.direction === "flat" ? "No change" : `${delta.pct}% vs prev 30d`}
      </div>
    </div>
  );
}

export function Last30DaysWidget({ stats }: { stats: Last30DaysStats }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Last 30 days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <Metric label="Scans run" current={stats.scans_run} prev={stats.scans_run_prev} />
          <Metric
            label="Issues found"
            current={stats.issues_found}
            prev={stats.issues_found_prev}
            positiveIsGood={false}
          />
          <Metric
            label="Issues fixed"
            current={stats.issues_fixed}
            prev={stats.issues_fixed_prev}
          />
        </div>
      </CardContent>
    </Card>
  );
}
