import Link from "next/link";

// BUG-11 (2026-09-06 UI coverage pass, row 64): an invalid or expired
// /scan-result/<token> link — the guaranteed end state of every scan anyone
// shares, since the share box says "Expires in 30 days" — used to fall
// through to Next.js's bare framework 404 (`<title>404: This page could not
// be found.</title>`, no AccessiScan branding, no way back). This
// segment-scoped not-found.tsx renders instead, for both an unknown token
// and an expired one; the copy stays honest and doesn't claim to know which
// case it is.
export default function ScanResultNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Scan not found
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
        This scorecard doesn&apos;t exist — or it expired.
      </h1>
      <p className="mb-8 max-w-md text-base leading-relaxed text-slate-600">
        Public scan links expire 30 days after they&apos;re created, and this
        one either passed that window or the link itself was mistyped. Your
        original site wasn&apos;t affected — run a fresh scan any time.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/free/wcag-scanner"
          className="rounded-lg bg-[#0b1f3a] px-5 py-2.5 font-semibold text-white hover:bg-[#071428]"
        >
          Run a free WCAG scan
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to AccessiScan
        </Link>
      </div>
    </main>
  );
}
