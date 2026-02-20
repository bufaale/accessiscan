import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface VisualIssue {
  category: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  title: string;
  description: string;
  wcag_criteria: string;
  location: string;
  recommendation: string;
}

export interface VisualAnalysisResult {
  issues: VisualIssue[];
  overall_visual_score: number;
  summary: string;
}

const VISUAL_ANALYSIS_PROMPT = `You are an expert accessibility auditor specializing in VISUAL accessibility analysis. You are looking at a screenshot of a web page.

Analyze this screenshot for VISUAL accessibility issues that automated code scanners CANNOT detect. Focus on:

1. **Contrast Issues**: Text overlaid on images/gradients where visual contrast is poor even if CSS values pass
2. **Text Readability**: Font sizes too small, cramped line spacing, thin font weights hard to read
3. **Touch/Click Targets**: Buttons, links, or interactive elements that appear too small (under 44x44px)
4. **Color-Only Information**: Charts, status indicators, or data conveyed only through color without text/icons
5. **Visual Hierarchy**: Heading structure that doesn't match visual prominence (big text that isn't semantic heading)
6. **Image Text**: Text embedded/baked into images that can't be read by screen readers
7. **Form Labeling**: Form fields visually far from their labels, or labels not clearly associated
8. **Spacing & Crowding**: Elements too close together, overwhelming content density
9. **Focus Indicators**: Missing or invisible focus outlines on interactive elements
10. **Animation Concerns**: Auto-playing animations, carousels, or flashing content

For each issue found, provide:
- category: one of [contrast, text-readability, touch-targets, color-only, visual-hierarchy, image-text, form-labeling, spacing, focus-indicators, animation]
- severity: critical (blocks users), serious (significant barrier), moderate (some difficulty), minor (best practice)
- title: Short descriptive title
- description: What the specific problem is
- wcag_criteria: The WCAG 2.1 success criterion (e.g., "1.4.3 Contrast (Minimum)")
- location: Where on the page (e.g., "Hero section", "Navigation bar", "Footer")
- recommendation: Specific fix suggestion

IMPORTANT:
- Only report issues you can VISUALLY confirm in the screenshot
- Do NOT report issues that code scanners already catch (missing alt text from HTML, ARIA roles, etc.)
- Focus on what a HUMAN eye would notice as accessibility barriers
- Be specific about locations - reference actual UI elements you can see
- If the page looks well-designed and accessible, report fewer issues (don't fabricate problems)

Respond in JSON format:
{
  "issues": [...],
  "overall_visual_score": <0-100 score where 100 is perfectly accessible visually>,
  "summary": "<2-3 sentence summary of visual accessibility state>"
}`;

export async function analyzeVisualAccessibility(
  screenshot: Buffer,
  url: string,
): Promise<VisualAnalysisResult> {
  try {
    const base64Image = screenshot.toString("base64");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `${VISUAL_ANALYSIS_PROMPT}\n\nURL being analyzed: ${url}`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in visual analysis response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize
    const issues: VisualIssue[] = (parsed.issues || [])
      .slice(0, 20) // Cap at 20 visual issues
      .map((issue: any) => ({
        category: issue.category || "contrast",
        severity: validateSeverity(issue.severity),
        title: (issue.title || "Visual issue").substring(0, 200),
        description: (issue.description || "").substring(0, 500),
        wcag_criteria: (issue.wcag_criteria || "").substring(0, 100),
        location: (issue.location || "Unknown").substring(0, 200),
        recommendation: (issue.recommendation || "").substring(0, 500),
      }));

    return {
      issues,
      overall_visual_score: Math.max(
        0,
        Math.min(100, Math.round(parsed.overall_visual_score || 50)),
      ),
      summary:
        (parsed.summary || "Visual analysis complete.").substring(0, 500),
    };
  } catch (error) {
    console.error("Visual AI analysis failed:", error);
    return {
      issues: [],
      overall_visual_score: 0,
      summary: "Visual AI analysis could not be completed.",
    };
  }
}

function validateSeverity(
  s: string,
): "critical" | "serious" | "moderate" | "minor" {
  if (["critical", "serious", "moderate", "minor"].includes(s)) {
    return s as "critical" | "serious" | "moderate" | "minor";
  }
  return "moderate";
}
