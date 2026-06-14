/**
 * Supabase-backed rate limiter — a cross-instance limiter for public,
 * unauthenticated endpoints.
 *
 * Why this exists: the Upstash middleware limiter degrades to allow-all when
 * UPSTASH_* env vars are unset (which they are in prod), and per-route
 * in-memory Maps don't hold across Vercel's distributed serverless instances.
 * This limiter uses an atomic Postgres RPC (rl_hit) so the count is shared
 * across every instance. Use it on public endpoints that cost us money,
 * send mail, or can be brute-forced.
 *
 * Fails OPEN on infra error (a DB blip must not take a public endpoint down) —
 * catastrophic abuse is separately bounded by per-endpoint global caps.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Returns true if the request is ALLOWED (under the limit), false if it should be 429'd. */
export async function rlAllowed(key: string, max: number, windowSec: number): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_KEY) return true; // not configured → don't block
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rl_hit`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_key: key, p_max: max, p_window_sec: windowSec }),
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return true; // fail open
    const allowed = await r.json();
    return allowed === true;
  } catch {
    return true; // fail open on timeout / network error
  }
}

export function clientIpKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip") ?? "unknown";
  return `${scope}:${ip}`;
}
