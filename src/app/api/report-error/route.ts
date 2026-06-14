import { NextRequest, NextResponse } from "next/server";
import { rlAllowed, clientIpKey } from "@/lib/security/supabase-rate-limit";

export async function POST(request: NextRequest) {
  // Unauthenticated outbound-webhook amplifier — throttle it. 10/min/IP.
  if (!(await rlAllowed(clientIpKey(request, "reporterr"), 10, 60))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = process.env.PILOTDECK_ERROR_WEBHOOK_URL;
  const secret = process.env.PILOTDECK_ERROR_SECRET;
  if (!url || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        app_slug: process.env.APP_SLUG || "unknown",
        type: body.type || "client",
        message: body.message || "Unknown error",
        stack: body.stack?.slice(0, 4000),
        routePath: body.url,
        routeType: "page",
        method: "GET",
        url: body.url,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
