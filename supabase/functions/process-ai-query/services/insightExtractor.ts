
/**
 * Service for extracting insights from AI responses
 */

/**
 * Extract insights from AI response text
 * 
 * @param text The AI response text
 * @returns Array of extracted insights
 */
export function extractInsights(text: string): any[] {
  const insights = [];
  
  // Look for explicit insights section
  const insightsMatch = text.match(
    /(?:key insights?|key takeaways?|important points?):?\s*(?:\n|$)((?:.+\n?)+)/i
  );
  
  if (insightsMatch) {
    const insightsSection = insightsMatch[1];
    const bulletPoints = insightsSection
      .split(/\n+/)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 10);
    
    if (bulletPoints.length > 0) {
      // Extract insights from bullet points
      bulletPoints.forEach(point => {
        insights.push({
          text: point,
          type: 'explicit',
          confidence: 0.9
        });
      });
      
      // Return if we found explicit insights
      return insights;
    }
  }
  
  // Extract paragraphs as insights if no explicit insights
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30);
  
  if (paragraphs.length > 0) {
    // Use first few paragraphs as insights
    paragraphs.slice(0, 3).forEach(paragraph => {
      // Trim paragraph to a reasonable length
      const trimmedInsight = paragraph.length > 150 
        ? paragraph.substring(0, 147) + '...'
        : paragraph;
      
      insights.push({
        text: trimmedInsight,
        type: 'implicit',
        confidence: 0.7
      });
    });
  }
  
  return insights;
}

/**
 * Extract actionable guidance from text
 * 
 * @param text Text to analyze
 * @returns Array of actionable items
 */
export function extractActionableGuidance(text: string): string[] {
  const actions = [];
  
  // Look for action verbs at start of sentences
  const actionVerbs = [
    'try', 'practice', 'meditate', 'focus', 'breathe', 'visualize',
    'imagine', 'create', 'start', 'begin', 'consider', 'reflect'
  ];
  
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    
    // Check if sentence starts with an action verb
    const startsWithActionVerb = actionVerbs.some(verb => 
      new RegExp(`^${verb}\\b`, 'i').test(trimmedSentence)
    );
    
    if (startsWithActionVerb && trimmedSentence.length < 150) {
      actions.push(trimmedSentence);
    }
  });
  
  return actions.slice(0, 3); // Limit to 3 actionable items
}
