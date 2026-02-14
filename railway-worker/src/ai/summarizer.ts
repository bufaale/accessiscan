import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface IssueSummary {
  ruleId: string;
  severity: string;
  description: string;
  wcagLevel: string | null;
  count: number;
}

export interface Recommendation {
  priority: number;
  title: string;
  impact: string;
  description: string;
  fix: string;
}

export async function generateAiSummary(data: {
  url: string;
  complianceScore: number;
  levelAScore: number;
  levelAAScore: number;
  levelAAAScore: number;
  issues: IssueSummary[];
}): Promise<{ summary: string; recommendations: Recommendation[] }> {
  try {
    const issuesList = data.issues
      .slice(0, 20)
      .map(
        (i) =>
          `- [${i.severity}] ${i.ruleId} (WCAG ${i.wcagLevel || "N/A"}): ${i.description} (${i.count} instances)`,
      )
      .join("\n");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an accessibility expert. Analyze these WCAG compliance scan results and provide an executive summary and recommendations.

URL: ${data.url}
Overall Compliance Score: ${data.complianceScore}/100
Level A Score: ${data.levelAScore}/100
Level AA Score: ${data.levelAAScore}/100
Level AAA Score: ${data.levelAAAScore}/100

Top Issues Found:
${issuesList}

Respond in JSON format:
{
  "summary": "2-3 sentence executive summary of the compliance state and most critical issues",
  "recommendations": [
    {
      "priority": 1,
      "title": "Short title",
      "impact": "high/medium/low",
      "description": "What to fix and why",
      "fix": "Specific code or action to take"
    }
  ]
}

Provide exactly 5 recommendations, ordered by priority (most critical first). Focus on actionable WCAG fixes.`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || "Unable to generate summary.",
      recommendations: (parsed.recommendations || []).slice(0, 5),
    };
  } catch (error) {
    console.error("AI summary failed:", error);
    return {
      summary: `This site scored ${data.complianceScore}/100 on WCAG compliance. Review the issues below for specific accessibility problems to fix.`,
      recommendations: [],
    };
  }
}

export async function generateFixSuggestions(
  issues: Array<{ ruleId: string; description: string; htmlSnippet: string; helpUrl: string }>,
): Promise<Map<string, string>> {
  const fixes = new Map<string, string>();

  // Group by ruleId to batch similar issues
  const grouped = new Map<string, typeof issues>();
  for (const issue of issues) {
    if (!grouped.has(issue.ruleId)) grouped.set(issue.ruleId, []);
    grouped.get(issue.ruleId)!.push(issue);
  }

  // Generate fix per unique rule (max 15 to control costs)
  const rules = Array.from(grouped.entries()).slice(0, 15);

  for (const [ruleId, ruleIssues] of rules) {
    try {
      const examples = ruleIssues
        .slice(0, 3)
        .map((i) => i.htmlSnippet)
        .join("\n---\n");

      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `You are an accessibility expert. This HTML fails the "${ruleId}" WCAG rule: ${ruleIssues[0].description}

Failing HTML examples:
${examples}

Provide a concise fix suggestion (1-3 sentences) with a corrected code example. Be specific and actionable. Response should be plain text, not JSON.`,
          },
        ],
      });

      const fix = response.content[0].type === "text" ? response.content[0].text : "";
      fixes.set(ruleId, fix.trim());
    } catch (error) {
      console.error(`Fix generation failed for ${ruleId}:`, error);
    }
  }

  return fixes;
}
