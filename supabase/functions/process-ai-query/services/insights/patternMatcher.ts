/**
 * Comprehensive pattern matching service for insight extraction
 * Combines multiple extraction approaches for better results
 */

import { extractListItems } from './listPatternMatcher';
import { identifyInsightsByKeywords } from './keywordPatternMatcher';

// Insight type definition
export interface Insight {
  type: string;       // The category of insight (emotional, chakra, practice, etc.)
  content: string;    // The actual content of the insight
  relevance?: number; // Optional relevance score (0-10)
}

/**
 * Extract insights from AI response text using multiple pattern matching approaches
 * @param text The AI response text to analyze
 * @returns Array of extracted insights with type categorization
 */
export function extractInsights(text: string): Insight[] {
  if (!text || typeof text !== 'string') {
    console.warn("Empty or invalid text provided to extractInsights");
    return [];
  }
  
  try {
    // Get insights from list pattern matcher
    const listInsights = extractListItems(text);
    
    // Get insights from keyword pattern matcher
    const keywordInsights = identifyInsightsByKeywords(text);
    
    // Combine insights from both approaches
    const combinedInsights: Insight[] = [
      ...listInsights,
      ...keywordInsights
    ];
    
    // Deduplicate insights by comparing content similarity
    const uniqueInsights = deduplicateInsights(combinedInsights);
    
    // Sort by relevance (if available) or default to alphabetical by type
    return uniqueInsights.sort((a, b) => {
      if (a.relevance && b.relevance) {
        return b.relevance - a.relevance;
      }
      return a.type.localeCompare(b.type);
    });
  } catch (error) {
    console.error("Error extracting insights:", error);
    return [];
  }
}

/**
 * Remove duplicate insights based on content similarity
 */
function deduplicateInsights(insights: Insight[]): Insight[] {
  const uniqueInsights: Insight[] = [];
  const seenContent = new Set<string>();
  
  for (const insight of insights) {
    // Create a normalized version of the content for comparison
    const normalizedContent = insight.content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Use first 100 chars for comparison
    
    // Skip if we've seen very similar content
    if (!seenContent.has(normalizedContent)) {
      seenContent.add(normalizedContent);
      uniqueInsights.push(insight);
    } else {
      // If duplicate found, keep the one with higher relevance
      const existingIndex = uniqueInsights.findIndex(
        item => item.content.toLowerCase().includes(normalizedContent) ||
                normalizedContent.includes(item.content.toLowerCase())
      );
      
      if (existingIndex >= 0) {
        const existing = uniqueInsights[existingIndex];
        
        // If new insight has higher relevance, replace the existing one
        if ((insight.relevance || 0) > (existing.relevance || 0)) {
          uniqueInsights[existingIndex] = insight;
        }
      }
    }
  }
  
  return uniqueInsights;
}
