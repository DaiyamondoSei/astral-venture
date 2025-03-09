
/**
 * Extract list items from text
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  const insights = [];
  
  // Match numbered lists (1. Item)
  const numberedListRegex = /(?:^|\n)(?:\d+\.\s)(.+)(?:\n|$)/g;
  let match;
  while ((match = numberedListRegex.exec(text)) !== null) {
    insights.push({
      type: "numbered_point",
      content: match[1].trim()
    });
  }
  
  // Match bullet lists (* Item or - Item)
  const bulletListRegex = /(?:^|\n)(?:\*\s|\-\s)(.+)(?:\n|$)/g;
  while ((match = bulletListRegex.exec(text)) !== null) {
    insights.push({
      type: "bullet_point",
      content: match[1].trim()
    });
  }
  
  return insights;
}
