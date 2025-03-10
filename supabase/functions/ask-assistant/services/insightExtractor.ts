
/**
 * Extracts key insights from an AI response
 * 
 * @param response - Raw response from the AI
 * @returns Array of extracted key insights
 */
export function extractKeyInsights(response: string): string[] {
  const insights: string[] = [];
  
  // Try to find explicit insights sections
  const insightsRegex = /key insights?:?\s*(?:\n|:)([\s\S]*?)(?:\n\n|$)/i;
  const insightsMatch = response.match(insightsRegex);
  
  if (insightsMatch && insightsMatch[1]) {
    // Extract bullet points or numbered insights
    const bulletPoints = insightsMatch[1]
      .split(/\n\s*[-•*]\s*/)
      .filter(point => point.trim().length > 0);
    
    if (bulletPoints.length > 0) {
      return bulletPoints.map(point => point.trim());
    }
    
    // Try splitting by numbered points
    const numberedPoints = insightsMatch[1]
      .split(/\n\s*\d+\.\s*/)
      .filter(point => point.trim().length > 0);
    
    if (numberedPoints.length > 0) {
      return numberedPoints.map(point => point.trim());
    }
    
    // If no bullet points or numbers, add the whole section
    insights.push(insightsMatch[1].trim());
  }
  
  // If no explicit insights section, extract key sentences
  if (insights.length === 0) {
    // Split into paragraphs
    const paragraphs = response.split(/\n\n+/);
    
    // Look for important sentences (ones that contain key phrases)
    const keyPhrases = [
      'important', 'key', 'essential', 'fundamental', 'crucial',
      'remember', 'note that', 'keep in mind', 'focus on'
    ];
    
    for (const paragraph of paragraphs) {
      // Split paragraph into sentences
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        if (keyPhrases.some(phrase => lowerSentence.includes(phrase))) {
          insights.push(sentence.trim());
        }
      }
    }
    
    // If we still have no insights, take the first sentence of each of the first 3 paragraphs
    if (insights.length === 0 && paragraphs.length > 0) {
      for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
        const firstSentence = paragraphs[i].split(/[.!?]+/)[0].trim();
        if (firstSentence.length > 20) { // Avoid very short sentences
          insights.push(firstSentence);
        }
      }
    }
  }
  
  return insights;
}

/**
 * Extracts suggested practices from an AI response
 * 
 * @param response - Raw response from the AI
 * @returns Array of extracted practice suggestions
 */
export function extractSuggestedPractices(response: string): string[] {
  const practices: string[] = [];
  
  // Try to find practices section
  const practicesRegex = /(?:recommended practices|suggested practices|practices to try|exercises|try these|here are some practices):?\s*(?:\n|:)([\s\S]*?)(?:\n\n|$)/i;
  const practicesMatch = response.match(practicesRegex);
  
  if (practicesMatch && practicesMatch[1]) {
    // Extract bullet points or numbered practices
    const bulletPoints = practicesMatch[1]
      .split(/\n\s*[-•*]\s*/)
      .filter(point => point.trim().length > 0);
    
    if (bulletPoints.length > 0) {
      return bulletPoints.map(point => point.trim());
    }
    
    // Try splitting by numbered points
    const numberedPoints = practicesMatch[1]
      .split(/\n\s*\d+\.\s*/)
      .filter(point => point.trim().length > 0);
    
    if (numberedPoints.length > 0) {
      return numberedPoints.map(point => point.trim());
    }
    
    // If no bullet points or numbers, add the whole section
    practices.push(practicesMatch[1].trim());
  }
  
  // Look for practice keywords throughout the text if no explicit section
  if (practices.length === 0) {
    const practiceKeywords = [
      'try this', 'practice', 'exercise', 'technique', 'meditation',
      'breathing', 'visualization', 'affirm', 'journal'
    ];
    
    // Split into paragraphs
    const paragraphs = response.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
      const lowerParagraph = paragraph.toLowerCase();
      if (practiceKeywords.some(keyword => lowerParagraph.includes(keyword))) {
        // Check if the paragraph is not too long
        if (paragraph.length < 200) {
          practices.push(paragraph.trim());
        } else {
          // Try to extract just the part with the practice
          const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (practiceKeywords.some(keyword => lowerSentence.includes(keyword))) {
              practices.push(sentence.trim());
            }
          }
        }
      }
    }
  }
  
  return practices;
}
