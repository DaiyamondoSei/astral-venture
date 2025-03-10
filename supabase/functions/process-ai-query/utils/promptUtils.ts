
/**
 * Utility functions for creating AI prompts
 */

/**
 * Create a prompt for extracting insights from reflections
 */
export function createInsightPrompt(reflectionContent: string): string {
  return `
Please analyze this personal reflection and extract meaningful insights:

REFLECTION:
${reflectionContent}

Please provide analysis on:
1. Emotional patterns
2. Potential chakra imbalances
3. Suggested practices for growth
4. Key awareness insights
`;
}

/**
 * Create a prompt for emotional analysis
 */
export function createEmotionalAnalysisPrompt(reflectionContent: string): string {
  return `
Please provide an empathetic analysis of the emotional content in this reflection:

REFLECTION:
${reflectionContent}

Please analyze:
- Primary emotions expressed
- Emotional patterns
- Potential limiting beliefs
- Growth opportunities
- Suggested practices for emotional balance
`;
}

/**
 * Create a prompt for chakra analysis
 */
export function createChakraAnalysisPrompt(reflectionContent: string): string {
  return `
Please analyze this reflection for chakra-related insights:

REFLECTION:
${reflectionContent}

Identify:
- Which chakras might be active or blocked based on the content
- Suggestions for balancing any identified chakra issues
- Practices that might help activate underactive chakras
`;
}

/**
 * Create a prompt for spiritual growth questions
 */
export function createSpiritualGrowthPrompt(question: string, userLevel: string = "beginner"): string {
  return `
[Context: User is at ${userLevel} level in their spiritual practice]

QUESTION:
${question}

Please provide:
- A thoughtful answer tailored to their level
- Practical suggestions they can implement
- Relevant concepts that might deepen their understanding
- A gentle nudge toward the next step in their growth
`;
}

/**
 * Create a prompt for meditation guidance
 */
export function createMeditationGuidancePrompt(question: string, practiceHistory: any = {}): string {
  const experienceLevel = practiceHistory.meditationMinutes > 500 ? "experienced" : 
                          practiceHistory.meditationMinutes > 100 ? "intermediate" : "beginner";
  
  return `
[Context: User is at ${experienceLevel} level in meditation practice with approximately ${practiceHistory.meditationMinutes || 0} minutes of recorded practice]

QUESTION ABOUT MEDITATION:
${question}

Please provide:
- Guidance appropriate to their experience level
- Practical meditation techniques they could try
- Common challenges they might encounter and how to overcome them
- Encouragement to deepen their practice
`;
}
