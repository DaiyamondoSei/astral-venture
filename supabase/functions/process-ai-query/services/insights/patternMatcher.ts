
import { extractListItems } from "./listPatternMatcher.ts";
import { identifyInsightsByKeywords } from "./keywordPatternMatcher.ts";

/**
 * Extract list items from text - legacy function for backward compatibility
 */
export function extractListItems(text: string): { type: string; content: string }[] {
  return extractListItems(text);
}

/**
 * Identify paragraphs containing insight keywords - legacy function for backward compatibility
 */
export function identifyInsightParagraphs(text: string): { type: string; content: string }[] {
  return identifyInsightsByKeywords(text);
}
