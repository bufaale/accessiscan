// Auto-Fix patch generator. Phase 1: alt-text + ARIA labels only.
//
// Each fixer takes a WCAG violation + the source HTML and returns a patched
// version of the HTML with ONE attribute added/changed. We never restructure
// markup — that's Phase 2 territory and needs human review every time.
//
// Pattern: dispatch on `rule_id`. Unknown rules return `null` so the caller
// can mark them as "needs human review" in the PR description.

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs";

export interface PatchInput {
  rule_id: string;          // axe rule, e.g. "image-alt"
  selector: string;         // CSS selector for the element
  html_snippet: string;     // the offending HTML element + 3 lines of surrounding context
  page_url: string;
  wcag_sc?: string;         // e.g. "1.1.1"
  rule_description?: string;
  // For image-alt only: the resolved image URL so Claude Vision can describe it.
  image_url?: string;
}

export interface PatchResult {
  patched_html: string;
  summary: string;          // 1-line "Added alt='Hero image of...'" etc.
  needs_human_review: boolean;
  reason?: string;          // when needs_human_review is true
}

function client() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

const SAFE_RULES = new Set([
  "image-alt",
  "label",
  "form-field-multiple-labels",
  "link-name",
  "button-name",
  "html-has-lang",
  "html-lang-valid",
  "meta-viewport",
]);

export function isSafeRule(rule_id: string): boolean {
  return SAFE_RULES.has(rule_id);
}

const SYSTEM_PROMPT = `You are an expert web accessibility engineer. Generate a minimal, surgical patch that fixes one specific WCAG violation in an HTML snippet.

Output strict JSON only, no prose:
{
  "patched_html": "the full snippet with the fix applied",
  "summary": "one-line description of the change for the PR description",
  "needs_human_review": false,
  "reason": null
}

If the fix would require restructuring the element (more than adding/changing one attribute), set needs_human_review=true and explain in reason. Examples that need review: re-leveling headings, wrapping content in landmarks, refactoring custom widgets, fixing a color-contrast violation that requires new tokens.

CONSTRAINTS:
- Change ONLY the offending element. Preserve all existing attributes.
- Do not change indentation. Preserve exact whitespace outside the changed attribute.
- Do not add comments to the HTML.
- For accessibility text content (alt, aria-label), be concise (under 100 chars), informative, and avoid filler phrases like "image of", "click here", "link to".`;

function buildUserPrompt(input: PatchInput): string {
  return [
    `Rule: ${input.rule_id}`,
    `WCAG SC: ${input.wcag_sc ?? "(not provided)"}`,
    `Description: ${input.rule_description ?? "(not provided)"}`,
    `Element selector: ${input.selector}`,
    `Page URL: ${input.page_url}`,
    ``,
    `CURRENT HTML:`,
    "```html",
    input.html_snippet,
    "```",
    ``,
    rulePromptHint(input),
  ].join("\n");
}

function rulePromptHint(input: PatchInput): string {
  switch (input.rule_id) {
    case "image-alt":
      return [
        `The image is at URL: ${input.image_url ?? "(not extracted from snippet)"}`,
        `Generate an alt attribute that describes the image's content and purpose. Be concise (under 100 chars). Avoid "image of", "picture of", or redundant phrasing. If the image is decorative (icon next to a text label, background flourish), use alt="" so screen readers skip it.`,
      ].join("\n");
    case "label":
    case "form-field-multiple-labels":
      return `Generate an aria-label attribute that describes what the user should enter. Use surrounding placeholder text, label-like elements nearby, and button context to infer the field's purpose.`;
    case "link-name":
      return `The link has no accessible name. Either inject text content between the tags OR add an aria-label attribute. Prefer adding text content if the visible context allows it (icon-only links should get aria-label that describes the action).`;
    case "button-name":
      return `Same as link-name: inject visible text or add aria-label describing what the button does.`;
    case "html-has-lang":
    case "html-lang-valid":
      return `Add lang="en" to the <html> tag. If the page has obvious indicators of another language (hreflang tags, content excerpts), use that BCP-47 tag instead.`;
    case "meta-viewport":
      return `Add or fix the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">. Do not include user-scalable=no — that violates WCAG 1.4.4.`;
    default:
      return `(no specific guidance for this rule — apply best judgment)`;
  }
}

export async function generatePatch(input: PatchInput): Promise<PatchResult> {
  if (!isSafeRule(input.rule_id)) {
    return {
      patched_html: input.html_snippet,
      summary: `Rule ${input.rule_id} requires human review (Phase 1 only ships safe rules)`,
      needs_human_review: true,
      reason: `Phase 1 supports: ${[...SAFE_RULES].join(", ")}. Rule ${input.rule_id} not in this list.`,
    };
  }

  const messages: MessageParam[] = [
    { role: "user", content: buildUserPrompt(input) },
    { role: "assistant", content: "{" }, // prefill — guarantees JSON-shape response
  ];

  // For image-alt with a URL, send the image to Claude Vision.
  if (input.rule_id === "image-alt" && input.image_url) {
    try {
      const fetched = await fetch(input.image_url, { redirect: "follow" });
      if (fetched.ok) {
        const buf = Buffer.from(await fetched.arrayBuffer());
        const sizeMB = buf.length / (1024 * 1024);
        if (sizeMB <= 4) {
          const contentType = fetched.headers.get("content-type") || "image/jpeg";
          if (/^image\/(jpeg|png|gif|webp)$/.test(contentType)) {
            messages[0] = {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: contentType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                    data: buf.toString("base64"),
                  },
                },
                { type: "text", text: buildUserPrompt(input) },
              ],
            };
          }
        }
      }
    } catch {
      // Image fetch failed — fall through to text-only prompt. Claude will
      // still generate a reasonable alt from the surrounding HTML context.
    }
  }

  const response = await client().messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response had no text block");
  }
  const jsonText = "{" + textBlock.text;
  const jsonEnd = jsonText.lastIndexOf("}");
  if (jsonEnd === -1) throw new Error("Claude response was truncated before JSON closed");
  const parsed = JSON.parse(jsonText.slice(0, jsonEnd + 1)) as PatchResult;

  // Sanity: never accept a patch that's identical to the input — that's a
  // no-op and shouldn't open a PR.
  if (parsed.patched_html === input.html_snippet && !parsed.needs_human_review) {
    return {
      ...parsed,
      needs_human_review: true,
      reason: "Claude returned the original HTML unchanged. Manual review needed.",
    };
  }

  return parsed;
}
