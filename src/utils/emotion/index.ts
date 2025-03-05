
/**
 * Main export file for emotion analysis utilities
 */

// Re-export all types and functions for backward compatibility
export * from './types';
export * from './mappings';
export * from './dreamAnalysis';
export * from './reflectionAnalysis';
export * from './chakraUtils';

// Re-export from new files for direct access
export { analyzeReflectionContent } from './analysis/reflectionContentAnalyzer';
export { evaluateEmotionalDepth } from './analysis/depthEvaluator';
export { calculateEmotionalIntelligence } from './analysis/intelligenceCalculator';
export { addReflectionBasedChakras } from './chakra/reflectionActivation';
export { calculateEmotionalGrowth } from './chakra/emotionalGrowth';
