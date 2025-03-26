
/**
 * Core Validation System
 * 
 * Re-exports all validation-related types, constants, and utilities
 */

// Export main type definitions
export * from './types';

// Export constants
export * from './constants';

// Export result utilities
export * from './results';

// Following the Type-Value pattern, create type guards for runtime values

/**
 * Type guard for ValidationSeverity
 */
export function isValidationSeverity(value: unknown): value is ValidationSeverity {
  return typeof value === 'string' && 
    Object.values(ErrorSeverities).includes(value as any);
}

/**
 * Type guard for ValidationErrorCode
 */
export function isValidationErrorCode(value: unknown): value is ValidationErrorCode {
  return typeof value === 'string' && 
    Object.values(ValidationErrorCodes).includes(value as any);
}

/**
 * Type guard for ValidationErrorDetail
 */
export function isValidationErrorDetail(value: unknown): value is ValidationErrorDetail {
  return typeof value === 'object' && 
    value !== null && 
    'path' in value && 
    'message' in value;
}

/**
 * Type guard for ValidationResult
 */
export function isValidationResult<T>(value: unknown): value is ValidationResult<T> {
  return typeof value === 'object' && 
    value !== null && 
    'isValid' in value;
}

/**
 * Type guard for MetricType
 */
export function isMetricType(value: unknown): value is MetricType {
  return typeof value === 'string' && 
    Object.values(MetricTypes).includes(value as any);
}

/**
 * Type guard for WebVitalCategory
 */
export function isWebVitalCategory(value: unknown): value is WebVitalCategory {
  return typeof value === 'string' && 
    Object.values(WebVitalCategories).includes(value as any);
}

/**
 * Type guard for WebVitalName
 */
export function isWebVitalName(value: unknown): value is WebVitalName {
  return typeof value === 'string' && 
    Object.values(WebVitalNames).includes(value as any);
}
