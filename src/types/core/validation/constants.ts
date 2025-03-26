
/**
 * Simplified Validation Constants
 */

import { ValidationErrorCode, ValidationSeverity } from './types';

// Validation error codes
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  VALIDATION_FAILED: 'VALIDATION_FAILED' as ValidationErrorCode,
};

// Validation error severities
export const ErrorSeverities = {
  ERROR: 'error' as ValidationSeverity,
  WARNING: 'warning' as ValidationSeverity,
  INFO: 'info' as ValidationSeverity
};
