
/**
 * Extract list items from text as insights
 * @param text The AI response text to analyze
 * @returns Array of extracted list items as insights
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  const insights: { type: string; content: string }[] = [];
  
  // Match markdown list items (both - and * formats)
  const listItemRegex = /(?:^|\n)((?:[*\-] .+(?:\n(?![\-*]).+)*)+)/g;
  const matches = text.matchAll(listItemRegex);
  
  // Process each list item match
  for (const match of matches) {
    const listContent = match[1].trim();
    
    // Skip very short list items
    if (listContent.length < 15) continue;
    
    // Determine the insight type based on content
    const insightType = determineInsightType(listContent);
    
    insights.push({
      type: insightType,
      content: listContent
    });
  }
  
  return insights;
}

/**
 * Determine insight type based on content keywords
 */
function determineInsightType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (/(emotion|feel|feeling|emotional|mood)/i.test(lowerContent)) {
    return 'emotional';
  }
  
  if (/(chakra|energy center|root|sacral|solar plexus|heart|throat|third eye|crown)/i.test(lowerContent)) {
    return 'chakra';
  }
  
  if (/(practice|meditat|exercise|technique|routine|breathe|breathing)/i.test(lowerContent)) {
    return 'practice';
  }
  
  if (/(aware|conscious|mindful|awaken|perspective)/i.test(lowerContent)) {
    return 'awareness';
  }
  
  return 'general';
}
