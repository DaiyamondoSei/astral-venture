
/**
 * Error reporting utilities
 * Centralizes error reporting functionality
 */
import { ValidationErrorDetail } from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

// Report an error to the console and any monitoring services
export function reportError(error: Error, context?: Record<string, unknown>): void {
  console.error('[Error]', error.message, context || {});
  
  // In production, this would send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Integration with error monitoring would go here
  }
}

// Capture an exception for monitoring
export function captureException(error: Error, context?: Record<string, unknown>): void {
  reportError(error, context);
}

// Report a validation error
export function reportValidationError(errors: ValidationErrorDetail[]): void {
  errors.forEach(error => {
    const severity = error.severity === ErrorSeverities.ERROR ? 'error' : 
                     error.severity === ErrorSeverities.WARNING ? 'warn' : 'info';
    
    if (severity === 'error') {
      console.error(`[Validation Error] ${error.path}: ${error.message} (${error.code})`);
    } else if (severity === 'warn') {
      console.warn(`[Validation Warning] ${error.path}: ${error.message} (${error.code})`);
    } else {
      console.info(`[Validation Info] ${error.path}: ${error.message} (${error.code})`);
    }
  });
}

// Create a validation error detail
export function createValidationError(
  path: string,
  message: string,
  code: string = ValidationErrorCodes.UNKNOWN_ERROR,
  severity: string = ErrorSeverities.ERROR
): ValidationErrorDetail {
  return {
    path,
    message,
    code: code as ValidationErrorDetail['code'],
    severity: severity as ValidationErrorDetail['severity']
  };
}

// Format validation errors for display
export function formatValidationErrors(errors: ValidationErrorDetail[]): string {
  return errors.map(err => `${err.path}: ${err.message}`).join('\n');
}

// Get a user-friendly error message
export function getUserFriendlyErrorMessage(error: Error | unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof Error) {
    // Remove technical details for user-facing messages
    let message = error.message.replace(/Error:/gi, '').trim();
    
    // Shorten very long messages
    if (message.length > 150) {
      message = message.substring(0, 147) + '...';
    }
    
    return message;
  }
  
  return String(error);
}
