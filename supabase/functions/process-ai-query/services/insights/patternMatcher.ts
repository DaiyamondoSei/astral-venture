
import { extractListItems } from "./listPatternMatcher.ts";
import { identifyInsightsByKeywords } from "./keywordPatternMatcher.ts";

/**
 * Extract insights from text using multiple pattern matching strategies
 */
export function extractInsights(text: string): { type: string; content: string }[] {
  const listItems = extractListItems(text);
  const paragraphInsights = identifyInsightsByKeywords(text);
  
  // Combine insights from different strategies
  return [...listItems, ...paragraphInsights];
}

/**
 * Legacy function for backward compatibility
 */
export function identifyInsightParagraphs(text: string): { type: string; content: string }[] {
  return identifyInsightsByKeywords(text);
}
