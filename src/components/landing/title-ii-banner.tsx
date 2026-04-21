"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

const TITLE_II_DEADLINE_LARGE = new Date("2027-04-26T00:00:00Z");
const TITLE_II_DEADLINE_SMALL = new Date("2028-04-26T00:00:00Z");

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function getCountdown(target: Date): Countdown {
  const diff = target.getTime() - Date.now();
  const past = diff <= 0;
  const abs = Math.abs(diff);
  return {
    past,
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1_000),
  };
}

export function TitleIIBanner() {
  const [large, setLarge] = useState<Countdown | null>(null);
  const [small, setSmall] = useState<Countdown | null>(null);

  useEffect(() => {
    const tick = () => {
      setLarge(getCountdown(TITLE_II_DEADLINE_LARGE));
      setSmall(getCountdown(TITLE_II_DEADLINE_SMALL));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!large || !small) return null;

  const activeDeadline = large.past ? small : large;
  const deadlineLabel = large.past
    ? "Public entities under 50,000 residents — April 26, 2028"
    : "Public entities with 50,000+ residents — April 26, 2027";

  return (
    <div className="bg-[#dc2626] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-6 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 md:items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold leading-tight">
              DOJ Title II Web Accessibility Deadline
            </p>
            <p className="text-xs text-white/85 leading-tight">{deadlineLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <TimeBlock label="Days" value={activeDeadline.days} />
          <Separator />
          <TimeBlock label="Hrs" value={activeDeadline.hours} />
          <Separator />
          <TimeBlock label="Min" value={activeDeadline.minutes} />
          <Separator />
          <TimeBlock label="Sec" value={activeDeadline.seconds} />
        </div>

        <Link
          href="/signup"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#7f1d1d] transition-colors hover:bg-red-50"
        >
          Scan for Title II violations
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[42px] flex-col items-center px-1.5 py-0.5">
      <span className="text-base font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-[0.1em] text-white/75 leading-tight mt-0.5">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="text-white/40 text-base leading-none" aria-hidden>·</span>;
}
