
import { moderateContent, ContentModerationType } from "./openai/index.ts";

// Content moderation check
export async function checkMessageModeration(message: string): Promise<{
  allowed: boolean;
  flags?: ContentModerationType[];
}> {
  try {
    // Simple local moderation check for abusive terms
    const abusiveTerms = ["kill", "hate", "destroy", "attack"];
    const containsAbusiveTerms = abusiveTerms.some(term => 
      message.toLowerCase().includes(term)
    );
    
    if (containsAbusiveTerms) {
      return {
        allowed: false,
        flags: ["harassment", "hate"]
      };
    }
    
    // Use OpenAI moderation API for more comprehensive check
    const moderationResult = await moderateContent(message);
    if (moderationResult.flagged) {
      return {
        allowed: false,
        flags: moderationResult.flaggedCategories
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error("Error in content moderation:", error);
    // Default to allowing message if moderation check fails
    return { allowed: true };
  }
}
