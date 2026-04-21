import { NextRequest, NextResponse } from "next/server";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { applyRateLimit, createApiLimiter } from "@/lib/security/rate-limit";
import { detectOverlaysInHtml } from "@/lib/overlay/detect";

export const runtime = "nodejs";
export const maxDuration = 10;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = await applyRateLimit(`overlay:${ip}`, createApiLimiter());
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = urlInputSchema.safeParse((body as { url?: unknown })?.url ?? "");
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 },
    );
  }

  const url = parsed.data;
  const hostname = new URL(url).hostname;
  const dnsOk = await validateResolvedIP(hostname);
  if (!dnsOk) {
    return NextResponse.json({ error: "URL could not be resolved" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "AccessiScan-Overlay-Detector/1.0 (+https://accessiscan.app/overlay-detector)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Target returned HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL did not return HTML content" },
        { status: 415 },
      );
    }

    const html = (await res.text()).slice(0, 1_500_000);
    const result = detectOverlaysInHtml(url, html);

    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json(
      { error: `Could not fetch target URL: ${message}` },
      { status: 502 },
    );
  }
}
