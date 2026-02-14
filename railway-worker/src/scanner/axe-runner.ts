import { readFileSync } from "fs";
import { createRequire } from "module";
import type { Page } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");

export interface AxeResults {
  violations: AxeViolation[];
  passes: AxePass[];
  incomplete: AxeViolation[];
  inapplicable: { id: string; description: string; tags: string[] }[];
}

export interface AxeViolation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxePass {
  id: string;
  description: string;
  help: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export async function runAxe(page: Page): Promise<AxeResults> {
  // Inject axe-core script
  await page.evaluate(axeSource);

  // Run analysis with WCAG tags
  const results = await page.evaluate(`
    (async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: [
            "wcag2a",
            "wcag2aa",
            "wcag2aaa",
            "wcag21a",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ],
        },
        resultTypes: ["violations", "passes", "incomplete", "inapplicable"],
      });
    })()
  `);

  return results as AxeResults;
}
