import crypto from "crypto";

/**
 * Generate a cryptographically secure portal token.
 * 32 bytes = 256 bits of entropy. Encoded as URL-safe base64 (43 chars).
 */
export function generatePortalToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate a short-lived token for one-time actions.
 */
export function generateTimedToken(expiresInMinutes: number = 60): {
  token: string;
  expiresAt: Date;
} {
  return {
    token: crypto.randomBytes(32).toString("base64url"),
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  };
}

/**
 * Resolve the secret used to sign OAuth-style state params. We reuse
 * STATE_SIGNING_SECRET when set, otherwise fall back to SUPABASE_SERVICE_ROLE_KEY
 * which is already a high-entropy server-only secret. Never expose either to
 * the client.
 */
function getStateSecret(): string {
  const explicit = process.env.STATE_SIGNING_SECRET?.trim();
  if (explicit) return explicit;
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!fallback) {
    throw new Error("STATE_SIGNING_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback) not configured");
  }
  return fallback;
}

/**
 * Sign an arbitrary payload string with HMAC-SHA256 and return `<payload>.<sig>`
 * encoded URL-safe base64. Intended for OAuth `state` params and other
 * tamper-evident tokens that ride through third-party redirects (e.g. GitHub
 * App install callback).
 */
export function signState(payload: string): string {
  const sig = crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  return `${encodedPayload}.${sig}`;
}

/**
 * Verify a signed state produced by `signState`. Returns the original payload
 * on success, or null on any failure (malformed, tampered, wrong secret).
 * Uses timingSafeEqual to avoid signature-comparison timing leaks.
 */
export function verifyState(signed: string | null | undefined): string | null {
  if (!signed) return null;
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expectedSig = crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return payload;
}
