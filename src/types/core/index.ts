
/**
 * Core Type System
 * 
 * This module exports all core types used throughout the application
 */

// Base types
export * from './base/primitives';
export * from './base/branded';
export * from './base/generic';

// Validation system types
export * from './validation/types';
export * from './validation/constants';
export * from './validation/results';
export * from './validation/index';

// Performance system types
export * from './performance/types';
export * from './performance/constants';
export * from './performance/metrics';

// Export type guards for performance
export {
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory,
  isComponentMetrics,
  ensureMetricId
} from './performance/metrics';

// Export validation helpers
export {
  success,
  failure,
  fromValidationError,
  fromError,
  unwrap,
  unwrapOr,
  createValidator
} from './validation/results';

// Export validation type guards
export {
  isValidationSeverity,
  isValidationErrorCode,
  isValidationErrorDetail,
  isValidationResult,
  isMetricType,
  isWebVitalCategory,
  isWebVitalName
} from './validation/index';
