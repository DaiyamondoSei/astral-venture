
/**
 * Utilities for extracting insights and key points from AI responses
 */

/**
 * Extract key insights from an AI response
 * 
 * @param text The AI response text
 * @returns Array of extracted insights
 */
export function extractKeyInsights(text: string): string[] {
  // Extract paragraphs as insights
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30 && !p.startsWith('*') && !p.startsWith('#'));
  
  // Extract explicit insights if there are any
  const explicitInsightsMatch = text.match(
    /(?:key insights?|key takeaways?|important points?):?\s*(?:\n|$)((?:.+\n?)+)/i
  );
  
  if (explicitInsightsMatch) {
    const explicitInsightSection = explicitInsightsMatch[1];
    const bulletPoints = explicitInsightSection
      .split(/\n+/)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 10);
    
    if (bulletPoints.length >= 2) {
      return bulletPoints.slice(0, 5); // Limit to 5 insights
    }
  }
  
  // Fall back to paragraphs if no explicit insights found
  if (paragraphs.length > 0) {
    // Use first few paragraphs as insights
    return paragraphs
      .slice(0, 3)
      .map(p => {
        // Trim to a reasonable length for an insight
        if (p.length > 150) {
          return p.substring(0, 147) + '...';
        }
        return p;
      });
  }
  
  // If no insights could be extracted, return empty array
  return [];
}

/**
 * Extract suggested practices from an AI response
 * 
 * @param text The AI response text
 * @returns Array of suggested practices
 */
export function extractSuggestedPractices(text: string): string[] {
  // Look for explicit practice suggestions
  const practiceMatch = text.match(
    /(?:suggested practices?|recommended practices?|try these practices?|practices? to try|exercises?|techniques?):?\s*(?:\n|$)((?:.+\n?)+)/i
  );
  
  if (practiceMatch) {
    const practiceSection = practiceMatch[1];
    return practiceSection
      .split(/\n+/)
      .map(line => line.replace(/^[-•*]\s*|^\d+\.\s*/, '').trim())
      .filter(line => line.length > 10 && line.length < 100)
      .slice(0, 3); // Limit to 3 practices
  }
  
  // Look for numbered or bulleted practices throughout the text
  const bulletedPractices = [];
  const bulletRegex = /^[-•*]\s*(.+)$|^\d+\.\s*(.+)$/gm;
  let match;
  
  while ((match = bulletRegex.exec(text)) !== null) {
    const practice = (match[1] || match[2]).trim();
    if (practice.length > 10 && practice.length < 100) {
      bulletedPractices.push(practice);
    }
  }
  
  if (bulletedPractices.length > 0) {
    return bulletedPractices.slice(0, 3); // Limit to 3 practices
  }
  
  // If no practices could be extracted, return empty array
  return [];
}
