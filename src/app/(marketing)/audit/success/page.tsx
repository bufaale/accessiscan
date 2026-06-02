import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment received — AccessiScan",
  robots: { index: false },
};

export default function AuditSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold text-[#0b1f3a]">Payment received</h1>
      <p className="mt-4 text-base text-slate-600">
        Thanks. We&apos;re running your WCAG audit now and will email the
        prioritized report and VPAT-style summary to the address you used at
        checkout. It usually arrives within an hour.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        If you don&apos;t see it, check spam, then reply to that email (or write
        to alex@piposlab.com) and we&apos;ll sort it out right away.
      </p>
      <Link
        href="/free/wcag-scanner"
        className="mt-8 inline-flex items-center gap-1 rounded-md bg-[#0b1f3a] px-4 py-2 text-sm font-medium text-white hover:bg-[#071428]"
      >
        Run another quick scan
      </Link>
    </div>
  );
}
