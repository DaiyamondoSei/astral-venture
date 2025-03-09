
import { extractListItems } from "./insights/listPatternMatcher.ts";
import { identifyInsightsByKeywords } from "./insights/keywordPatternMatcher.ts";

/**
 * Determines if two insights have similar content
 */
function areSimilarInsights(insight1: { content: string }, insight2: { content: string }, threshold = 0.8): boolean {
  const content1 = insight1.content.toLowerCase();
  const content2 = insight2.content.toLowerCase();
  
  // Quick exact match check
  if (content1 === content2) return true;
  
  // Simple similarity check - if one is a substring of the other
  if (content1.includes(content2) || content2.includes(content1)) return true;
  
  // More advanced similarity could be implemented here
  // For now, we'll use a simple word overlap approach
  const words1 = new Set(content1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(content2.split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return false;
  
  // Count common words
  let commonWords = 0;
  for (const word of words1) {
    if (words2.has(word)) commonWords++;
  }
  
  // Calculate similarity based on Jaccard similarity
  const similarity = commonWords / (words1.size + words2.size - commonWords);
  
  return similarity >= threshold;
}

/**
 * Extract insights from an AI response
 */
export function extractInsights(text: string): any[] {
  // First, extract list items
  const listInsights = extractListItems(text);
  
  // Then, identify paragraphs with insight keywords
  const paragraphInsights = identifyInsightsByKeywords(text);
  
  // Combine insights, removing duplicates
  const allInsights = [...listInsights];
  
  // Add paragraph insights if they don't duplicate content already found
  paragraphInsights.forEach(paragraph => {
    if (!allInsights.some(existingInsight => areSimilarInsights(existingInsight, paragraph))) {
      allInsights.push(paragraph);
    }
  });
  
  // Sort insights by type for better organization
  allInsights.sort((a, b) => a.type.localeCompare(b.type));
  
  return allInsights;
}
