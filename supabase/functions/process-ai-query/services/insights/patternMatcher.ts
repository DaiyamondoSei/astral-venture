
/**
 * Extract list items from text
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  const insights = [];
  const listItemRegex = /(?:^|\n)(?:\d+\.\s|\*\s|-\s)(.+)(?:\n|$)/g;
  
  let match;
  while ((match = listItemRegex.exec(text)) !== null) {
    insights.push({
      type: "point",
      content: match[1].trim()
    });
  }
  
  return insights;
}

/**
 * Identify paragraphs containing insight keywords
 */
export function identifyInsightParagraphs(text: string): { type: string; content: string }[] {
  const insights = [];
  const paragraphs = text.split(/\n\n+/);
  const insightKeywords = [
    "important", "key", "significant", "essential", "critical",
    "remember", "note", "consider", "insight", "reflection"
  ];
  
  paragraphs.forEach(paragraph => {
    const lowerPara = paragraph.toLowerCase();
    if (insightKeywords.some(keyword => lowerPara.includes(keyword))) {
      insights.push({
        type: "paragraph",
        content: paragraph.trim()
      });
    }
  });
  
  return insights;
}
