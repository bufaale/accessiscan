import { NextResponse, type NextRequest } from "next/server";

/**
 * Defense-in-depth HTTP security headers. Set on every response by
 * middleware.ts. Stricter than the minimum OWASP recommendations.
 *
 * Coverage:
 *  - Content-Security-Policy (nonce-free; Next.js needs inline for
 *    hydration scripts, documented in MEMORY.md)
 *  - Strict-Transport-Security with preload (requires HSTS preload
 *    submission at https://hstspreload.org after first deploy)
 *  - X-Frame-Options + frame-ancestors 'none' (clickjacking defense)
 *  - X-Content-Type-Options (MIME sniffing defense)
 *  - Cross-Origin-Opener-Policy + Cross-Origin-Resource-Policy
 *    (Spectre / side-channel defense)
 *  - Cross-Origin-Embedder-Policy (for same-site shared-memory apps;
 *    set to 'unsafe-none' by default so third-party embeds work,
 *    tighten to 'require-corp' only if the app uses SharedArrayBuffer)
 *  - Permissions-Policy (denies access to sensitive browser APIs by
 *    default — any feature we actually use must be listed explicitly)
 *  - Referrer-Policy
 *  - Cache-Control on /api/* (no-store; never cache authenticated JSON)
 */
export function setSecurityHeaders(
  response: NextResponse,
  request: NextRequest,
): NextResponse {
  const headers = response.headers;
  const pathname = request.nextUrl.pathname;

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // HSTS with preload — this apex domain commits to HTTPS. Once deployed,
  // submit the apex at https://hstspreload.org for browser preload lists.
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // Permissions-Policy locks down sensitive browser APIs. Every feature we
  // don't explicitly use is disabled. FLoC / interest-cohort is explicitly
  // opted out so Google cannot classify our users via Topics API.
  headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "battery=()",
      "camera=()",
      "cross-origin-isolated=()",
      "display-capture=()",
      "document-domain=()",
      "encrypted-media=()",
      "execution-while-not-rendered=()",
      "execution-while-out-of-viewport=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "keyboard-map=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "navigation-override=()",
      "payment=(self)",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "usb=()",
      "web-share=()",
      "xr-spatial-tracking=()",
      "interest-cohort=()",
    ].join(", "),
  );

  // Cross-origin isolation. COOP breaks window.opener from cross-origin
  // popups (OAuth callbacks still work because same-origin). CORP limits
  // which origins can embed our resources.
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  // NOTE: NOT setting Cross-Origin-Embedder-Policy: require-corp. Enabling
  // it would block embeds of Stripe / Google fonts / Supabase without them
  // serving CORP headers. Only enable if we move to SharedArrayBuffer.

  // Legacy but still parsed by some WAFs.
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("X-DNS-Prefetch-Control", "off");

  // CSP — built below.
  headers.set("Content-Security-Policy", buildCSP());

  // Cache hygiene. Authenticated JSON APIs must NEVER be cached by any
  // intermediate, browser, or shared cache.
  if (pathname.startsWith("/api/")) {
    // Webhook routes need to be consumed fresh; dashboard data likewise.
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
  }

  return response;
}

function buildCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // script-src: Next.js requires 'unsafe-inline' for hydration. This is a
    // known limitation of App Router. Mitigated by Trusted Types at the
    // client level (Next 15+ supports). For additional defense, consider
    // moving to nonce-based CSP once Next.js 16 stabilizes it.
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "https://js.stripe.com",
      "https://va.vercel-scripts.com",
    ],
    "script-src-elem": [
      "'self'",
      "'unsafe-inline'",
      "https://js.stripe.com",
      "https://va.vercel-scripts.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "style-src-elem": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://*.supabase.co",
      "https://lh3.googleusercontent.com",
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.stripe.com",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
    ],
    "frame-src": ["https://js.stripe.com", "https://hooks.stripe.com"],
    "media-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  if (isDev) {
    directives["script-src"].push("'unsafe-eval'");
    directives["script-src-elem"].push("'unsafe-eval'");
    directives["connect-src"].push("ws://localhost:*", "http://localhost:*");
  }

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`,
    )
    .join("; ");
}
