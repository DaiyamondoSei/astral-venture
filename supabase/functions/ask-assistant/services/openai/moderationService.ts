
import { ContentModerationType } from "./types.ts";

/**
 * Content moderation result with improved type safety
 */
export interface ModerationResult {
  allowed: boolean;
  flags: ContentModerationType[];
  reason?: string;
  score?: Record<ContentModerationType, number>;
  category_scores?: Record<string, number>;
  flagged_categories?: string[];
}

/**
 * Check content against OpenAI's content moderation API
 * with improved error handling and type safety
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    // Validate input
    if (!content || typeof content !== 'string') {
      return {
        allowed: true,
        flags: [],
        reason: "Empty or invalid content provided for moderation"
      };
    }
    
    // Get API key with validation
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY environment variable");
      return {
        allowed: true,
        flags: [],
        reason: "Moderation check skipped: API key missing"
      };
    }
    
    // Trim content if it's too long
    const trimmedContent = content.length > 4000 
      ? content.substring(0, 4000) + "..." 
      : content;
    
    // Start timer for performance tracking
    const startTime = Date.now();
    
    // Call OpenAI moderation API
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: trimmedContent
      })
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`OpenAI moderation API responded in ${elapsed}ms`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI moderation API error:', errorData);
      
      // Default to allowing content if moderation fails, but log the error
      return {
        allowed: true,
        flags: [],
        reason: `Moderation API error: ${errorData.error?.message || 'Unknown error'}`
      };
    }
    
    const data = await response.json();
    
    if (!data.results || !data.results[0]) {
      return {
        allowed: true,
        flags: [],
        reason: "Invalid response from moderation API"
      };
    }
    
    const result = data.results[0];
    
    // Extract flagged categories
    const flags: ContentModerationType[] = [];
    const flagsScore: Record<ContentModerationType, number> = {} as Record<ContentModerationType, number>;
    
    for (const [category, flagged] of Object.entries(result.categories)) {
      if (flagged) {
        flags.push(category as ContentModerationType);
      }
      
      // Store score for each category
      flagsScore[category as ContentModerationType] = result.category_scores[category];
    }
    
    return {
      allowed: !result.flagged,
      flags,
      score: flagsScore,
      category_scores: result.category_scores,
      flagged_categories: flags,
      reason: flags.length > 0 ? `Content contains ${flags.join(', ')}` : undefined
    };
  } catch (error) {
    console.error('Error checking content moderation:', error);
    
    // Default to allowing content if moderation errors out completely
    return {
      allowed: true,
      flags: [],
      reason: `Moderation check failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check if content is safe (simplified version of moderateContent)
 */
export async function isSafeContent(content: string): Promise<boolean> {
  const result = await moderateContent(content);
  return result.allowed;
}

export default {
  moderateContent,
  isSafeContent
};
