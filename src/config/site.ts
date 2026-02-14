export const siteConfig = {
  name: "ADA Scanner",
  description:
    "AI-powered WCAG compliance scanner. Analyze any website's accessibility in seconds with detailed scores, actionable recommendations, and AI-generated fix suggestions.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/bufaale/ada-scanner",
    twitter: "https://twitter.com/adascanner",
  },
} as const;
