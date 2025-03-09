
/**
 * Extract insights from paragraphs containing specific keywords
 */
export function identifyInsightsByKeywords(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Keywords that often indicate insights
  const insightKeywords = [
    "important", "key", "significant", "essential", "critical",
    "remember", "note", "consider", "insight", "reflection",
    "takeaway", "lesson", "understand", "realize", "practice"
  ];
  
  // Check each paragraph for insight keywords
  paragraphs.forEach(paragraph => {
    const lowerPara = paragraph.toLowerCase();
    
    // If the paragraph contains any insight keywords, add it as an insight
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
