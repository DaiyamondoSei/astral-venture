
/**
 * Main export file for emotion analysis utilities
 */

// Re-export all types and functions for backward compatibility
export * from './types';
export * from './mappings';
export * from './dreamAnalysis';
export * from './reflectionAnalysis';
export * from './chakraUtils';

// Export the new enhanced emotional depth evaluation functions
export { evaluateEmotionalDepth, calculateEmotionalIntelligence } from './reflectionAnalysis';
