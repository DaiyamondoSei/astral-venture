
/**
 * Core Types Index
 * 
 * This module serves as the central barrel export for all core types
 * used throughout the application.
 * 
 * @category Core
 * @version 1.0.0
 */

// Base types
export * from './base/primitives';
export * from './base/branded';
export * from './base/generic';

// Validation types
export * from './validation/results';

// Performance types
export * from './performance/metrics';
export * from './performance/config';

// Type guards
export {
  isUUID,
  isTimestamp,
  isEnergyPoints,
  isDateString
} from './base/branded';

export {
  isValidationErrorDetail,
  isValidationResult,
  createValidSuccess,
  createValidError,
  createValidErrors
} from './validation/results';

export {
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory,
  isPerformanceMetric,
  isWebVitalMetric,
  isComponentMetrics
} from './performance/metrics';
