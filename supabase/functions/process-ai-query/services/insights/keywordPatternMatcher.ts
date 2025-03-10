/**
 * Keyword-based pattern matching for insight extraction
 */
import { Insight } from './patternMatcher.ts';

// Keywords that indicate insights in text
const insightKeywords = [
  'insight', 'important', 'key', 'significant', 'crucial', 'vital',
  'essential', 'fundamental', 'critical', 'noteworthy', 'remarkable',
  'highlight', 'takeaway', 'conclusion', 'finding', 'discovery',
  'realize', 'understand', 'recognize', 'learn', 'grasp', 'comprehend'
];

// Create a regex pattern from the keywords
const keywordPattern = new RegExp(
  `(${insightKeywords.join('|')})\\b[^.!?]*[.!?]`,
  'gi'
);

/**
 * Identify insights by looking for keyword indicators
 * 
 * @param text The AI-generated text to analyze
 * @returns Array of insights identified by keywords
 */
export function identifyInsightsByKeywords(text: string): Insight[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const insights: Insight[] = [];
  
  // Look for sentences containing insight keywords
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  for (const sentence of sentences) {
    // Skip very short sentences
    if (sentence.trim().length < 15) continue;
    
    // Check if sentence contains any insight keywords
    const keywordMatches = sentence.match(keywordPattern);
    
    if (keywordMatches) {
      // Determine confidence based on keyword presence
      const keywordCount = keywordMatches.length;
      const confidence = Math.min(0.5 + (keywordCount * 0.1), 0.9);
      
      insights.push({
        text: sentence.trim(),
        type: 'keyword_sentence',
        confidence,
        metadata: {
          keywordMatches: keywordMatches.map(match => match.trim()),
          keywordCount
        }
      });
    }
  }
  
  return insights;
}

/**
 * Get a score representing how insightful a piece of text is
 * Higher scores indicate more likely insights
 * 
 * @param text Text to analyze
 * @returns Insight score between 0 and 1
 */
export function getInsightScore(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  let score = 0;
  
  // Check for insight keywords
  for (const keyword of insightKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      score += 0.1;
    }
  }
  
  // Other heuristics to determine insight quality
  if (text.length > 20 && text.length < 200) {
    score += 0.1; // Good length for an insight
  }
  
  if (/\d+%/.test(text)) {
    score += 0.15; // Contains percentages
  }
  
  if (/(?:increase|decrease|improve|reduce)/.test(text)) {
    score += 0.1; // Contains change indicators
  }
  
  return Math.min(score, 1); // Cap at 1.0
}
