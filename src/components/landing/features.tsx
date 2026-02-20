import {
  CheckCircle,
  Sparkles,
  Layers,
  FileText,
  TrendingUp,
  Shield,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Eye,
    title: "Visual AI Analysis",
    description:
      "Industry-first: AI vision analyzes screenshots of your pages to detect contrast issues on images, small touch targets, and visual barriers that code scanners completely miss.",
    highlight: true,
  },
  {
    icon: CheckCircle,
    title: "WCAG 2.1 Compliance",
    description:
      "Check against Level A, AA, and AAA guidelines automatically. Identify accessibility barriers before they become legal issues.",
  },
  {
    icon: Sparkles,
    title: "AI Fix Suggestions",
    description:
      "Get specific code fixes for every accessibility issue found. Claude AI analyzes your site and provides actionable recommendations.",
  },
  {
    icon: Layers,
    title: "Deep Scan",
    description:
      "Scan up to 10 pages to find issues across your entire site. Comprehensive crawling ensures nothing is missed.",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    description:
      "Download professional PDF reports for stakeholders and legal teams. White-label options available for agencies.",
  },
  {
    icon: TrendingUp,
    title: "Issue Tracking",
    description:
      "Monitor compliance scores over time across multiple sites. Track improvements and catch regressions early.",
  },
  {
    icon: Shield,
    title: "Legal Protection",
    description:
      "Stay ahead of ADA lawsuits with proactive scanning. Demonstrate due diligence with regular compliance reports.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need for WCAG compliance
          </h2>
          <p className="text-muted-foreground mt-4 mx-auto max-w-2xl">
            A complete accessibility toolkit that scans, analyzes, and helps you fix
            issues — all in one place.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`transition-shadow hover:shadow-md ${
                feature.highlight
                  ? "border-violet-300 dark:border-violet-700 bg-linear-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 ring-1 ring-violet-200 dark:ring-violet-800 sm:col-span-2 lg:col-span-1"
                  : ""
              }`}
            >
              <CardHeader>
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${
                  feature.highlight ? "bg-violet-100 dark:bg-violet-900/30" : "bg-primary/10"
                }`}>
                  <feature.icon className={`h-5 w-5 ${feature.highlight ? "text-violet-600" : "text-primary"}`} />
                </div>
                <CardTitle className="flex items-center gap-2">
                  {feature.title}
                  {feature.highlight && (
                    <Badge className="bg-violet-600 text-white text-[10px]">NEW</Badge>
                  )}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
