
/**
 * Content moderation service using OpenAI
 */
import type { ModerationResult, ContentModerationType } from "./types.ts";

/**
 * Moderate content using OpenAI's moderation API
 * 
 * @param content - Content to moderate
 * @returns Moderation result with flags and scores
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI moderation error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) {
      throw new Error("Unexpected moderation response format");
    }

    // Extract flags from categories
    const flaggedCategories: Record<ContentModerationType, boolean> = result.categories;
    const categoryScores: Record<ContentModerationType, number> = result.category_scores;
    
    // Get all flags that were triggered
    const flags: ContentModerationType[] = Object.entries(flaggedCategories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category as ContentModerationType);

    // Determine if content is allowed
    const allowed = !result.flagged;

    return {
      allowed,
      flags,
      flaggedCategories,
      categoryScores
    };
  } catch (error) {
    console.error("Moderation service error:", error);
    
    // Default to allowing content in case of API errors
    // This is a fail-open approach which may need to be reconsidered
    // depending on your application's requirements
    return {
      allowed: true,
      flags: [],
      flaggedCategories: {} as Record<ContentModerationType, boolean>,
      categoryScores: {} as Record<ContentModerationType, number>
    };
  }
}
