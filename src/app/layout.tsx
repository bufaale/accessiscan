import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://accessiscan.piposlab.com"),
  title: "AccessiScan — WCAG 2.1 AA Compliance + VPAT 2.5 + CI/CD",
  description:
    "Real WCAG 2.1 AA scanning with AI-generated fix code, VPAT 2.5 export, and a GitHub Action for CI/CD. Built for the DOJ Title II deadline. From $19/mo.",
  openGraph: {
    title: "AccessiScan — WCAG 2.1 AA + VPAT 2.5",
    description:
      "Real WCAG 2.1 AA scanning with AI-generated fix code, VPAT 2.5 export, and a GitHub Action for CI/CD.",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AccessiScan — WCAG 2.1 AA + VPAT 2.5",
    description:
      "Real WCAG 2.1 AA scanning with AI-generated fix code, VPAT 2.5 export, and a GitHub Action for CI/CD.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
