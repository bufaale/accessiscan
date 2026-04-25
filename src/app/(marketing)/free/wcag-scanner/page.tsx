import type { Metadata } from "next";
import { FreeScannerForm } from "@/components/free-scan/scanner-form";

export const metadata: Metadata = {
  title: "Free WCAG Scanner — instant accessibility check | AccessiScan",
  description:
    "Run a free instant WCAG 2.1 AA check on any public URL. See the top 5 most common accessibility issues in under 30 seconds. No signup required.",
  alternates: { canonical: "/free/wcag-scanner" },
  openGraph: {
    title: "Free WCAG Scanner — AccessiScan",
    description:
      "Instant WCAG 2.1 AA check on any URL. Top 5 issues in 30 seconds. No signup.",
    type: "website",
  },
};

export default function FreeWcagScannerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Free tool · no signup
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#0b1f3a]">
          Free WCAG 2.1 AA Scanner
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Paste any public URL. We&apos;ll check the 5 most common WCAG 2.1 AA failures
          (missing alt text, unlabeled inputs, missing language, viewport, heading
          hierarchy) and show you the results in under 30 seconds.
        </p>
      </header>

      <div className="mt-10">
        <FreeScannerForm />
      </div>

      <section className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
        <h2 className="font-semibold text-[#0b1f3a]">What this free tool does NOT do</h2>
        <p className="mt-2">
          This is a fast, regex-based check that runs against the page&apos;s initial HTML
          response. It&apos;s great for catching the most common issues but it does NOT:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Render JavaScript (single-page apps will only show their fallback HTML)</li>
          <li>Check color contrast or focus order</li>
          <li>Crawl multiple pages</li>
          <li>Generate a VPAT 2.5 / ACR document</li>
          <li>Open Auto-Fix PRs against your repo</li>
        </ul>
        <p className="mt-3">
          For a full WCAG 2.1 AA + 2.2 audit with Playwright rendering, AI-generated
          fix code, VPAT export, and a GitHub Action, see{" "}
          <a href="/" className="text-[#0b1f3a] underline">
            AccessiScan starting at $19/mo
          </a>
          .
        </p>
      </section>
    </div>
  );
}
