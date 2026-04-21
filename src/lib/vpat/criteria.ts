/**
 * WCAG 2.1 and 2.2 Level A and AA success criteria (used by VPAT 2.5, DOJ Title II,
 * Section 508 2018, and EN 301 549 v3.2.1 — the EU standard invoked by the European
 * Accessibility Act enforceable since June 28, 2025).
 *
 * Each criterion maps to the axe-core rule IDs most commonly associated with it, so we
 * can infer conformance from scan results without a human auditor.
 *
 * When no axe rule maps to a criterion, conformance defaults to "not-evaluated".
 */

export type WcagLevel = "A" | "AA" | "AAA";
export type WcagVersion = "2.1" | "2.2";

export interface WcagCriterion {
  id: string; // e.g., "1.1.1"
  title: string;
  level: WcagLevel;
  /** WCAG version this criterion was introduced in. */
  version: WcagVersion;
  /** axe-core rule IDs that indicate a failure of this criterion */
  ruleIds: string[];
}

export const WCAG_21_CRITERIA: WcagCriterion[] = [
  // Perceivable
  { id: "1.1.1", title: "Non-text Content", level: "A", version: "2.1", ruleIds: ["image-alt", "input-image-alt", "area-alt", "svg-img-alt", "object-alt", "role-img-alt"] },
  { id: "1.2.1", title: "Audio-only and Video-only (Prerecorded)", level: "A", version: "2.1", ruleIds: [] },
  { id: "1.2.2", title: "Captions (Prerecorded)", level: "A", version: "2.1", ruleIds: ["video-caption"] },
  { id: "1.2.3", title: "Audio Description or Media Alternative (Prerecorded)", level: "A", version: "2.1", ruleIds: [] },
  { id: "1.2.4", title: "Captions (Live)", level: "AA", version: "2.1", ruleIds: [] },
  { id: "1.2.5", title: "Audio Description (Prerecorded)", level: "AA", version: "2.1", ruleIds: [] },
  { id: "1.3.1", title: "Info and Relationships", level: "A", version: "2.1", ruleIds: ["list", "listitem", "definition-list", "dlitem", "heading-order", "label", "th-has-data-cells", "td-headers-attr", "table-fake-caption", "table-duplicate-name", "empty-heading", "p-as-heading"] },
  { id: "1.3.2", title: "Meaningful Sequence", level: "A", version: "2.1", ruleIds: [] },
  { id: "1.3.3", title: "Sensory Characteristics", level: "A", version: "2.1", ruleIds: [] },
  { id: "1.3.4", title: "Orientation", level: "AA", version: "2.1", ruleIds: ["css-orientation-lock"] },
  { id: "1.3.5", title: "Identify Input Purpose", level: "AA", version: "2.1", ruleIds: ["autocomplete-valid"] },
  { id: "1.4.1", title: "Use of Color", level: "A", version: "2.1", ruleIds: ["link-in-text-block"] },
  { id: "1.4.2", title: "Audio Control", level: "A", version: "2.1", ruleIds: [] },
  { id: "1.4.3", title: "Contrast (Minimum)", level: "AA", version: "2.1", ruleIds: ["color-contrast"] },
  { id: "1.4.4", title: "Resize Text", level: "AA", version: "2.1", ruleIds: ["meta-viewport"] },
  { id: "1.4.5", title: "Images of Text", level: "AA", version: "2.1", ruleIds: [] },
  { id: "1.4.10", title: "Reflow", level: "AA", version: "2.1", ruleIds: [] },
  { id: "1.4.11", title: "Non-text Contrast", level: "AA", version: "2.1", ruleIds: ["color-contrast-enhanced"] },
  { id: "1.4.12", title: "Text Spacing", level: "AA", version: "2.1", ruleIds: [] },
  { id: "1.4.13", title: "Content on Hover or Focus", level: "AA", version: "2.1", ruleIds: [] },

  // Operable
  { id: "2.1.1", title: "Keyboard", level: "A", version: "2.1", ruleIds: ["accesskeys", "frame-focusable-content"] },
  { id: "2.1.2", title: "No Keyboard Trap", level: "A", version: "2.1", ruleIds: [] },
  { id: "2.1.4", title: "Character Key Shortcuts", level: "A", version: "2.1", ruleIds: [] },
  { id: "2.2.1", title: "Timing Adjustable", level: "A", version: "2.1", ruleIds: ["meta-refresh"] },
  { id: "2.2.2", title: "Pause, Stop, Hide", level: "A", version: "2.1", ruleIds: ["blink", "marquee"] },
  { id: "2.3.1", title: "Three Flashes or Below Threshold", level: "A", version: "2.1", ruleIds: [] },
  { id: "2.4.1", title: "Bypass Blocks", level: "A", version: "2.1", ruleIds: ["bypass", "region", "skip-link", "landmark-one-main"] },
  { id: "2.4.2", title: "Page Titled", level: "A", version: "2.1", ruleIds: ["document-title"] },
  { id: "2.4.3", title: "Focus Order", level: "A", version: "2.1", ruleIds: ["tabindex"] },
  { id: "2.4.4", title: "Link Purpose (In Context)", level: "A", version: "2.1", ruleIds: ["link-name"] },
  { id: "2.4.5", title: "Multiple Ways", level: "AA", version: "2.1", ruleIds: [] },
  { id: "2.4.6", title: "Headings and Labels", level: "AA", version: "2.1", ruleIds: ["empty-heading"] },
  { id: "2.4.7", title: "Focus Visible", level: "AA", version: "2.1", ruleIds: ["focus-order-semantics"] },
  { id: "2.5.1", title: "Pointer Gestures", level: "A", version: "2.1", ruleIds: [] },
  { id: "2.5.2", title: "Pointer Cancellation", level: "A", version: "2.1", ruleIds: [] },
  { id: "2.5.3", title: "Label in Name", level: "A", version: "2.1", ruleIds: ["label-content-name-mismatch"] },
  { id: "2.5.4", title: "Motion Actuation", level: "A", version: "2.1", ruleIds: [] },

  // Understandable
  { id: "3.1.1", title: "Language of Page", level: "A", version: "2.1", ruleIds: ["html-has-lang", "html-lang-valid", "html-xml-lang-mismatch"] },
  { id: "3.1.2", title: "Language of Parts", level: "AA", version: "2.1", ruleIds: ["valid-lang"] },
  { id: "3.2.1", title: "On Focus", level: "A", version: "2.1", ruleIds: [] },
  { id: "3.2.2", title: "On Input", level: "A", version: "2.1", ruleIds: [] },
  { id: "3.2.3", title: "Consistent Navigation", level: "AA", version: "2.1", ruleIds: [] },
  { id: "3.2.4", title: "Consistent Identification", level: "AA", version: "2.1", ruleIds: [] },
  { id: "3.3.1", title: "Error Identification", level: "A", version: "2.1", ruleIds: [] },
  { id: "3.3.2", title: "Labels or Instructions", level: "A", version: "2.1", ruleIds: ["label", "form-field-multiple-labels", "label-title-only"] },
  { id: "3.3.3", title: "Error Suggestion", level: "AA", version: "2.1", ruleIds: [] },
  { id: "3.3.4", title: "Error Prevention (Legal, Financial, Data)", level: "AA", version: "2.1", ruleIds: [] },

  // Robust
  { id: "4.1.1", title: "Parsing (Obsolete and Removed)", level: "A", version: "2.1", ruleIds: ["duplicate-id", "duplicate-id-active", "duplicate-id-aria"] },
  { id: "4.1.2", title: "Name, Role, Value", level: "A", version: "2.1", ruleIds: ["aria-allowed-attr", "aria-allowed-role", "aria-command-name", "aria-hidden-body", "aria-hidden-focus", "aria-input-field-name", "aria-meter-name", "aria-progressbar-name", "aria-required-attr", "aria-required-children", "aria-required-parent", "aria-roledescription", "aria-roles", "aria-toggle-field-name", "aria-tooltip-name", "aria-valid-attr", "aria-valid-attr-value", "button-name", "select-name", "nested-interactive", "presentation-role-conflict"] },
  { id: "4.1.3", title: "Status Messages", level: "AA", version: "2.1", ruleIds: [] },

  // WCAG 2.2 additions (published W3C Recommendation, Oct 2023) — required for EN 301 549 v4 and
  // EAA. axe-core added 2.2 rule coverage in v4.8+. Criteria with no direct axe rule default to
  // "not-evaluated" and require manual review.
  { id: "2.4.11", title: "Focus Not Obscured (Minimum)", level: "AA", version: "2.2", ruleIds: [] },
  { id: "2.5.7", title: "Dragging Movements", level: "AA", version: "2.2", ruleIds: [] },
  { id: "2.5.8", title: "Target Size (Minimum)", level: "AA", version: "2.2", ruleIds: ["target-size"] },
  { id: "3.2.6", title: "Consistent Help", level: "A", version: "2.2", ruleIds: [] },
  { id: "3.3.7", title: "Redundant Entry", level: "A", version: "2.2", ruleIds: [] },
  { id: "3.3.8", title: "Accessible Authentication (Minimum)", level: "AA", version: "2.2", ruleIds: [] },
];

/**
 * All WCAG 2.1 AND 2.2 criteria combined. Used when generating EN 301 549 reports
 * or when a buyer explicitly requests WCAG 2.2 conformance (EU procurement).
 */
export const WCAG_22_CRITERIA: WcagCriterion[] = WCAG_21_CRITERIA;

/**
 * The subset that is new in WCAG 2.2 — handy when highlighting delta from a 2.1 audit.
 */
export const WCAG_22_NEW_CRITERIA: WcagCriterion[] = WCAG_21_CRITERIA.filter(
  (c) => c.version === "2.2",
);
