
/**
 * Error Handling System
 * 
 * Central export file for all error handling tools
 */

// Export core types and constants
export * from './types';
export * from './constants';

// Export core error handling utilities
export { default as handleError } from './handleError';
export { default as AppError } from './AppError';

// Export error components
export { default as ErrorBoundary } from '../../components/error-handling/ErrorBoundary';
export { default as ErrorFallback } from '../../components/error-handling/ErrorFallback';
export { default as withErrorBoundary } from '../../components/error-handling/withErrorBoundary';

// Export error handlers for specific error types
export { default as apiErrorHandler } from './handlers/apiErrorHandler';
export { default as networkErrorHandler } from './handlers/networkErrorHandler';
export { default as validationErrorHandler } from './handlers/validationErrorHandler';

// Export error display utilities
export * from './errorDisplay';
export * from './errorClassification';

// Export error reporter
export { default as errorReporter } from './errorReporter';

// Export createAppError utility
export { default as createAppError } from './AppError';
