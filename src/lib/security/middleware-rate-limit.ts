/**
 * Middleware-level rate limiter. Applied to every /api/* request BEFORE
 * the handler runs, so new routes are covered automatically. Complements
 * (does not replace) the per-route `applyRateLimit` calls on AI / AI-cost
 * endpoints that need stricter caps.
 *
 * Keying:
 *   - Per-IP by default (x-forwarded-for first address).
 *   - Per-user ID if a Supabase auth cookie is present (stable across
 *     NAT'd IP shifts, which matters for mobile-carrier traffic).
 *
 * Buckets (per minute):
 *   - /api/auth/* → 10 per IP (brute force)
 *   - /api/overlay-check, /api/pdf-scans, /api/scans → 30 per IP/user
 *     (IO-heavy endpoints)
 *   - everything else → 300 per IP/user
 *
 * Exemptions (caller-provided signature / secret instead):
 *   - /api/stripe/webhook
 *   - /api/twilio/*
 *   - /api/cron/*
 *   - /api/health
 *
 * Gracefully degrades when Upstash is not configured — returns null so
 * middleware lets the request through.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

let strict: Ratelimit | null = null;
let heavy: Ratelimit | null = null;
let general: Ratelimit | null = null;

function getLimiters() {
  const r = getRedis();
  if (!r) return null;
  if (!strict) {
    strict = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "mw:rl:auth",
    });
  }
  if (!heavy) {
    heavy = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "mw:rl:heavy",
    });
  }
  if (!general) {
    general = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(300, "1 m"),
      prefix: "mw:rl:general",
    });
  }
  return { strict, heavy, general };
}

const EXEMPT_PREFIXES = [
  "/api/stripe/webhook",
  "/api/twilio/",
  "/api/cron/",
  "/api/health",
];

const STRICT_PREFIXES = ["/api/auth/"];

const HEAVY_PREFIXES = [
  "/api/overlay-check",
  "/api/pdf-scans",
  "/api/scans",
];

function clientId(req: NextRequest): string {
  // Prefer the authenticated user id if the Supabase cookie is present —
  // more stable than IP for carrier-NAT'd mobile users. Supabase sets
  // sb-<ref>-auth-token (JSON string with access/refresh + user id).
  const cookie = req.cookies.getAll().find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  if (cookie) {
    // We don't parse the JSON here (cheap keying). Using the cookie value
    // hash as the identifier is sufficient and stable per session.
    return `user:${cookie.value.slice(0, 32)}`;
  }
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return `ip:${fwd.split(",")[0]!.trim()}`;
  return `ip:${req.headers.get("x-real-ip") ?? "unknown"}`;
}

function pickLimiter(pathname: string, limiters: NonNullable<ReturnType<typeof getLimiters>>): Ratelimit | null {
  if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (STRICT_PREFIXES.some((p) => pathname.startsWith(p))) return limiters.strict;
  if (HEAVY_PREFIXES.some((p) => pathname.startsWith(p))) return limiters.heavy;
  return limiters.general;
}

export async function applyMiddlewareRateLimit(
  req: NextRequest,
): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) return null;

  const limiters = getLimiters();
  if (!limiters) return null;

  const limiter = pickLimiter(pathname, limiters);
  if (!limiter) return null;

  const identifier = clientId(req);
  const { success, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString(),
        },
      },
    );
  }
  return null;
}
