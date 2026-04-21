import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { setSecurityHeaders } from "@/lib/security/headers";
import { applyMiddlewareRateLimit } from "@/lib/security/middleware-rate-limit";
import { applyWaf } from "@/lib/security/waf";

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (request.url.length > 8192) {
    return NextResponse.json({ error: "URI too long" }, { status: 414 });
  }

  // WAF-lite: cheapest reject first. Blocks scanner UAs, /wp-admin &
  // /.env path probes, path traversal, SQLi query-string patterns.
  const wafBlock = applyWaf(request);
  if (wafBlock) return setSecurityHeaders(wafBlock, request);

  // Unified rate limit on every /api/* request. Returns 429 if over the
  // per-path quota (strict on auth, heavy on IO, general otherwise).
  // Exempt paths (webhooks, cron) are bypassed.
  const rl = await applyMiddlewareRateLimit(request);
  if (rl) return setSecurityHeaders(rl, request);

  const response = await updateSession(request);
  return setSecurityHeaders(response, request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
    "/refund",
    // Every API path gets security headers + rate limit.
    "/api/:path*",
  ],
};
