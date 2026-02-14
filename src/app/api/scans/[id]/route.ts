import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // Get issues
  const { data: issues } = await supabase
    .from("scan_issues")
    .select("*")
    .eq("scan_id", id)
    .order("position", { ascending: true });

  // Get pages if deep scan
  let pages = null;
  if (scan.scan_type === "deep") {
    const { data: pagesData } = await supabase
      .from("scan_pages")
      .select("*")
      .eq("scan_id", id)
      .order("created_at", { ascending: true });
    pages = pagesData;
  }

  return NextResponse.json({
    ...scan,
    scan_issues: issues ?? [],
    scan_pages: pages,
  });
}
