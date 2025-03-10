
/**
 * Moderation service for user messages
 */

import { logEvent } from "../../shared/responseUtils.ts";
import { moderateContent } from "./openai/moderationService.ts";

/**
 * Check if a message passes content moderation
 * 
 * @param message User message
 * @returns Moderation result
 */
export async function checkMessageModeration(message: string): Promise<{
  allowed: boolean;
  flags: string[];
}> {
  try {
    // Skip moderation for very short messages
    if (message.length < 5) {
      return { allowed: true, flags: [] };
    }
    
    // Basic filter for extremely problematic content
    const unsafeTerms = [
      "suicide", "kill myself", "harm myself", "self-harm", 
      "cutting myself", "end my life"
    ];
    
    for (const term of unsafeTerms) {
      if (message.toLowerCase().includes(term)) {
        logEvent("warn", "Message contains potentially harmful content", { term });
        
        return { 
          allowed: false, 
          flags: ["self-harm"]
        };
      }
    }
    
    // Full OpenAI moderation
    const moderationResult = await moderateContent(message);
    
    // Log detection for analytics
    if (!moderationResult.allowed) {
      logEvent("warn", "Message flagged by OpenAI moderation", { 
        flags: moderationResult.flags
      });
    }
    
    return {
      allowed: moderationResult.allowed,
      flags: moderationResult.flags
    };
  } catch (error) {
    // Log the error
    logEvent("error", "Error in content moderation", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Default to allowing content if moderation fails
    return { allowed: true, flags: [] };
  }
}
