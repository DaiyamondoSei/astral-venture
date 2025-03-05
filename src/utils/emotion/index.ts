
/**
 * Central export file for all emotion-related utilities
 */

// Re-export from focused utility files
export { analyzeReflectionContent } from './analysis/reflectionContentAnalyzer';
export { evaluateEmotionalDepth, getDepthCategory, getDepthFeedback } from './analysis/depthEvaluator';
export { calculateEmotionalIntelligence } from './analysis/intelligenceCalculator';

// Export chakra-related utilities
export { calculateEmotionalGrowth } from './chakra/emotionalGrowth';
export { analyzeChakraActivation, getActivatedChakraNames } from './chakra/analysis';
export { getChakraIntensity } from './chakra/intensity';

// Export dream analysis utilities
export { analyzeDreamTheme } from './dreamAnalysis';

// Export generic emotion utilities
export * from './types';
export * from './mappings';
export * from './chakraUtils';
