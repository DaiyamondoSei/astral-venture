
/**
 * Insight extraction service for AI responses
 * Combines multiple pattern matching approaches for comprehensive insight extraction
 */

import { extractInsights, Insight } from './patternMatcher';

export { extractInsights, Insight };

// Export individual extractors for cases where specific extractor is needed
export { extractListItems } from './listPatternMatcher';
export { identifyInsightsByKeywords } from './keywordPatternMatcher';
