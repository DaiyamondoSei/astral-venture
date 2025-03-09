
/**
 * Identify paragraphs containing insight keywords
 */
export function identifyInsightsByKeywords(text: string, keywords: string[] = []): { type: string; content: string }[] {
  const insights = [];
  const paragraphs = text.split(/\n\n+/);
  
  // Use default keywords if none provided
  const insightKeywords = keywords.length > 0 ? keywords : [
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
