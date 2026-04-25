import Link from "next/link";
import { ArrowRight, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  label: string;
  done: boolean;
}

interface EmptyStateProps {
  title: string;
  description: string;
  cta_label: string;
  cta_href: string;
  steps?: Step[];
  estimated_time?: string;
}

/**
 * Empty-state card shown when a dashboard list/widget has no data yet.
 * Pairs a clear primary CTA with optional onboarding pips so the user sees
 * how close they are to the first real result.
 */
export function EmptyState({
  title,
  description,
  cta_label,
  cta_href,
  steps,
  estimated_time,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-6 w-6 text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>

        {steps && steps.length > 0 && (
          <ol className="flex flex-wrap justify-center gap-2 text-xs">
            {steps.map((s, i) => (
              <li
                key={i}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                  s.done
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-300 bg-white text-slate-600"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    s.done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {i + 1}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
        )}

        <Link
          href={cta_href}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428]"
        >
          {cta_label} <ArrowRight className="h-4 w-4" />
        </Link>

        {estimated_time && (
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {estimated_time}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
