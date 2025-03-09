
/**
 * AI insight processing utilities
 */

import { AIResponse, AIInsight } from '@/services/ai/types';

/**
 * Process and extract insights from AI responses
 * @param response The AI response text to process
 * @returns Array of extracted insights
 */
export function extractInsights(response: string): string[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  // Look for insight sections in the AI response
  const insightPatterns = [
    /Key Insights:([\s\S]*?)(?=\n\n|\n#|$)/i,
    /Insights:([\s\S]*?)(?=\n\n|\n#|$)/i,
    /Main Takeaways:([\s\S]*?)(?=\n\n|\n#|$)/i,
  ];

  for (const pattern of insightPatterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      // Extract individual insights from the matched section
      return match[1]
        .split(/\n-|\n•|\n\d+\./)
        .map(insight => insight.trim())
        .filter(insight => insight.length > 0);
    }
  }

  // If no structured insights found, extract sentences that might be insights
  // based on insight-like language patterns
  const potentialInsights = response
    .split(/\.\s+|\n+/)
    .map(s => s.trim())
    .filter(s => 
      s.length > 15 && 
      s.length < 150 &&
      !s.startsWith('http') &&
      (
        s.includes('should') ||
        s.includes('could') ||
        s.includes('might') ||
        s.includes('consider') ||
        s.includes('important') ||
        s.includes('significant') ||
        s.includes('key') ||
        s.includes('critical')
      )
    );

  return potentialInsights.slice(0, 5); // Limit to 5 potential insights
}

/**
 * Process and extract suggested practices from AI responses
 * @param response The AI response text to process
 * @returns Array of extracted practice suggestions
 */
export function extractSuggestedPractices(response: string): string[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  // Look for practice suggestion sections in the AI response
  const practicePatterns = [
    /Suggested Practices:([\s\S]*?)(?=\n\n|\n#|$)/i,
    /Recommended Practices:([\s\S]*?)(?=\n\n|\n#|$)/i,
    /Practices to Consider:([\s\S]*?)(?=\n\n|\n#|$)/i,
    /Try these practices:([\s\S]*?)(?=\n\n|\n#|$)/i,
  ];

  for (const pattern of practicePatterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      // Extract individual practices from the matched section
      return match[1]
        .split(/\n-|\n•|\n\d+\./)
        .map(practice => practice.trim())
        .filter(practice => practice.length > 0);
    }
  }

  // If no structured practices found, look for practice-like phrases
  const practicePhrases = [
    "try to", "practice", "exercise", "consider", 
    "I recommend", "you might want to", "it helps to",
    "a good practice is", "beneficial to"
  ];
  
  const sentences = response.split(/\.\s+|\n+/);
  const potentialPractices = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return practicePhrases.some(phrase => lowerSentence.includes(phrase)) &&
           sentence.length > 20 &&
           sentence.length < 200;
  });

  return potentialPractices.slice(0, 3); // Limit to 3 potential practices
}

/**
 * Generate structured insights from an AI response
 * @param aiResponse The AI response object
 * @returns Array of structured insights with metadata
 */
export function generateStructuredInsights(aiResponse: AIResponse): AIInsight[] {
  const insights = extractInsights(aiResponse.answer || "");
  
  return insights.map((text, index) => ({
    id: `insight-${index}-${Date.now()}`,
    type: determineInsightType(text),
    text,
    confidence: calculateConfidence(text),
    relevance: calculateRelevance(text),
    title: generateInsightTitle(text)
  }));
}

/**
 * Determine the insight type based on content analysis
 */
function determineInsightType(text: string): 'chakra' | 'emotion' | 'practice' | 'wisdom' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('chakra') || 
      lowerText.includes('energy center') || 
      lowerText.includes('energy flow')) {
    return 'chakra';
  }
  
  if (lowerText.includes('feel') || 
      lowerText.includes('emotion') || 
      lowerText.includes('mood') ||
      lowerText.includes('anxiety') ||
      lowerText.includes('stress') ||
      lowerText.includes('happiness')) {
    return 'emotion';
  }
  
  if (lowerText.includes('practice') || 
      lowerText.includes('exercise') || 
      lowerText.includes('technique') ||
      lowerText.includes('try') ||
      lowerText.includes('doing')) {
    return 'practice';
  }
  
  return 'wisdom';
}

/**
 * Calculate confidence score based on text analysis
 */
function calculateConfidence(text: string): number {
  // Simple heuristic for confidence scoring
  const confidenceFactors = {
    length: 0,
    certainty: 0,
    specificity: 0
  };
  
  // Length factor
  if (text.length > 100) confidenceFactors.length = 0.3;
  else if (text.length > 50) confidenceFactors.length = 0.2;
  else confidenceFactors.length = 0.1;
  
  // Certainty factor
  const uncertaintyPhrases = ['might', 'maybe', 'perhaps', 'possibly', 'could'];
  const certaintyPhrases = ['definitely', 'certainly', 'clearly', 'indeed', 'undoubtedly'];
  
  const hasUncertainty = uncertaintyPhrases.some(phrase => text.toLowerCase().includes(phrase));
  const hasCertainty = certaintyPhrases.some(phrase => text.toLowerCase().includes(phrase));
  
  if (hasCertainty && !hasUncertainty) confidenceFactors.certainty = 0.4;
  else if (!hasUncertainty) confidenceFactors.certainty = 0.3;
  else if (hasCertainty) confidenceFactors.certainty = 0.2;
  else confidenceFactors.certainty = 0.1;
  
  // Specificity factor
  const specificTerms = ['specifically', 'exactly', 'precisely', 'in particular'];
  const hasSpecificity = specificTerms.some(term => text.toLowerCase().includes(term));
  
  confidenceFactors.specificity = hasSpecificity ? 0.3 : 0.1;
  
  // Calculate total confidence (0.3 to 0.9 range)
  const baseConfidence = 0.3;
  const totalFactors = confidenceFactors.length + confidenceFactors.certainty + confidenceFactors.specificity;
  
  return Math.min(0.9, baseConfidence + totalFactors);
}

/**
 * Calculate relevance score based on text analysis
 */
function calculateRelevance(text: string): number {
  // Simple heuristic for relevance scoring
  const baseRelevance = 0.5;
  
  // Relevance boosting factors
  const relevanceBoosts = [
    { terms: ['important', 'critical', 'essential', 'key', 'fundamental'], boost: 0.2 },
    { terms: ['chakra', 'energy', 'meditation', 'practice', 'mindfulness'], boost: 0.15 },
    { terms: ['balance', 'harmony', 'peace', 'healing', 'growth'], boost: 0.1 }
  ];
  
  let totalBoost = 0;
  const lowerText = text.toLowerCase();
  
  relevanceBoosts.forEach(({ terms, boost }) => {
    if (terms.some(term => lowerText.includes(term))) {
      totalBoost += boost;
    }
  });
  
  return Math.min(0.95, baseRelevance + totalBoost);
}

/**
 * Generate a title for an insight based on its content
 */
function generateInsightTitle(text: string): string {
  // Extract first sentence or first X characters
  const firstSentence = text.split('.')[0].trim();
  
  if (firstSentence.length < 40) {
    return firstSentence;
  }
  
  // Extract key phrases
  const keyPhrases = [
    'the importance of',
    'understanding',
    'how to',
    'why',
    'the connection between',
    'the relationship between',
    'the impact of',
    'the role of',
    'the benefit of',
    'the practice of'
  ];
  
  for (const phrase of keyPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      const index = text.toLowerCase().indexOf(phrase);
      const relevantText = text.slice(index);
      const endOfPhrase = relevantText.indexOf('.') !== -1 ? 
                          relevantText.indexOf('.') : 
                          Math.min(50, relevantText.length);
      
      return relevantText.substring(0, endOfPhrase);
    }
  }
  
  // Fallback to first 40 chars with ellipsis
  return firstSentence.substring(0, 40) + '...';
}
