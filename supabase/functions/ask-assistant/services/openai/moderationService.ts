
/**
 * Content moderation service using OpenAI's moderation API
 */

import { logEvent } from "../../../shared/responseUtils.ts";
import type { ModerationResult, ContentModerationType } from "./types.ts";

/**
 * Check if content violates content policies using OpenAI's moderation API
 * 
 * @param content Content to moderate
 * @returns Moderation result
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: content
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Moderation API error: ${error.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    const result = data.results[0];
    
    // Extract flagged categories
    const flaggedCategories: Record<ContentModerationType, boolean> = result.categories;
    
    // Create list of flags that were triggered
    const flags: ContentModerationType[] = Object.entries(flaggedCategories)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key as ContentModerationType);
    
    return {
      allowed: !result.flagged,
      flags,
      flaggedCategories,
      categoryScores: result.category_scores
    };
  } catch (error) {
    // Log the error
    logEvent("error", "Content moderation error", { 
      error: error instanceof Error ? error.message : String(error),
      contentLength: content.length
    });
    
    // Default to allowing content in case of API failure
    // This can be adjusted based on your risk tolerance
    return {
      allowed: true,
      flags: [],
      flaggedCategories: {} as Record<ContentModerationType, boolean>,
      categoryScores: {} as Record<ContentModerationType, number>
    };
  }
}
