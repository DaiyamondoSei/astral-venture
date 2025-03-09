
/**
 * Extract insights from numbered or bulleted lists in text
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  
  // Regular expression to match numbered or bulleted list items
  const listItemRegex = /(?:^|\n)(?:\d+\.\s|\*\s|-\s)(.+)(?:\n|$)/g;
  let match;
  
  // Find all list items in the text
  while ((match = listItemRegex.exec(text)) !== null) {
    const content = match[1].trim();
    
    // Only add unique items
    if (!insights.some(i => i.content === content)) {
      insights.push({
        type: "point",
        content
      });
    }
  }
  
  return insights;
}
