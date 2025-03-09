
/**
 * Utility functions for creating AI prompts
 */

/**
 * Creates a prompt for extracting insights from reflections
 */
export function createInsightPrompt(): string {
  return `
Based on the user's reflection, extract the following insights:
1. Key emotional patterns or themes
2. Potential chakras that might be activated or blocked
3. Suggestions for practices that might help the user's energy flow
4. Connections to previous reflections if available
5. Growth opportunities based on the emotional content

Format these insights in a way that's supportive, encouraging and growth-oriented.
`;
}

/**
 * Creates a prompt for generating personalized practice recommendations
 */
export function createPracticeRecommendationPrompt(chakras: string[], level: number): string {
  return `
Based on the user's activated chakras (${chakras.join(', ')}) and their consciousness level (${level}), 
suggest 3-5 practices that would help them progress on their journey.

For each practice, include:
- Name of the practice
- Brief description (2-3 sentences)
- Expected benefits
- Difficulty level (1-5)
- Which chakras it primarily affects

Format the response in a supportive, encouraging voice that inspires action.
`;
}

/**
 * Creates a prompt for emotional analysis
 */
export function createEmotionalAnalysisPrompt(reflectionContent: string): string {
  return `
Analyze the following reflection for emotional patterns and consciousness insights:

"${reflectionContent}"

Identify:
1. Primary emotions expressed
2. Secondary or underlying emotions
3. Emotional intelligence indicators
4. Self-awareness level
5. Integration opportunities

Provide a compassionate analysis that helps the user understand their emotional landscape better.
`;
}
