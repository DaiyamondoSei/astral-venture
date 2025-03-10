
/**
 * Content moderation service using OpenAI's Moderation API
 */

import { ContentModerationType } from "./types.ts";

/**
 * Check content using OpenAI's moderation API
 * 
 * @param content Content to moderate
 * @returns Moderation result with flags
 */
export async function moderateContent(
  content: string
): Promise<{
  allowed: boolean;
  flags: ContentModerationType[];
  score: number;
}> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  
  try {
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
      console.error('OpenAI Moderation API error:', error);
      throw new Error(`OpenAI Moderation API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const result = data.results[0];
    
    // Extract flagged categories
    const flaggedCategories: ContentModerationType[] = [];
    Object.entries(result.categories).forEach(([category, flagged]) => {
      if (flagged) {
        flaggedCategories.push(category as ContentModerationType);
      }
    });
    
    // Get the highest score across all categories
    const highestScore = Math.max(
      ...Object.values(result.category_scores).map(score => Number(score))
    );
    
    return {
      allowed: !result.flagged,
      flags: flaggedCategories,
      score: highestScore
    };
  } catch (error) {
    console.error('Error during content moderation:', error);
    
    // Default to allowing in case of API error, with appropriate logging
    return {
      allowed: true,
      flags: [],
      score: 0
    };
  }
}
