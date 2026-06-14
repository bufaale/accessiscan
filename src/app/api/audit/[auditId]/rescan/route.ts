import { NextResponse } from "next/server";
import { runRescan } from "@/lib/audit/rescan";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  try {
    const result = await runRescan(auditId, token);
    if (!result) return NextResponse.json({ error: "Invalid token or audit not found" }, { status: 401 });
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[rescan] failed", e);
    return NextResponse.json(
      { error: "Rescan failed", detail: e instanceof Error ? `${e.name}: ${e.message}` : String(e) },
      { status: 500 },
    );
  }
}
