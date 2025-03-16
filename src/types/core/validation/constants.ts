
/**
 * Validation system constants
 * Following the Type-Value Pattern
 */
import { ValidationErrorCode, ErrorSeverity } from './types';

// Runtime values for ValidationErrorCode
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  MIN_LENGTH_ERROR: 'MIN_LENGTH_ERROR' as ValidationErrorCode,
  MAX_LENGTH_ERROR: 'MAX_LENGTH_ERROR' as ValidationErrorCode,
  MIN_VALUE_ERROR: 'MIN_VALUE_ERROR' as ValidationErrorCode,
  MAX_VALUE_ERROR: 'MAX_VALUE_ERROR' as ValidationErrorCode,
  PATTERN_ERROR: 'PATTERN_ERROR' as ValidationErrorCode,
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR' as ValidationErrorCode,
  FIELD_REQUIRED: 'FIELD_REQUIRED' as ValidationErrorCode,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as ValidationErrorCode
} as const;

// Runtime values for ErrorSeverity
export const ErrorSeverities = {
  ERROR: 'error' as ErrorSeverity,
  WARNING: 'warning' as ErrorSeverity,
  INFO: 'info' as ErrorSeverity
} as const;
