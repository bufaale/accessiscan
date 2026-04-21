"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#comparison", label: "Comparison" },
  { href: "#government", label: "Government" },
  { href: "/overlay-detector", label: "Overlay detector" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-[17px] font-bold text-[#0b1f3a]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#06b6d4]">
            <Shield className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </span>
          AccessiScan
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0b1f3a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0b1f3a]"
          >
            Sign in
          </Link>
          <Button
            size="sm"
            className="h-9 rounded-md bg-[#0b1f3a] px-4 font-medium text-white shadow-none transition-colors hover:bg-[#071428]"
            asChild
          >
            <Link href="/signup">Start free scan</Link>
          </Button>
        </div>

        <div className="flex items-center md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-display">AccessiScan</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-slate-600 transition-colors hover:text-[#0b1f3a]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-slate-200" />
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-[#0b1f3a] text-white hover:bg-[#071428]"
                >
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Start free scan
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
