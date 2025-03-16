
/**
 * Error handling constants
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
