
/**
 * Main AI Service entry point
 * 
 * This file re-exports all AI-related functionality from individual modules
 * to maintain the same public API while keeping the codebase modular.
 */

// Re-export types
export type { 
  AIInsight, 
  AIQuestion, 
  AIResponse, 
  AIModel 
} from './types';

// Re-export model selection utilities
export { 
  selectOptimalModel 
} from './models';

// Re-export insights functionality
export { 
  generateInsightsFromReflections,
  getPersonalizedRecommendations 
} from './insights';

// Re-export assistant functionality
export { 
  askAIAssistant 
} from './assistant';

// Re-export cache utilities
export {
  getCachedResponse,
  cacheResponse
} from './cache';

// Re-export fallback utilities
export {
  findFallbackResponse,
  createFallbackResponse,
  FALLBACK_RESPONSES
} from './fallback';

// Import all the functionality we're exporting in the aiService object
import { generateInsightsFromReflections, getPersonalizedRecommendations } from './insights';
import { askAIAssistant } from './assistant';

// Export the service as a consolidated object for easier imports
export const aiService = {
  generateInsightsFromReflections,
  askAIAssistant,
  getPersonalizedRecommendations
};
