import { createClient } from "@supabase/supabase-js";
import { getPageWithBrowser, captureScreenshot, closeBrowser } from "./crawler/browser.js";
import { runAxe, type AxeResults, type AxeViolation } from "./scanner/axe-runner.js";
import { analyzeVisualAccessibility, type VisualIssue } from "./ai/visual-analyzer.js";
import { getWcagLevel, getSeverityOrder } from "./scanner/wcag-mapper.js";
import { calculateScores, type ScanScores } from "./scanner/scorer.js";
import { extractInternalLinks } from "./scanner/link-extractor.js";
import { generateAiSummary, generateFixSuggestions } from "./ai/summarizer.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface PendingScan {
  id: string;
  url: string;
  domain: string;
  user_id: string;
  scan_type: "quick" | "deep";
}

async function updateScan(scanId: string, updates: Record<string, any>) {
  const { error } = await supabase.from("scans").update(updates).eq("id", scanId);
  if (error) console.error(`Failed to update scan ${scanId}:`, error.message);
}

async function getProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("subscription_plan").eq("id", userId).single();
  return data;
}

interface ProcessedIssue {
  wcag_level: string | null;
  severity: string;
  impact: string;
  rule_id: string;
  rule_description: string;
  help_url: string;
  html_snippet: string;
  selector: string;
  page_url: string;
  fix_suggestion: string | null;
  position: number;
}

function processAxeResults(results: AxeResults, pageUrl: string): ProcessedIssue[] {
  const issues: ProcessedIssue[] = [];
  let position = 0;

  for (const violation of results.violations) {
    const wcagLevel = getWcagLevel(violation.tags);
    for (const node of violation.nodes) {
      issues.push({
        wcag_level: wcagLevel,
        severity: violation.impact,
        impact: violation.help,
        rule_id: violation.id,
        rule_description: violation.description,
        help_url: violation.helpUrl,
        html_snippet: node.html.substring(0, 500),
        selector: node.target.join(", "),
        page_url: pageUrl,
        fix_suggestion: null,
        position: position++,
      });
    }
  }

  // Sort by severity
  issues.sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity));
  issues.forEach((issue, i) => (issue.position = i));

  return issues;
}

