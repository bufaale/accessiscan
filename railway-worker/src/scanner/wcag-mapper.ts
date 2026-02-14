export function getWcagLevel(tags: string[]): "A" | "AA" | "AAA" | null {
  // Check in order from most specific to least
  if (tags.some(t => /wcag2?1?a{3}$/i.test(t) || t === "wcag2aaa" || t === "wcag21aaa")) return "AAA";
  if (tags.some(t => t === "wcag2aa" || t === "wcag21aa" || t === "wcag22aa")) return "AA";
  if (tags.some(t => t === "wcag2a" || t === "wcag21a")) return "A";
  return null; // best-practice or untagged
}

export function getSeverityOrder(impact: string): number {
  switch (impact) {
    case "critical":
      return 0;
    case "serious":
      return 1;
    case "moderate":
      return 2;
    case "minor":
      return 3;
    default:
      return 4;
  }
}
