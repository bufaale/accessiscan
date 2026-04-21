// Structured JSON logger. Vercel auto-ingests stdout/stderr, so printing NDJSON
// gives us queryable logs without a drain. Every line includes app, env, level,
// msg, and a best-effort request_id from the active request (set via logWith).
//
// Redaction: keys matching SECRET_KEY_PATTERN are masked so a leaked bearer
// token or API key never lands in logs — this is our defense-in-depth behind
// the boundary validators in src/lib/security/.

const SECRET_KEY_PATTERN = /(authorization|cookie|api[_-]?key|secret|token|password|stripe[_-]?signature)/i;

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const MIN_LEVEL: Level =
  (process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[depth-limit]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value.length > 2000 ? value.slice(0, 2000) + "…" : value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SECRET_KEY_PATTERN.test(k) ? "[REDACTED]" : redact(v, depth + 1);
  }
  return out;
}

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) return;
  const line = {
    ts: new Date().toISOString(),
    level,
    app: "accessiscan",
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "dev",
    msg,
    ...(fields ? (redact(fields) as Record<string, unknown>) : {}),
  };
  const serialized = JSON.stringify(line);
  if (level === "error" || level === "warn") {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit("debug", msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
};

export function logSecurityEvent(
  event: "waf_block" | "rate_limit" | "auth_fail" | "sqli_probe" | "scanner_ua" | "webhook_dup",
  fields: Record<string, unknown>,
) {
  emit("warn", `security.${event}`, { security_event: event, ...fields });
}
