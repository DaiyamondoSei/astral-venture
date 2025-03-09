
/**
 * Extract insights from an AI response
 */
export function extractInsights(text: string): any[] {
  const insights = [];
  
  // Look for patterns that might indicate insights
  // 1. Numbered or bulleted lists
  const listItemRegex = /(?:^|\n)(?:\d+\.\s|\*\s|-\s)(.+)(?:\n|$)/g;
  let match;
  while ((match = listItemRegex.exec(text)) !== null) {
    insights.push({
      type: "point",
      content: match[1].trim()
    });
  }
  
  // 2. Look for paragraphs that contain insight-like keywords
  const paragraphs = text.split(/\n\n+/);
  const insightKeywords = [
    "important", "key", "significant", "essential", "critical",
    "remember", "note", "consider", "insight", "reflection"
  ];
  
  paragraphs.forEach(paragraph => {
    const lowerPara = paragraph.toLowerCase();
    if (insightKeywords.some(keyword => lowerPara.includes(keyword))) {
      if (!insights.some(i => i.content === paragraph.trim())) {
        insights.push({
          type: "paragraph",
          content: paragraph.trim()
        });
      }
    }
  });
  
  return insights;
}
