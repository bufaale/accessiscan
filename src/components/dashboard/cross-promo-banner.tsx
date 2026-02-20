"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search, FileBarChart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const promos = [
  {
    icon: Search,
    title: "Complete Your Web Audit",
    description: "Checking accessibility? Run a full SEO audit too with SiteAuditPro.",
    url: "https://app-01-seo-audit.vercel.app",
    cta: "Try SiteAuditPro",
  },
  {
    icon: FileBarChart,
    title: "Professional Client Reports",
    description: "Turn your scan data into branded reports clients love with ReportFlow.",
    url: "https://app-10-agency-reporting.vercel.app",
    cta: "Try ReportFlow",
  },
];

export function CrossPromoBanner() {
  const promo = useMemo(() => promos[Math.floor(Math.random() * promos.length)], []);
  const Icon = promo.icon;

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardContent className="flex items-center gap-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{promo.title}</p>
          <p className="text-xs text-muted-foreground">{promo.description}</p>
        </div>
        <Link
          href={promo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          {promo.cta}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
