
import { createInsightPrompt, createEmotionalAnalysisPrompt } from "../utils/promptUtils.ts";

/**
 * Fetch user context data to enhance AI responses
 */
export async function fetchUserContext(userId: string) {
  try {
    // In a production app, we would fetch user profile, preferences,
    // and history from the database to personalize responses
    return {
      userId,
      interactionHistory: [],
      preferences: {},
      practiceLevel: "beginner"
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return {
      userId,
      practiceLevel: "beginner"
    };
  }
}

/**
 * Build a contextualized prompt with user information
 */
export function buildContextualizedPrompt(
  query: string,
  userContext: any,
  reflectionContent?: string
): string {
  // If reflection content is provided, focus on analyzing it
  if (reflectionContent) {
    return createEmotionalAnalysisPrompt(reflectionContent);
  }

  // For regular queries, add user context
  const practiceLevel = userContext?.practiceLevel || 'beginner';
  const contextPrefix = `[Context: User is a ${practiceLevel} practitioner]`;
  
  return `${contextPrefix}\n\nQuestion: ${query}`;
}
