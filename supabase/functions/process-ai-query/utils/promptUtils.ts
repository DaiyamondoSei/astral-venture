
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
