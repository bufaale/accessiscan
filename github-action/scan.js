#!/usr/bin/env node
/**
 * AccessiScan GitHub Action runner.
 * Loads a URL with Puppeteer, runs axe-core against it, writes a JSON report,
 * and sets GitHub Actions outputs. Exits non-zero when violations at or above
 * the configured severity threshold are present.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const SEVERITY_ORDER = ["minor", "moderate", "serious", "critical"];

async function main() {
  const url = process.env.INPUT_URL;
  const failOn = (process.env.INPUT_FAIL_ON || "serious").toLowerCase();
  const wcagLevel = (process.env.INPUT_WCAG_LEVEL || "wcag21aa").toLowerCase();

  if (!url) {
    fail("Input 'url' is required.");
  }

  const actionDir = __dirname;
  const puppeteer = require(path.join(actionDir, "node_modules", "puppeteer"));
  const { AxePuppeteer } = require(
    path.join(actionDir, "node_modules", "@axe-core/puppeteer"),
  );

  console.log(`AccessiScan: loading ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let report;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
    report = await new AxePuppeteer(page).withTags([wcagLevel]).analyze();
  } finally {
    await browser.close();
  }

  const reportPath = path.join(process.cwd(), "accessiscan-report.json");
  const payload = {
    url,
    wcagLevel,
    scannedAt: new Date().toISOString(),
    violations: report.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      tags: v.tags,
    })),
  };
  fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2));

  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of payload.violations) {
    if (v.impact && counts[v.impact] !== undefined) counts[v.impact] += 1;
  }
  const total = payload.violations.length;

  setOutput("total-violations", String(total));
  setOutput("critical", String(counts.critical));
  setOutput("serious", String(counts.serious));
  setOutput("report-path", reportPath);

  console.log(
    `AccessiScan: ${total} violations (critical: ${counts.critical}, serious: ${counts.serious}, moderate: ${counts.moderate}, minor: ${counts.minor})`,
  );

  if (failOn === "none") return;
  const threshold = SEVERITY_ORDER.indexOf(failOn);
  if (threshold < 0) {
    fail(`Invalid fail-on value: ${failOn}. Expected one of: ${SEVERITY_ORDER.join(", ")}, none.`);
  }

  const blockingCount = SEVERITY_ORDER.slice(threshold).reduce(
    (sum, sev) => sum + counts[sev],
    0,
  );

  if (blockingCount > 0) {
    console.error(
      `AccessiScan: ${blockingCount} violation(s) at or above severity "${failOn}". Failing build.`,
    );
    process.exit(1);
  }
}

function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    console.log(`::set-output name=${name}::${value}`);
    return;
  }
  fs.appendFileSync(outputFile, `${name}=${value}\n`);
}

function fail(message) {
  console.error(`AccessiScan: ${message}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("AccessiScan: scan failed");
  console.error(err);
  process.exit(1);
});
