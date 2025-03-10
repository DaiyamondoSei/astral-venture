
/**
 * Centralized error handling system exports
 */

// Core error types and utilities
export { 
  ErrorSeverity, 
  ErrorCategory,
  createAppError,
  isAppError,
  getUserErrorMessage,
  createValidationError,
  createApiError,
  createNetworkError,
  createPermissionError
} from './AppError';

// Error handling utilities
export {
  handleError,
  handleValidationError,
  handleApiError,
  withErrorHandling,
  type ErrorHandlingOptions
} from './handleError';

// Re-export error boundary for convenience
export { default as ErrorBoundary } from '../../components/error-handling/ErrorBoundary';
