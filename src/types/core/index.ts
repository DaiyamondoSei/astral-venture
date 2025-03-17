
/**
 * Core Types Index
 * 
 * This module serves as the central barrel export for all core types
 * used throughout the application.
 * 
 * @version 1.0.0
 */

// Base types
export * from './base/primitives';
export * from './base/branded';
export * from './base/generic';

// Validation types
export * from './validation';

// Performance types
export * from './performance';

// Type guards
export {
  isUUID,
  isTimestamp,
  isEnergyPoints,
  isDateString,
  asUUID,
  asTimestamp,
  asEnergyPoints,
  asDateString,
  safeCreateUUID
} from './base/branded';

export {
  hasId,
  ensureEntityId
} from './base/primitives';

export {
  isValidationErrorDetail,
  isValidationResult,
  createValidSuccess,
  createValidError,
  createValidErrors,
  ValidationError
} from './validation';

export {
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory,
  isComponentMetrics,
  ensureMetricId
} from './performance/metrics';
