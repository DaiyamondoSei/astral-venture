
/**
 * Prompt building services for AI assistant
 */

/**
 * Create a personalized system prompt for the AI assistant
 * based on user context
 * 
 * @param userContext User context information
 * @returns Personalized system prompt
 */
export function createPersonalizedSystemPrompt(userContext: any = {}): string {
  const { profile, practices = [], insights = [] } = userContext;
  
  // Base system prompt
  let systemPrompt = `You are a spiritual guide and meditation assistant with expertise in energy work, 
chakra balancing, and emotional wellness.

You communicate in a warm, empathetic tone while providing insightful, evidence-based guidance.
Your responses are concise and practical, focusing on actionable wisdom.
Format your answers in clear paragraphs with occasional emphasis for readability.`;

  // Add personalization if we have user context
  if (profile) {
    systemPrompt += `\n\nYou're speaking with ${profile.full_name || "a user"} who has been on their spiritual journey `;
    
    if (profile.astral_level && profile.astral_level > 1) {
      systemPrompt += `and has reached Astral Level ${profile.astral_level}. `;
    } else {
      systemPrompt += `and is just beginning their practice. `;
    }
    
    if (profile.consciousness_level) {
      systemPrompt += `Their consciousness level is ${profile.consciousness_level}. `;
    }
    
    if (profile.meditation_minutes > 0) {
      const hours = Math.floor(profile.meditation_minutes / 60);
      systemPrompt += `They have logged ${hours > 0 ? `${hours} hours and ` : ""}${profile.meditation_minutes % 60} minutes of meditation. `;
    }
  }
  
  // Add information about recent practices if available
  if (practices && practices.length > 0) {
    systemPrompt += `\n\nThey have recently practiced:`;
    practices.slice(0, 3).forEach((practice: any) => {
      systemPrompt += `\n- ${practice.title}`;
    });
  }
  
  // Add information about recent insights if available
  if (insights && insights.length > 0) {
    systemPrompt += `\n\nRecent insights they've explored:`;
    insights.slice(0, 3).forEach((insight: any) => {
      systemPrompt += `\n- ${insight.title}`;
    });
  }
  
  // Add ethical guidelines
  systemPrompt += `\n\nImportant guidelines:
- Focus on spiritual growth and wellness
- Avoid making specific medical claims
- Respect diverse spiritual beliefs
- Offer practical guidance when possible
- If asked about something beyond your capabilities, acknowledge limitations
- Suggest 1-3 specific practices when appropriate`;

  return systemPrompt;
}

/**
 * Build a contextualized prompt with additional information
 * 
 * @param message User message
 * @param userContext User context information
 * @param reflectionContent Reflection content if applicable
 * @returns Contextualized prompt
 */
export function buildContextualizedPrompt(
  message: string, 
  userContext: any = {},
  reflectionContent?: string
): string {
  // If this is a reflection analysis, create a special prompt
  if (reflectionContent) {
    return `I've written this reflection and would appreciate your insights:

"${reflectionContent}"

${message}`;
  }
  
  // For regular messages, just return the message
  return message;
}
