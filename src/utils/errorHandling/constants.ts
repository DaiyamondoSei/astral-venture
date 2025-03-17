
/**
 * Error handling system constants
 * Following the Type-Value Pattern
 */
import { ErrorCategory, ErrorSeverity } from './types';

// Runtime values for ErrorCategory
export const ErrorCategories = {
  VALIDATION: 'validation' as ErrorCategory,
  NETWORK: 'network' as ErrorCategory,
  API: 'api' as ErrorCategory,
  AUTH: 'auth' as ErrorCategory,
  DATABASE: 'database' as ErrorCategory,
  UI: 'ui' as ErrorCategory,
  SYSTEM: 'system' as ErrorCategory,
  UNKNOWN: 'unknown' as ErrorCategory
} as const;

// Runtime values for ErrorSeverity
export const ErrorSeverities = {
  CRITICAL: 'critical' as ErrorSeverity,
  HIGH: 'high' as ErrorSeverity,
  MEDIUM: 'medium' as ErrorSeverity,
  LOW: 'low' as ErrorSeverity
} as const;

// Map validation severity to error severity
export const mapValidationToErrorSeverity = (
  validationSeverity: import('../validation/types').ErrorSeverity
): ErrorSeverity => {
  switch (validationSeverity) {
    case 'error':
      return ErrorSeverities.HIGH;
    case 'warning':
      return ErrorSeverities.MEDIUM;
    case 'info':
      return ErrorSeverities.LOW;
    default:
      return ErrorSeverities.MEDIUM;
  }
};
