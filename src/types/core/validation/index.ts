
/**
 * Central export file for validation types and constants
 * This ensures all validation-related types and constants are properly exported
 */

// Export all validation types
export * from './types';

// Export constants using the Type-Value Pattern
export * from './constants';

// Export validation result types
export * from './results';

// Additional utilities and type guards
export const isValidationErrorCode = (code: string): code is import('./types').ValidationErrorCode => {
  return Object.values(import('./constants').ValidationErrorCodes).includes(code as any);
};

export const isErrorSeverity = (severity: string): severity is import('./types').ErrorSeverity => {
  return Object.values(import('./constants').ErrorSeverities).includes(severity as any);
};

// Default export for easier imports
export default {
  ErrorSeverities: import('./constants').ErrorSeverities,
  ValidationErrorCodes: import('./constants').ValidationErrorCodes
};
