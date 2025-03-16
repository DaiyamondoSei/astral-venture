
/**
 * Central export file for all emotion-related utilities
 * 
 * This file serves as the single source of truth for exports
 * from the emotion module, following interface synchronization
 * best practices.
 */

// Export reflection content analysis
export { analyzeReflectionContent } from './analysis/reflectionContentAnalyzer';

// Export depth evaluation utilities
export { 
  evaluateEmotionalDepth, 
  getDepthCategory, 
  getDepthFeedback 
} from './analysis/depthEvaluator';

// Export emotional intelligence calculator
export { 
  calculateEmotionalIntelligence 
} from './analysis/intelligenceCalculator';

// Export chakra utilities
export {
  getChakraNames,
  getChakraColors,
  getChakraColor,
  getChakraName,
  calculateChakraBalance,
  addReflectionBasedChakras,
  calculateEmotionalGrowth,
  getChakraIntensity,
  getChakraResonance,
  normalizeChakraData
} from './chakraUtils';

// Export chakra analysis utilities
export { 
  analyzeChakraActivation, 
  getActivatedChakraNames 
} from './chakra/analysis';

// Export dream analysis utilities
export { 
  analyzeDreamTheme 
} from './dreamAnalysis';

// Export generic emotion utilities
export * from './types';
export * from './mappings';

// Export constants following the Type-Value Pattern
export * from './constants';
