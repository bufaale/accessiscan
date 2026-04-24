/**
 * Pilotdeck error-capture SDK snippet.
 *
 * Copy this file to any Next.js app you want tracked by Pilotdeck:
 *   cp .shared/pilotdeck-capture-sdk.ts app-XX/src/lib/pilotdeck-capture.ts
 *
 * Then set these env vars on the app's Vercel project:
 *   PILOTDECK_ERROR_WEBHOOK_URL=https://app-11-pilotdeck.vercel.app/api/webhooks/errors
 *   PILOTDECK_ERROR_SECRET=<the ERROR_WEBHOOK_SECRET set on Pilotdeck>
 *   APP_SLUG=app-XX-whatever  (matches app_registry.slug in Pilotdeck)
 *
 * Wire it in these 3 places:
 *
 * 1) Client errors — add to src/app/global-error.tsx:
 *
 *    'use client';
 *    import { captureError } from '@/lib/pilotdeck-capture';
 *    export default function GlobalError({ error }: { error: Error }) {
 *      captureError(error, { type: 'client' });
 *      return <html><body><h2>Something went wrong</h2></body></html>;
 *    }
 *
 * 2) Server errors — wrap API routes:
 *
 *    import { withPilotdeck } from '@/lib/pilotdeck-capture';
 *    export const POST = withPilotdeck(async (req) => { ... });
 *
 * 3) Unhandled promise rejections (Node runtime):
 *
 *    // in instrumentation.ts (Next.js 13+):
 *    import { registerUnhandledHandlers } from '@/lib/pilotdeck-capture';
 *    export function register() { registerUnhandledHandlers(); }
 *
 * Gracefully degrades if env vars aren't set (no-op, no errors).
 */

export interface CaptureOptions {
  type?: "server" | "client" | "client-promise";
  path?: string;
  routeType?: string;
}

function getConfig() {
  return {
    url: process.env.PILOTDECK_ERROR_WEBHOOK_URL?.trim(),
    secret: process.env.PILOTDECK_ERROR_SECRET?.trim(),
    appSlug: process.env.APP_SLUG?.trim() ?? "unknown",
  };
}

function isValidError(e: unknown): e is Error {
  return e instanceof Error;
}

/**
 * POST an error to Pilotdeck. Fire-and-forget — never throws.
 */
export async function captureError(
  error: unknown,
  opts: CaptureOptions = {},
): Promise<void> {
  const { url, secret, appSlug } = getConfig();
  if (!url || !secret) return;

  const message = isValidError(error)
    ? error.message
    : typeof error === "string"
      ? error
      : JSON.stringify(error).slice(0, 1000);
  const stack = isValidError(error) ? error.stack?.slice(0, 8000) : undefined;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        app_slug: appSlug,
        type: opts.type ?? "server",
        message,
        stack: stack ?? "",
        path: opts.path ?? "",
        routePath: opts.path ?? "",
        routeType: opts.routeType ?? "",
        method: "",
      }),
      // Don't block the response on network
      keepalive: true,
    });
  } catch {
    // Swallow — we never want error capture to break the app
  }
}

/**
 * Wrap an API route handler so any thrown error gets captured + re-thrown.
 */
export function withPilotdeck<
  TArgs extends [Request, ...unknown[]],
  TReturn,
>(
  handler: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (err) {
      let path = "";
      try {
        path = new URL(args[0].url).pathname;
      } catch {
        // no-op
      }
      void captureError(err, { type: "server", path, routeType: "api" });
      throw err;
    }
  };
}

/**
 * Node-process level handlers — call once from instrumentation.ts.
 */
export function registerUnhandledHandlers(): void {
  if (typeof process === "undefined") return;
  process.on("unhandledRejection", (reason) => {
    void captureError(reason, { type: "server", routeType: "unhandled" });
  });
  process.on("uncaughtException", (err) => {
    void captureError(err, { type: "server", routeType: "uncaught" });
  });
}