async function processQuickScan(scan: PendingScan) {
  // 1. Load page (0-20%)
  console.log(`[${scan.id}] Loading page: ${scan.url}`);
  await updateScan(scan.id, { status: "crawling", progress: 10 });
  const { page, html, loadTime } = await getPageWithBrowser(scan.url);
  await updateScan(scan.id, { progress: 20 });
  console.log(`[${scan.id}] Page loaded in ${loadTime}ms`);

  // 2. Run axe-core + capture screenshot (20-60%)
  console.log(`[${scan.id}] Running axe-core analysis...`);
  const axeResults = await runAxe(page);

  // Capture screenshot for visual AI analysis (before closing page)
  let screenshot: Buffer | null = null;
  try {
    screenshot = await captureScreenshot(page);
    console.log(`[${scan.id}] Screenshot captured (${Math.round(screenshot.length / 1024)}KB)`);
  } catch (err: any) {
    console.error(`[${scan.id}] Screenshot capture failed:`, err.message);
  }
  await page.close();
  await updateScan(scan.id, { progress: 60 });
  console.log(
    `[${scan.id}] axe-core complete: ${axeResults.violations.length} rules violated, ${axeResults.passes.length} rules passed`,
  );

  // 3. Process results (60-75%)
  const scores = calculateScores(axeResults);
  const issues = processAxeResults(axeResults, scan.url);
  await updateScan(scan.id, { status: "analyzing", progress: 75 });
  console.log(
    `[${scan.id}] Score: ${scores.overall}/100 (A:${scores.levelA} AA:${scores.levelAA} AAA:${scores.levelAAA})`,
  );

  // 4. AI analysis (75-95%) — paid only
  const profile = await getProfile(scan.user_id);
  let aiSummary: string | null = null;
  let aiRecommendations: any[] | null = null;

  if (profile?.subscription_plan && profile.subscription_plan !== "free") {
    console.log(`[${scan.id}] Generating AI analysis...`);
    await updateScan(scan.id, { progress: 80 });

    // Generate summary
    const issueSummaries = summarizeIssues(axeResults);
    const { summary, recommendations } = await generateAiSummary({
      url: scan.url,
      complianceScore: scores.overall,
      levelAScore: scores.levelA,
      levelAAScore: scores.levelAA,
      levelAAAScore: scores.levelAAA,
      issues: issueSummaries,
    });
    aiSummary = summary;
    aiRecommendations = recommendations;
    await updateScan(scan.id, { progress: 85 });

    // Generate per-rule fix suggestions
    const uniqueIssues = getUniqueIssuesForFixes(issues);
    const fixes = await generateFixSuggestions(uniqueIssues);

    // Apply fixes to issues
    for (const issue of issues) {
      if (fixes.has(issue.rule_id)) {
        issue.fix_suggestion = fixes.get(issue.rule_id)!;
      }
    }
    await updateScan(scan.id, { progress: 95 });
    console.log(`[${scan.id}] AI analysis complete`);
  } else {
    await updateScan(scan.id, { progress: 95 });
  }

  // 5. Visual AI Analysis (paid only, after text AI)
  let visualScore: number | null = null;
  let visualIssuesCount = 0;
  let visualAiSummary: string | null = null;
  let visualIssues: VisualIssue[] = [];

  if (profile?.subscription_plan && profile.subscription_plan !== "free" && screenshot) {
    console.log(`[${scan.id}] Running Visual AI analysis...`);
    const visualResult = await analyzeVisualAccessibility(screenshot, scan.url);
    visualScore = visualResult.overall_visual_score;
    visualIssuesCount = visualResult.issues.length;
    visualAiSummary = visualResult.summary;
    visualIssues = visualResult.issues;
    console.log(`[${scan.id}] Visual AI complete: ${visualIssuesCount} visual issues, score ${visualScore}/100`);
  }

  // 6. Save results (95-100%)
  // Insert code issues in batches of 50
  for (let i = 0; i < issues.length; i += 50) {
    const batch = issues.slice(i, i + 50).map((issue) => ({
      scan_id: scan.id,
      ...issue,
    }));
    const { error } = await supabase.from("scan_issues").insert(batch);
    if (error) console.error(`[${scan.id}] Failed to insert issues batch:`, error.message);
  }

  // Insert visual issues
  if (visualIssues.length > 0) {
    const visualBatch = visualIssues.map((issue, idx) => ({
      scan_id: scan.id,
      category: issue.category,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      wcag_criteria: issue.wcag_criteria,
      location: issue.location,
      recommendation: issue.recommendation,
      position: idx,
    }));
    const { error } = await supabase.from("scan_visual_issues").insert(visualBatch);
    if (error) console.error(`[${scan.id}] Failed to insert visual issues:`, error.message);
  }

  await updateScan(scan.id, {
    status: "completed",
    progress: 100,
    pages_scanned: 1,
    compliance_score: scores.overall,
    level_a_score: scores.levelA,
    level_aa_score: scores.levelAA,
    level_aaa_score: scores.levelAAA,
    total_issues: scores.totalIssues,
    critical_count: scores.criticalCount,
    serious_count: scores.seriousCount,
    moderate_count: scores.moderateCount,
    minor_count: scores.minorCount,
    ai_summary: aiSummary,
    ai_recommendations: aiRecommendations,
    visual_score: visualScore,
    visual_issues_count: visualIssuesCount,
    visual_ai_summary: visualAiSummary,
    raw_data: {
      violations: axeResults.violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
    },
    completed_at: new Date().toISOString(),
  });

  console.log(`[${scan.id}] Quick scan complete! Code: ${scores.overall}/100, Visual: ${visualScore ?? "N/A"}/100`);
}

