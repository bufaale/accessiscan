import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Scale, ShieldAlert, Code, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Why Accessibility Overlays Don't Work | AccessiScan",
  description:
    "Accessibility overlays and widgets don't fix ADA compliance. Learn why overlays fail, the FTC fine, lawsuit data, and what actually works.",
  openGraph: {
    title: "Why Accessibility Overlays Don't Work",
    description:
      "22.6% of ADA lawsuits target sites WITH overlays. Learn why widgets fail and what actually fixes compliance.",
  },
};

const problems = [
  {
    icon: ShieldAlert,
    title: "Overlays Don't Fix Source Code",
    description:
      "Overlay widgets inject JavaScript on top of your site but never fix the underlying HTML, ARIA attributes, or semantic structure. Screen readers still encounter the broken source code underneath.",
  },
  {
    icon: Scale,
    title: "Courts Don't Accept Overlays as Defense",
    description:
      "In multiple ADA lawsuits (Murphy v. Eyebobs, Langer v. Grocery Outlet), courts ruled that overlays do not constitute an adequate accessibility remediation. Having an overlay provides zero legal protection.",
  },
  {
    icon: AlertTriangle,
    title: "FTC Fined an Overlay Provider $1M",
    description:
      "In 2024, the FTC fined accessiBe $1M for deceptive marketing claims. The FTC found that their AI-powered overlay could not deliver the WCAG conformance they promised to customers.",
  },
  {
    icon: Code,
    title: "They Break for Assistive Technology Users",
    description:
      "The National Federation of the Blind and other disability advocacy groups have publicly opposed overlays. Overlays often interfere with the assistive technologies they claim to support, making sites worse, not better.",
  },
];

const stats = [
  { value: "22.6%", label: "of ADA lawsuits target sites WITH an overlay widget" },
  { value: "37%", label: "increase in ADA digital lawsuits year-over-year" },
  { value: "$1M", label: "FTC fine against overlay provider for deceptive claims" },
  { value: "5,000+", label: "ADA website lawsuits filed annually" },
];

export default function WhyNotOverlaysPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <div className="text-center">
          <Badge variant="destructive" className="mb-4">
            ADA Compliance Warning
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Why Accessibility Overlays{" "}
            <span className="text-destructive">Don&apos;t Work</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Overlay widgets promise instant ADA compliance with a single line of
            JavaScript. The reality: they don&apos;t fix your code, courts
            don&apos;t accept them as defense, and the FTC has already fined an
            overlay provider $1M for deceptive claims.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-destructive">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Problem Cards */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold text-center">
            4 Reasons Overlays Fail
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {problems.map((problem) => (
              <Card key={problem.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <problem.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What Actually Works */}
        <div className="mt-16 rounded-lg border bg-muted/40 p-8">
          <h2 className="text-2xl font-bold">What Actually Works</h2>
          <p className="mt-4 text-muted-foreground">
            Real ADA compliance requires fixing your actual source code — the
            HTML structure, ARIA attributes, color contrast, keyboard navigation,
            and semantic markup. There are no shortcuts.
          </p>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Automated scanning</strong>{" "}
                to find WCAG violations in your actual HTML and CSS
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">AI-generated fix code</strong>{" "}
                that shows developers exactly what to change
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Ongoing monitoring</strong>{" "}
                to catch regressions as your site changes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">PDF compliance reports</strong>{" "}
                that document your remediation effort
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">
            Scan Your Site for Real Compliance
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            AccessiScan finds the actual WCAG issues in your source code and
            generates fix code — no overlay band-aids. Starting at $19/mo.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/free/wcag-scanner">Start Free Scan</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#comparison">See How We Compare</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
