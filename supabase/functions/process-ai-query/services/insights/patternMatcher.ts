
import { extractListItems } from './listPatternMatcher';
import { identifyInsightsByKeywords } from './keywordPatternMatcher';

/**
 * Insight with type, content and metadata
 */
export interface Insight {
  type: string;
  content: string;
  relevance?: number;
  source?: string;
}

/**
 * Extract all insights from AI response text using multiple extraction methods
 * @param text The AI response text to analyze
 * @returns Array of extracted insights
 */
export function extractInsights(text: string): Insight[] {
  // Skip processing if text is too short
  if (!text || text.length < 100) {
    return [];
  }
  
  // Extract insights using different methods
  const listInsights = extractListItems(text).map(insight => ({
    ...insight,
    source: 'list'
  }));
  
  const keywordInsights = identifyInsightsByKeywords(text).map(insight => ({
    ...insight,
    source: 'keyword'
  }));
  
  // Combine insights from different sources
  const allInsights = [...listInsights, ...keywordInsights];
  
  // Remove duplicate insights (similar content with same type)
  const uniqueInsights = deduplicateInsights(allInsights);
  
  // Calculate relevance scores for sorting
  const scoredInsights = calculateRelevanceScores(uniqueInsights);
  
  // Return the most relevant insights, sorted by relevance
  return scoredInsights
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, 5); // Limit to top 5 insights
}

/**
 * Remove duplicate insights with similar content
 */
function deduplicateInsights(insights: Insight[]): Insight[] {
  const unique: Insight[] = [];
  const contentSignatures = new Set<string>();
  
  for (const insight of insights) {
    // Create a signature from type and content to detect duplicates
    const contentWords = insight.content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 10)
      .sort()
      .join('');
    
    const signature = `${insight.type}:${contentWords}`;
    
    if (!contentSignatures.has(signature)) {
      contentSignatures.add(signature);
      unique.push(insight);
    }
  }
  
  return unique;
}

/**
 * Calculate relevance scores for insights based on various factors
 */
function calculateRelevanceScores(insights: Insight[]): Insight[] {
  return insights.map(insight => {
    let relevance = 1.0;
    const content = insight.content.toLowerCase();
    
    // Factor 1: Content length (longer content often more valuable, up to a point)
    const lengthFactor = Math.min(content.length / 200, 1.5);
    relevance *= lengthFactor;
    
    // Factor 2: Keyword density for the insight type
    const typeKeywords = getKeywordsForType(insight.type);
    let keywordMatches = 0;
    
    typeKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        keywordMatches += matches.length;
      }
    });
    
    const keywordDensity = keywordMatches / (content.length / 50);
    relevance *= (1 + keywordDensity);
    
    // Factor 3: Presence of actionable language
    const actionableKeywords = [
      'try', 'practice', 'do', 'implement', 'apply', 'use', 'take', 'breathe',
      'focus', 'visualize', 'imagine', 'notice', 'observe', 'reflect', 'journal',
      'meditate', 'consider', 'start', 'begin', 'continue', 'remember'
    ];
    
    let actionableScore = 1.0;
    actionableKeywords.forEach(word => {
      if (content.includes(word)) {
        actionableScore += 0.1; // Each actionable word increases score
      }
    });
    
    relevance *= Math.min(actionableScore, 2.0); // Cap at doubling the score
    
    // Factor 4: Source method weighting
    if (insight.source === 'list') {
      relevance *= 1.2; // List insights are often more structured
    }
    
    return {
      ...insight,
      relevance
    };
  });
}

/**
 * Get relevant keywords for each insight type
 */
function getKeywordsForType(type: string): string[] {
  switch (type) {
    case 'emotional':
      return [
        'emotion', 'feel', 'feeling', 'emotional', 'mood', 'balance',
        'anxiety', 'joy', 'peace', 'love', 'happiness', 'contentment'
      ];
    case 'chakra':
      return [
        'chakra', 'energy', 'root', 'sacral', 'solar', 'heart', 'throat',
        'third eye', 'crown', 'balance', 'activate', 'align'
      ];
    case 'practice':
      return [
        'practice', 'meditate', 'exercise', 'technique', 'routine', 
        'habit', 'daily', 'regular', 'discipline', 'breathe'
      ];
    case 'awareness':
      return [
        'aware', 'conscious', 'mindful', 'present', 'attention',
        'observe', 'notice', 'witness', 'presence', 'awareness'
      ];
    default:
      return [
        'important', 'significant', 'key', 'essential', 'fundamental',
        'primary', 'central', 'critical', 'vital', 'valuable'
      ];
  }
}
