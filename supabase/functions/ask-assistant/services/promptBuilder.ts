
/**
 * Builds a contextualized prompt for the AI assistant
 * @param message User's message or question
 * @param userContext User's context data 
 * @param reflectionContent Optional reflection content for context
 * @returns Formatted prompt with context
 */
export function buildContextualizedPrompt(
  message: string,
  userContext: Record<string, any> = {},
  reflectionContent?: string
): string {
  // Start with base prompt instructions
  let prompt = 
    "You are a spiritual guide and meditation assistant with expertise in energy work and emotional wellness.\n\n";
  
  // Add user context if available
  if (Object.keys(userContext).length > 0) {
    prompt += "User Context:\n";
    
    if (userContext.energyPoints) {
      prompt += `- Energy Points: ${userContext.energyPoints}\n`;
    }
    
    if (userContext.astralLevel) {
      prompt += `- Astral Level: ${userContext.astralLevel}\n`;
    }
    
    if (userContext.dominantEmotions && userContext.dominantEmotions.length > 0) {
      prompt += `- Dominant Emotions: ${userContext.dominantEmotions.join(", ")}\n`;
    }
    
    if (userContext.chakrasActivated && userContext.chakrasActivated.length > 0) {
      prompt += `- Active Chakras: ${userContext.chakrasActivated.join(", ")}\n`;
    }
    
    if (userContext.lastActive) {
      // Calculate days since last active
      const lastActiveDate = new Date(userContext.lastActive);
      const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActive > 7) {
        prompt += `- User is returning after ${daysSinceActive} days\n`;
      }
    }
    
    prompt += "\n";
  }
  
  // Add reflection content for more context if available
  if (reflectionContent) {
    prompt += "User's Reflection:\n";
    prompt += `"${reflectionContent}"\n\n`;
  }
  
  // Append instruction for how to respond
  prompt += 
    "Provide an insightful, compassionate response that addresses the following question or request. " +
    "Keep your response concise, practical, and spiritually aligned. " +
    "If appropriate, include 1-3 recommended practices as a separate section at the end of your response.\n\n";
  
  // Add the user's message
  prompt += `User's Question: ${message}`;
  
  return prompt;
}