async function processDeepScan(scan: PendingScan) {
  // 1. Load main page (0-10%)
  console.log(`[${scan.id}] Deep scan starting: ${scan.url}`);
  await updateScan(scan.id, { status: "crawling", progress: 5 });
  const { page: mainPage, html, loadTime } = await getPageWithBrowser(scan.url);

  // 2. Run axe on main page + extract links + screenshot (10-15%)
  const mainAxe = await runAxe(mainPage);

  // Capture screenshot of main page for visual AI
  let screenshot: Buffer | null = null;
  try {
    screenshot = await captureScreenshot(mainPage);
    console.log(`[${scan.id}] Main page screenshot captured (${Math.round(screenshot.length / 1024)}KB)`);
  } catch (err: any) {
    console.error(`[${scan.id}] Screenshot capture failed:`, err.message);
  }
  await mainPage.close();
  await updateScan(scan.id, { progress: 15 });

  const internalLinks = extractInternalLinks(html, scan.url);
  const pagesToScan = [scan.url, ...internalLinks]; // Up to 10 total
  console.log(
    `[${scan.id}] Found ${internalLinks.length} internal links, scanning ${pagesToScan.length} pages total`,
  );

  // Insert scan_pages records
  const pageRecords = pagesToScan.map((url) => ({
    scan_id: scan.id,
    url,
    status: url === scan.url ? "completed" : "pending",
    issue_count: 0,
    score: null,
  }));
  await supabase.from("scan_pages").insert(pageRecords);

  // 3. Process all pages (15-60%)
  const allResults: { url: string; results: AxeResults }[] = [{ url: scan.url, results: mainAxe }];

  const progressPerPage = 45 / pagesToScan.length; // Distribute 15-60% across pages

  for (let i = 1; i < pagesToScan.length; i++) {
    const pageUrl = pagesToScan[i];
    try {
      console.log(`[${scan.id}] Scanning page ${i + 1}/${pagesToScan.length}: ${pageUrl}`);
      await supabase.from("scan_pages").update({ status: "scanning" }).eq("scan_id", scan.id).eq("url", pageUrl);

      const { page, loadTime: lt } = await getPageWithBrowser(pageUrl);
      const pageAxe = await runAxe(page);
      await page.close();

      allResults.push({ url: pageUrl, results: pageAxe });

      const pageScores = calculateScores(pageAxe);
      const pageIssueCount = pageScores.totalIssues;
      await supabase
        .from("scan_pages")
        .update({
          status: "completed",
          issue_count: pageIssueCount,
          score: pageScores.overall,
        })
        .eq("scan_id", scan.id)
        .eq("url", pageUrl);
    } catch (error: any) {
      console.error(`[${scan.id}] Failed to scan ${pageUrl}:`, error.message);
      await supabase.from("scan_pages").update({ status: "failed" }).eq("scan_id", scan.id).eq("url", pageUrl);
    }

    await updateScan(scan.id, { progress: Math.round(15 + progressPerPage * (i + 1)) });
  }

  // Update main page's scan_pages record
  const mainScores = calculateScores(mainAxe);
  await supabase
    .from("scan_pages")
    .update({
      issue_count: mainScores.totalIssues,
      score: mainScores.overall,
    })
    .eq("scan_id", scan.id)
    .eq("url", scan.url);

  // 4. Aggregate results (60-75%)
  await updateScan(scan.id, { status: "analyzing", progress: 65 });

  // Combine all issues from all pages
  let allIssues: ProcessedIssue[] = [];
  for (const { url, results } of allResults) {
    const pageIssues = processAxeResults(results, url);
    allIssues.push(...pageIssues);
  }

  // Deduplicate: same rule_id + same selector on different pages → keep both but mark page_url
  // Same rule_id + same selector on same page → keep one
  const seen = new Set<string>();
  const deduped: ProcessedIssue[] = [];
  for (const issue of allIssues) {
    const key = `${issue.rule_id}|${issue.selector}|${issue.page_url}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(issue);
    }
  }
  deduped.sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity));
  deduped.forEach((issue, i) => (issue.position = i));

  // Calculate aggregate scores from all results combined
  const combinedViolations = allResults.flatMap((r) => r.results.violations);
  const combinedPasses = allResults.flatMap((r) => r.results.passes);
  const aggregateResults: AxeResults = {
    violations: combinedViolations,
    passes: combinedPasses,
    incomplete: [],
    inapplicable: [],
  };
  const aggregateScores = calculateScores(aggregateResults);

  await updateScan(scan.id, { progress: 75 });

  // 5. AI analysis (75-95%) — paid only
  const profile = await getProfile(scan.user_id);
  let aiSummary: string | null = null;
  let aiRecommendations: any[] | null = null;

  if (profile?.subscription_plan && profile.subscription_plan !== "free") {
    console.log(`[${scan.id}] Generating AI analysis for deep scan...`);
    await updateScan(scan.id, { progress: 80 });

    const issueSummaries = summarizeIssuesFromProcessed(deduped);
    const { summary, recommendations } = await generateAiSummary({
      url: scan.url,
      complianceScore: aggregateScores.overall,
      levelAScore: aggregateScores.levelA,
      levelAAScore: aggregateScores.levelAA,
      levelAAAScore: aggregateScores.levelAAA,
      issues: issueSummaries,
    });
    aiSummary = summary;
    aiRecommendations = recommendations;
    await updateScan(scan.id, { progress: 85 });

    const uniqueIssues = getUniqueIssuesForFixes(deduped);
    const fixes = await generateFixSuggestions(uniqueIssues);
    for (const issue of deduped) {
      if (fixes.has(issue.rule_id)) {
        issue.fix_suggestion = fixes.get(issue.rule_id)!;
      }
    }
    await updateScan(scan.id, { progress: 95 });
  } else {
    await updateScan(scan.id, { progress: 95 });
  }

  // 6. Visual AI Analysis (paid only, after text AI)
  let visualScore: number | null = null;
  let visualIssuesCount = 0;
  let visualAiSummary: string | null = null;
  let visualIssues: VisualIssue[] = [];

  if (profile?.subscription_plan && profile.subscription_plan !== "free" && screenshot) {
    console.log(`[${scan.id}] Running Visual AI analysis on main page...`);
    const visualResult = await analyzeVisualAccessibility(screenshot, scan.url);
    visualScore = visualResult.overall_visual_score;
    visualIssuesCount = visualResult.issues.length;
    visualAiSummary = visualResult.summary;
    visualIssues = visualResult.issues;
    console.log(`[${scan.id}] Visual AI complete: ${visualIssuesCount} visual issues, score ${visualScore}/100`);
  }

  // 7. Save results (95-100%)
  for (let i = 0; i < deduped.length; i += 50) {
    const batch = deduped.slice(i, i + 50).map((issue) => ({
      scan_id: scan.id,
      ...issue,
    }));
    await supabase.from("scan_issues").insert(batch);
  }

  // Insert visual issues
  if (visualIssues.length > 0) {
    const visualBatch = visualIssues.map((issue, idx) => ({
      scan_id: scan.id,
      category: issue.category,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      wcag_criteria: issue.wcag_criteria,
      location: issue.location,
      recommendation: issue.recommendation,
      position: idx,
    }));
    const { error } = await supabase.from("scan_visual_issues").insert(visualBatch);
    if (error) console.error(`[${scan.id}] Failed to insert visual issues:`, error.message);
  }

  await updateScan(scan.id, {
    status: "completed",
    progress: 100,
    pages_scanned: allResults.length,
    compliance_score: aggregateScores.overall,
    level_a_score: aggregateScores.levelA,
    level_aa_score: aggregateScores.levelAA,
    level_aaa_score: aggregateScores.levelAAA,
    total_issues: deduped.length,
    critical_count: aggregateScores.criticalCount,
    serious_count: aggregateScores.seriousCount,
    moderate_count: aggregateScores.moderateCount,
    minor_count: aggregateScores.minorCount,
    ai_summary: aiSummary,
    ai_recommendations: aiRecommendations,
    visual_score: visualScore,
    visual_issues_count: visualIssuesCount,
    visual_ai_summary: visualAiSummary,
    raw_data: {
      pages: allResults.length,
      totalViolationRules: combinedViolations.length,
      totalPassRules: combinedPasses.length,
    },
    completed_at: new Date().toISOString(),
  });

  console.log(
    `[${scan.id}] Deep scan complete! ${allResults.length} pages, code: ${aggregateScores.overall}/100, visual: ${visualScore ?? "N/A"}/100`,
  );
}

// Helper functions
function summarizeIssues(results: AxeResults) {
  return results.violations.map((v) => ({
    ruleId: v.id,
    severity: v.impact,
    description: v.description,
    wcagLevel: getWcagLevel(v.tags),
    count: v.nodes.length,
  }));
}

function summarizeIssuesFromProcessed(issues: ProcessedIssue[]) {
  const grouped = new Map<
    string,
    { severity: string; description: string; wcagLevel: string | null; count: number }
  >();
  for (const issue of issues) {
    if (!grouped.has(issue.rule_id)) {
      grouped.set(issue.rule_id, {
        severity: issue.severity,
        description: issue.rule_description,
        wcagLevel: issue.wcag_level,
        count: 0,
      });
    }
    grouped.get(issue.rule_id)!.count++;
  }
  return Array.from(grouped.entries()).map(([ruleId, data]) => ({ ruleId, ...data }));
}

function getUniqueIssuesForFixes(issues: ProcessedIssue[]) {
  const seen = new Set<string>();
  return issues
    .filter((i) => {
      if (seen.has(i.rule_id)) return false;
      seen.add(i.rule_id);
      return true;
    })
    .map((i) => ({
      ruleId: i.rule_id,
      description: i.rule_description,
      htmlSnippet: i.html_snippet || "",
      helpUrl: i.help_url || "",
    }));
}

// Main worker loop
async function processScan(scan: PendingScan) {
  try {
    if (scan.scan_type === "deep") {
      await processDeepScan(scan);
    } else {
      await processQuickScan(scan);
    }
  } catch (error: any) {
    console.error(`[${scan.id}] Scan failed:`, error.message);
    await updateScan(scan.id, {
      status: "failed",
      error_message: error.message || "An unexpected error occurred",
    });
  }
}

export async function startWorker() {
  console.log("ADA Scanner Worker started. Polling for scans...");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down...");
    await closeBrowser();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  while (true) {
    try {
      const { data: scans, error } = await supabase
        .from("scans")
        .select("id, url, domain, user_id, scan_type")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) {
        console.error("Poll error:", error.message);
      } else if (scans && scans.length > 0) {
        await processScan(scans[0] as PendingScan);
      }
    } catch (error: any) {
      console.error("Worker error:", error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5s
  }
}
