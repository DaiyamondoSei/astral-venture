
/**
 * Prompt builder for AI assistant 
 * Creates contextualized and personalized prompts for the AI
 */

import { logEvent } from "../../shared/responseUtils.ts";

/**
 * Build a contextualized prompt with additional context
 * 
 * @param message User message 
 * @param userContext User context data
 * @param additionalContext Optional additional context
 * @returns Enhanced prompt
 */
export function buildContextualizedPrompt(
  message: string,
  userContext: Record<string, any> = {},
  additionalContext: string = ""
): string {
  try {
    // Build context preamble
    let contextPreamble = "";
    
    // Add astral level context if available
    if (userContext.astralLevel) {
      contextPreamble += `My current astral level is ${userContext.astralLevel}. `;
    }
    
    // Add chakra system context if available
    if (userContext.chakraSystem) {
      let dominantChakra = userContext.chakraSystem.dominant_chakra;
      let overallBalance = userContext.chakraSystem.overall_balance;
      
      if (dominantChakra) {
        contextPreamble += `My dominant chakra is ${dominantChakra}. `;
      }
      
      if (overallBalance !== undefined) {
        const balanceLevel = 
          overallBalance < 3 ? "unbalanced" :
          overallBalance < 6 ? "moderately balanced" :
          "well balanced";
        
        contextPreamble += `My chakras are ${balanceLevel} (${overallBalance}/10). `;
      }
    }
    
    // Add recent practice context if available
    if (userContext.recentPractices && userContext.recentPractices.length > 0) {
      const practices = userContext.recentPractices;
      const categories = practices.map((p: any) => p.category);
      const uniqueCategories = [...new Set(categories)];
      
      if (uniqueCategories.length > 0) {
        contextPreamble += `I've recently practiced ${uniqueCategories.join(', ')}. `;
      }
    }
    
    // Add reflection context if available
    if (additionalContext) {
      contextPreamble += `\nRelevant context from my reflection: "${additionalContext}"\n\n`;
    }
    
    // Combine the preamble with the user's message
    let finalPrompt = message;
    
    if (contextPreamble) {
      finalPrompt = `${contextPreamble}\n\nMy question: ${message}`;
    }
    
    // Log the prompt construction
    logEvent("debug", "Prompt constructed", { 
      userContextAvailable: Object.keys(userContext).length > 0,
      additionalContextProvided: !!additionalContext,
      finalPromptLength: finalPrompt.length
    });
    
    return finalPrompt;
  } catch (error) {
    // Log error but return original message if something goes wrong
    logEvent("error", "Error building contextualized prompt", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return message;
  }
}

/**
 * Create a personalized system prompt based on user context
 * 
 * @param userContext User context data
 * @returns Personalized system prompt
 */
export function createPersonalizedSystemPrompt(userContext: Record<string, any> = {}): string {
  try {
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
    
    // Add chakra-specific guidance if available
    if (userContext.chakraSystem?.dominant_chakra) {
      const dominantChakra = userContext.chakraSystem.dominant_chakra.toLowerCase();
      
      if (dominantChakra === "root") {
        systemPrompt += "The user's dominant chakra is the Root chakra. Focus on grounding techniques, " +
          "stability practices, and ways to enhance their sense of security.\n\n";
      } else if (dominantChakra === "sacral") {
        systemPrompt += "The user's dominant chakra is the Sacral chakra. Focus on creativity, emotional " +
          "balance, and healthy expression of feelings.\n\n";
      } else if (dominantChakra === "solar") {
        systemPrompt += "The user's dominant chakra is the Solar Plexus chakra. Focus on personal power, " +
          "confidence building, and decision-making clarity.\n\n";
      } else if (dominantChakra === "heart") {
        systemPrompt += "The user's dominant chakra is the Heart chakra. Focus on compassion practices, " +
          "self-love, and interpersonal harmony.\n\n";
      } else if (dominantChakra === "throat") {
        systemPrompt += "The user's dominant chakra is the Throat chakra. Focus on authentic communication, " +
          "self-expression, and speaking one's truth.\n\n";
      } else if (dominantChakra === "third eye") {
        systemPrompt += "The user's dominant chakra is the Third Eye chakra. Focus on intuition development, " +
          "clarity of perception, and inner wisdom.\n\n";
      } else if (dominantChakra === "crown") {
        systemPrompt += "The user's dominant chakra is the Crown chakra. Focus on spiritual connection, " +
          "higher consciousness, and universal awareness.\n\n";
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
    
    // Log the prompt construction
    logEvent("debug", "System prompt constructed", { 
      userContextAvailable: Object.keys(userContext).length > 0,
      systemPromptLength: systemPrompt.length
    });
    
    return systemPrompt;
  } catch (error) {
    // Log error but return default prompt if something goes wrong
    logEvent("error", "Error building personalized system prompt", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return "You are a spiritual guide and meditation assistant. Provide helpful, compassionate guidance.";
  }
}
