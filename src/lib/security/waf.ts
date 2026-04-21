/**
 * Middleware-level WAF-lite. Runs before rate limiter + session refresh,
 * rejecting obvious malicious patterns cheaply so we don't pay Supabase
 * RPC time, Upstash commands, or Anthropic tokens on attack traffic.
 *
 * We deliberately stay conservative — rules here block patterns that have
 * NO legitimate use (SQL injection probes, path traversal, common
 * scanner UAs). Anything that could false-positive is handled in per-route
 * validation.
 */

import { NextResponse, type NextRequest } from "next/server";

/** User-agent substrings we block outright. */
const BAD_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "wpscan",
  "zgrab",
  "nuclei",
  "acunetix",
  "burp",
  "metasploit",
  "w3af",
  "openvas",
  "havij",
  "dirbuster",
  "gobuster",
  "ffuf",
  "dirb",
];

/** Path substrings that indicate scanning for known vulnerable endpoints.
 *  Requests for these paths return 404 immediately with no further work. */
const BAD_PATH_SUBSTRINGS = [
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wordpress",
  "/.env",
  "/.git/",
  "/.git/config",
  "/phpmyadmin",
  "/phpMyAdmin",
  "/.aws/credentials",
  "/.ssh/",
  "/config.php",
  "/composer.json",
  "/.vscode",
  "/.idea",
  "/.DS_Store",
  "/server-status",
  "/admin.php",
  "/shell.php",
  "/cgi-bin/",
  "/xmlrpc.php",
];

/** Query string patterns that are used in automated SQL-injection probes.
 *  Match triggers a 400 — any legitimate caller can URL-encode. */
const SQLI_QUERY_PATTERNS: RegExp[] = [
  /\b(union\s+select|select\s+.*\s+from|drop\s+table|insert\s+into|delete\s+from)\b/i,
  /(\bor\b|\band\b)\s+1\s*=\s*1/i,
  /\b(sleep|benchmark|pg_sleep)\s*\(/i,
  /\bwaitfor\s+delay\b/i,
  /--\s*[\r\n]/,
  /\/\*.*\*\//,
];

/** Headers we never expect — presence indicates an off-the-shelf scanner. */
const SUSPICIOUS_HEADERS = ["x-scanner", "x-nikto", "x-sqlmap"];

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function applyWaf(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname.toLowerCase();
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();

  // 1. Block scanner user-agents outright.
  for (const bad of BAD_USER_AGENTS) {
    if (ua.includes(bad)) {
      return reject(req, 403, "blocked-ua", bad);
    }
  }

  // 2. Suspicious scanner headers.
  for (const h of SUSPICIOUS_HEADERS) {
    if (req.headers.get(h)) {
      return reject(req, 403, "blocked-header", h);
    }
  }

  // 3. Known-scanner paths — return 404 so scanners don't learn we exist.
  for (const sub of BAD_PATH_SUBSTRINGS) {
    if (pathname.includes(sub)) {
      return reject(req, 404, "blocked-path", sub);
    }
  }

  // 4. Path traversal attempts.
  if (pathname.includes("/..") || pathname.includes("%2e%2e")) {
    return reject(req, 400, "path-traversal", pathname);
  }

  // 5. SQL-injection probes in query string.
  const qs = req.nextUrl.search;
  if (qs && qs.length > 1) {
    const decoded = safeDecode(qs);
    for (const re of SQLI_QUERY_PATTERNS) {
      if (re.test(decoded)) {
        return reject(req, 400, "sqli-probe", decoded.slice(0, 80));
      }
    }
  }

  return null;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function reject(
  req: NextRequest,
  status: number,
  rule: string,
  detail: string,
): NextResponse {
  // Structured log for later monitoring (Phase 7).
  console.warn(
    JSON.stringify({
      event: "waf.block",
      rule,
      detail,
      ip: clientIp(req),
      ua: req.headers.get("user-agent")?.slice(0, 120) ?? "",
      path: req.nextUrl.pathname,
    }),
  );
  return NextResponse.json({ error: "Forbidden" }, { status });
}
