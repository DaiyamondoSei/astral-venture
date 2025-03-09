
import { extractListItems, identifyInsightParagraphs } from "./insights/patternMatcher.ts";

/**
 * Extract insights from an AI response
 */
export function extractInsights(text: string): any[] {
  // First, extract list items
  const listInsights = extractListItems(text);
  
  // Then, identify paragraphs with insight keywords
  const paragraphInsights = identifyInsightParagraphs(text);
  
  // Combine insights, removing duplicates
  const allInsights = [...listInsights];
  
  // Add paragraph insights if they don't duplicate content already found
  paragraphInsights.forEach(paragraph => {
    if (!allInsights.some(i => i.content === paragraph.content)) {
      allInsights.push(paragraph);
    }
  });
  
  return allInsights;
}
