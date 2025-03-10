
/**
 * Comprehensive pattern matching service for insight extraction
 * Combines multiple extraction approaches for better results
 */

// Insight type definition
export interface Insight {
  type: string;       // The category of insight (emotional, chakra, practice, etc.)
  content: string;    // The actual content of the insight
  relevance?: number; // Optional relevance score (0-10)
}

/**
 * Extract list items from text as insights
 * @param text The text to analyze
 * @returns Array of extracted insights from lists
 */
export function extractListItems(text: string): Insight[] {
  if (!text) return [];
  
  const insights: Insight[] = [];
  
  // Look for bullet points and numbered lists
  const listItemRegex = /(?:^|\n)[-*•]|\d+\.\s+(.+?)(?=$|\n)/g;
  let match;
  
  while ((match = listItemRegex.exec(text)) !== null) {
    const content = match[1] || match[0].replace(/^[-*•]|\d+\.\s+/, '').trim();
    if (content.length > 5) { // Minimum content length
      insights.push({
        type: 'list-item',
        content: content.trim()
      });
    }
  }
  
  return insights;
}

/**
 * Identify insights by looking for key phrases and patterns
 * @param text The text to analyze
 * @returns Array of extracted insights by keywords
 */
export function identifyInsightsByKeywords(text: string): Insight[] {
  if (!text) return [];
  
  const insights: Insight[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  // Keywords that indicate different types of insights
  const keywordPatterns = [
    { pattern: /chakra|energy center|root|sacral|solar plexus|heart|throat|third eye|crown/i, type: 'chakra' },
    { pattern: /emotion|feel|feeling|emotional|mood|anxiety|stress|joy|happiness|sadness/i, type: 'emotional' },
    { pattern: /meditat|breath|mindful|practice|technique|exercise|routine/i, type: 'practice' },
    { pattern: /reflect|insight|realiz|understand|awareness|conscious/i, type: 'awareness' },
    { pattern: /recommend|suggest|try|consider|might help|could benefit/i, type: 'recommendation' }
  ];
  
  // Examine each paragraph for insights
  paragraphs.forEach(paragraph => {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length < 15) return; // Skip very short paragraphs
    
    // Determine the type based on keywords
    for (const { pattern, type } of keywordPatterns) {
      if (pattern.test(trimmedParagraph)) {
        insights.push({
          type,
          content: trimmedParagraph,
          relevance: calculateRelevance(trimmedParagraph, type)
        });
        break; // Assign only one type per paragraph
      }
    }
  });
  
  return insights;
}

/**
 * Calculate relevance score for an insight based on content and type
 * @param content The insight content
 * @param type The insight type
 * @returns Relevance score (0-10)
 */
function calculateRelevance(content: string, type: string): number {
  // Base relevance
  let relevance = 5;
  
  // Adjust based on content length (longer content may be more detailed)
  if (content.length > 100) relevance += 1;
  if (content.length > 200) relevance += 1;
  
  // Adjust based on specific keywords presence
  const strongIndicators = {
    chakra: ['balance', 'blockage', 'alignment', 'energy flow', 'activation'],
    emotional: ['pattern', 'trigger', 'response', 'regulation', 'healing'],
    practice: ['daily', 'regular', 'consistent', 'technique', 'method'],
    awareness: ['insight', 'realization', 'understanding', 'perspective', 'clarity'],
    recommendation: ['specific', 'personalized', 'tailored', 'effective', 'proven']
  };
  
  // Add points for strong indicators
  const indicators = strongIndicators[type as keyof typeof strongIndicators] || [];
  for (const indicator of indicators) {
    if (content.toLowerCase().includes(indicator)) {
      relevance += 0.5;
    }
  }
  
  // Cap at 10
  return Math.min(10, relevance);
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
