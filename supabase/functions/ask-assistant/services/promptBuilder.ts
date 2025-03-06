
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

export function createPersonalizedSystemPrompt(userContext: Record<string, any> = {}): string {
  let systemPrompt = 
    "You are a spiritual guide and meditation assistant with expertise in energy work, " +
    "chakra balancing, and emotional wellness.\n\n";
  
  // Add personalization based on user's progress
  if (userContext.astralLevel) {
    if (userContext.astralLevel < 3) {
      systemPrompt += "The user is a beginner. Use simpler language and focus on foundational concepts. " +
        "Provide clear, step-by-step guidance for any practices you recommend.\n\n";
    } else if (userContext.astralLevel < 7) {
      systemPrompt += "The user has intermediate experience. You can use more specialized terminology " +
        "and suggest slightly more advanced practices.\n\n";
    } else {
      systemPrompt += "The user has advanced experience. You can discuss complex spiritual concepts " +
        "and suggest sophisticated energy work techniques.\n\n";
    }
  }
  
  // General guidelines
  systemPrompt += 
    "Guidelines:\n" +
    "1. Be compassionate, warm, and insightful in your responses.\n" +
    "2. Keep explanations concise but informative.\n" +
    "3. Provide practical advice that can be implemented immediately.\n" +
    "4. When appropriate, suggest 1-3 specific practices as a separate section at the end of your response.\n" +
    "5. Avoid being overly technical unless the user's question is specifically technical.\n" +
    "6. Honor both scientific and spiritual perspectives while focusing primarily on experiential practices.\n" +
    "7. Format your response with clear paragraphs and occasional emphasis for readability.\n";
  
  return systemPrompt;
}
