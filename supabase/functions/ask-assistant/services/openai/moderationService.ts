
import { ContentModerationType } from "./types.ts";

/**
 * Content moderation result
 */
interface ModerationResult {
  allowed: boolean;
  flags: ContentModerationType[];
  reason?: string;
  score?: Record<ContentModerationType, number>;
}

/**
 * Check content against OpenAI's content moderation API
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: content
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI moderation API error:', error);
      
      // Default to allowing content if moderation fails, but log the error
      return {
        allowed: true,
        flags: [],
        reason: `Moderation API error: ${error.error?.message || 'Unknown error'}`
      };
    }
    
    const data = await response.json();
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
      reason: flags.length > 0 ? `Content contains ${flags.join(', ')}` : undefined
    };
  } catch (error) {
    console.error('Error checking content moderation:', error);
    
    // Default to allowing content if moderation errors out completely
    return {
      allowed: true,
      flags: [],
      reason: `Moderation check failed: ${error.message}`
    };
  }
}
