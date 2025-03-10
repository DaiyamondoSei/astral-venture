
/**
 * Content moderation service to ensure safe user content
 */

import { ContentModerationType } from "./openai/types.ts";

export interface ModerationResult {
  allowed: boolean;
  flags: ContentModerationType[];
  originalText: string;
  score?: number;
}

/**
 * Check if a message contains prohibited content using OpenAI's moderation API
 * 
 * @param text The text content to check
 * @returns Moderation result with flags and allowed status
 */
export async function checkMessageModeration(text: string): Promise<ModerationResult> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    // Call OpenAI's moderation API
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ input: text })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Moderation API error:", errorData);
      
      // Default to allowing the content if moderation check fails
      // In production, you might want to be more conservative
      return { 
        allowed: true, 
        flags: [],
        originalText: text,
        score: 0
      };
    }
    
    const data = await response.json();
    const result = data.results[0];
    
    // Extract flagged categories
    const flaggedCategories: ContentModerationType[] = [];
    const categories = result.categories;
    
    Object.keys(categories).forEach(category => {
      if (categories[category]) {
        flaggedCategories.push(category as ContentModerationType);
      }
    });
    
    // Determine if the content is allowed
    const allowed = !result.flagged;
    
    // Get the highest category score for reporting
    const scores = result.category_scores;
    const highestScore = Object.values(scores).reduce(
      (max, score) => Math.max(max, Number(score)),
      0
    );
    
    return {
      allowed,
      flags: flaggedCategories,
      originalText: text,
      score: highestScore
    };
  } catch (error) {
    console.error("Error checking content moderation:", error);
    
    // Default to allowing content if there's an error
    // In production, you might want to be more conservative
    return { 
      allowed: true, 
      flags: [],
      originalText: text
    };
  }
}

/**
 * Check if text contains sensitive information like PII
 * This is a simple check that could be expanded with more sophisticated logic
 * 
 * @param text Text to check for sensitive information
 * @returns Whether the text contains sensitive information
 */
export function containsSensitiveInformation(text: string): boolean {
  // Regular expressions for common sensitive information patterns
  const patterns = [
    /\b(?:\d[ -]*?){13,16}\b/,                                  // Credit card numbers
    /\b(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?\b/, // Base64 encoded data
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,      // Email addresses
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,                            // SSN
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/                               // IP addresses
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Filter sensitive information from text
 * 
 * @param text Text to filter
 * @returns Filtered text with sensitive information redacted
 */
export function filterSensitiveInformation(text: string): string {
  // Replace potential credit card numbers
  let filtered = text.replace(/\b(?:\d[ -]*?){13,16}\b/g, "[REDACTED CARD]");
  
  // Replace potential SSNs
  filtered = filtered.replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, "[REDACTED SSN]");
  
  // Replace potential email addresses
  filtered = filtered.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 
    "[REDACTED EMAIL]"
  );
  
  // Replace potential IP addresses
  filtered = filtered.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    "[REDACTED IP]"
  );
  
  return filtered;
}
