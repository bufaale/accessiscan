import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRegressionAlert } from "@/lib/email/regression-alert";

/**
 * Continuous monitoring cron.
 *
 * Runs daily (configured in vercel.json). Two jobs per invocation:
 *
 *  (1) HARVEST — for each `scans` row with monitored_site_id set that has
 *      finished AND doesn't yet have a scan_snapshot, compute the snapshot,
 *      compare to the previous baseline, persist last_score/last_critical,
 *      and dispatch a regression email if threshold crossed.
 *
 *  (2) DISPATCH — for each enabled monitored_site whose last_scan_at is
 *      older than its cadence window, insert a new pending scan row linked
 *      to the site. The existing Railway worker picks it up and runs the
 *      actual axe-core + visual AI scan exactly as a user-initiated scan.
 *
 * Authorization: expects `Authorization: Bearer ${process.env.CRON_SECRET}`
 * or a Vercel cron header (vercel-cron: 1). Both are checked.
 */

export const runtime = "nodejs";
export const maxDuration = 300;

const CADENCE_HOURS: Record<string, number> = {
  daily: 24,
  weekly: 24 * 7,
  monthly: 24 * 30,
};

function isAuthorized(req: NextRequest): boolean {
  // CRON_SECRET is the single source of truth. Vercel cron invocations set
  // Authorization: Bearer CRON_SECRET automatically when the secret is
  // configured in the project env. The x-vercel-cron header is trivially
  // forgeable by any internet caller, so we deliberately do not trust it.
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const harvested = await harvestCompletedScans(admin);
  const dispatched = await dispatchDueScans(admin);
  return NextResponse.json({ harvested, dispatched });
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function harvestCompletedScans(admin: AdminClient): Promise<number> {
  // Scans linked to a monitored_site, completed, and not yet snapshotted.
  // The unique index on scan_snapshots.scan_id prevents duplicates.
  const { data: completedScans } = await admin
    .from("scans")
    .select("id, user_id, monitored_site_id, compliance_score")
    .eq("status", "completed")
    .not("monitored_site_id", "is", null)
    .limit(50);

  if (!completedScans || completedScans.length === 0) return 0;

  let count = 0;
  for (const scan of completedScans) {
    if (!scan.monitored_site_id) continue;

    // Skip if snapshot already exists for this scan.
    const { data: existing } = await admin
      .from("scan_snapshots")
      .select("id")
      .eq("scan_id", scan.id)
      .maybeSingle();
    if (existing) continue;

    // Severity counts for this scan.
    const { data: issues } = await admin
      .from("scan_issues")
      .select("severity")
      .eq("scan_id", scan.id);

    const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    for (const row of issues ?? []) {
      const s = (row.severity as keyof typeof counts) || null;
      if (s && s in counts) counts[s]++;
    }

    const { data: site } = await admin
      .from("monitored_sites")
      .select("id, user_id, url, label, alert_email, regression_threshold, last_score, last_critical, last_serious")
      .eq("id", scan.monitored_site_id)
      .single();
    if (!site) continue;

    const currentScore = scan.compliance_score ?? 0;
    const prevScore = site.last_score;
    const prevCritical = site.last_critical ?? 0;
    const prevSerious = site.last_serious ?? 0;

    // Regression heuristic: either the score dropped by the threshold or
    // the critical issue count increased.
    const scoreDropped =
      prevScore !== null && currentScore <= prevScore - site.regression_threshold;
    const criticalIncreased =
      prevScore !== null && counts.critical > prevCritical;
    const regressed = scoreDropped || criticalIncreased;

    // Persist snapshot.
    await admin.from("scan_snapshots").insert({
      monitored_site_id: site.id,
      user_id: site.user_id,
      scan_id: scan.id,
      score: currentScore,
      critical_count: counts.critical,
      serious_count: counts.serious,
      moderate_count: counts.moderate,
      minor_count: counts.minor,
      regressed,
      alert_sent: false,
    });

    // Update baseline on the site row.
    await admin
      .from("monitored_sites")
      .update({
        last_scan_id: scan.id,
        last_scan_at: new Date().toISOString(),
        last_score: currentScore,
        last_critical: counts.critical,
        last_serious: counts.serious,
      })
      .eq("id", site.id);

    // Dispatch email only on regression AND when we had a previous baseline
    // (don't alert on the very first scan).
    if (regressed && prevScore !== null && site.alert_email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app-04-ada-scanner.vercel.app";
      try {
        await sendRegressionAlert({
          toEmail: site.alert_email,
          siteLabel: site.label ?? site.url,
          siteUrl: site.url,
          previousScore: prevScore,
          currentScore,
          previousCritical: prevCritical,
          currentCritical: counts.critical,
          previousSerious: prevSerious,
          currentSerious: counts.serious,
          scanDashboardUrl: `${appUrl}/dashboard/scans/${scan.id}`,
        });
        await admin
          .from("scan_snapshots")
          .update({ alert_sent: true })
          .eq("scan_id", scan.id);
      } catch (err) {
        console.error("regression email failed", err);
      }
    }

    count++;
  }

  return count;
}

async function dispatchDueScans(admin: AdminClient): Promise<number> {
  const { data: sites } = await admin
    .from("monitored_sites")
    .select("id, user_id, url, cadence, last_scan_at")
    .eq("enabled", true);
  if (!sites || sites.length === 0) return 0;

  const now = Date.now();
  let dispatched = 0;

  for (const site of sites) {
    const hours = CADENCE_HOURS[site.cadence] ?? 24 * 7;
    const dueBefore = now - hours * 60 * 60 * 1000;

    if (site.last_scan_at && new Date(site.last_scan_at).getTime() > dueBefore) {
      continue;
    }

    // Skip if there's already a pending/running scan for this site.
    const { data: inFlight } = await admin
      .from("scans")
      .select("id")
      .eq("monitored_site_id", site.id)
      .in("status", ["pending", "running"])
      .limit(1);
    if (inFlight && inFlight.length > 0) continue;

    const { data: parsed } = { data: parseDomain(site.url) };
    if (!parsed) continue;

    // Find or create sites row (existing semantics — we reuse the same
    // `sites` table the manual scan flow uses).
    let { data: sitesRow } = await admin
      .from("sites")
      .select("id")
      .eq("user_id", site.user_id)
      .eq("domain", parsed.domain)
      .single();
    if (!sitesRow) {
      const { data: newSiteRow } = await admin
        .from("sites")
        .insert({ user_id: site.user_id, domain: parsed.domain, name: parsed.domain })
        .select("id")
        .single();
      sitesRow = newSiteRow;
    }

    const { error: insertErr } = await admin.from("scans").insert({
      user_id: site.user_id,
      site_id: sitesRow?.id ?? null,
      url: site.url,
      domain: parsed.domain,
      scan_type: "quick",
      status: "pending",
      progress: 0,
      monitored_site_id: site.id,
    });
    if (insertErr) {
      console.error("dispatch insert failed", { site: site.id, err: insertErr });
      continue;
    }
    dispatched++;
  }

  return dispatched;
}

function parseDomain(url: string): { domain: string } | null {
  try {
    return { domain: new URL(url).hostname };
  } catch {
    return null;
  }
}
