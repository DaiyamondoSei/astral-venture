
import { extractInsights as extractInsightsWithPatterns } from "./insights/patternMatcher.ts";

/**
 * Extract insights from an AI response using multiple pattern matching strategies
 */
export function extractInsights(text: string): any[] {
  // Use the pattern matcher to extract all insights
  const patternInsights = extractInsightsWithPatterns(text);
  
  // Add additional metadata to each insight
  return patternInsights.map((insight, index) => ({
    id: `insight-${Date.now()}-${index}`,
    ...insight,
    created_at: new Date().toISOString()
  }));
}
