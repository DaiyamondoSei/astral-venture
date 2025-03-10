
/**
 * Pattern-based insight extraction
 * Uses multiple strategies to extract insights from AI text responses
 */

export interface Insight {
  text: string;
  type?: string;
  confidence: number;
  metadata?: Record<string, any>;
}

/**
 * Extract insights from text using pattern recognition
 * 
 * @param text The AI-generated text to extract insights from
 * @returns Array of extracted insights
 */
export function extractInsights(text: string): Insight[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const insights: Insight[] = [];
  
  // Combine insights from different extraction methods
  insights.push(...extractListItems(text));
  insights.push(...extractBulletPoints(text));
  insights.push(...extractNumberedItems(text));
  insights.push(...extractKeyInsights(text));
  insights.push(...identifyInsightsByKeywords(text));
  
  // Remove duplicates based on text content
  const uniqueInsights = removeDuplicateInsights(insights);
  
  // Sort by confidence
  return uniqueInsights.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string): Insight[] {
  const bulletPointRegex = /(?:^|\n)(?:\s*[•\-\*]\s+)(.+?)(?=(?:\n\s*[•\-\*]\s+|\n\n|$))/gs;
  const matches = [...text.matchAll(bulletPointRegex)];
  
  return matches.map((match, index) => ({
    text: match[1].trim(),
    type: 'bullet_point',
    confidence: 0.8,
    metadata: {
      position: index,
      originalMatch: match[0]
    }
  }));
}

/**
 * Extract numbered items from text
 */
function extractNumberedItems(text: string): Insight[] {
  const numberedItemRegex = /(?:^|\n)(?:\s*\d+\.\s+)(.+?)(?=(?:\n\s*\d+\.\s+|\n\n|$))/gs;
  const matches = [...text.matchAll(numberedItemRegex)];
  
  return matches.map((match, index) => ({
    text: match[1].trim(),
    type: 'numbered_item',
    confidence: 0.85,
    metadata: {
      position: index,
      originalMatch: match[0]
    }
  }));
}

/**
 * Extract key insights from structured elements in text
 */
function extractKeyInsights(text: string): Insight[] {
  const insights: Insight[] = [];
  
  // Extract insights from "Key insight:" or similar patterns
  const keyInsightRegex = /(?:key\s+insight|important\s+takeaway|key\s+finding|crucial\s+point)s?:?\s+(.+?)(?=\n\n|\n[A-Z]|$)/gis;
  const keyMatches = [...text.matchAll(keyInsightRegex)];
  
  keyMatches.forEach((match, index) => {
    insights.push({
      text: match[1].trim(),
      type: 'key_insight',
      confidence: 0.9,
      metadata: {
        position: index,
        originalMatch: match[0]
      }
    });
  });
  
  return insights;
}

/**
 * Remove duplicate insights based on text similarity
 */
function removeDuplicateInsights(insights: Insight[]): Insight[] {
  const seen = new Set<string>();
  const unique: Insight[] = [];
  
  for (const insight of insights) {
    // Normalize text for comparison
    const normalized = insight.text.toLowerCase().trim();
    
    // Skip if we've seen this text before
    if (seen.has(normalized)) continue;
    
    seen.add(normalized);
    unique.push(insight);
  }
  
  return unique;
}
