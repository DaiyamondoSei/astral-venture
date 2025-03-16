
/**
 * Unified error handling components and utilities
 * 
 * Provides a consistent API for error handling across the application
 */

// Export unified error boundary components
export { 
  default as ErrorBoundary,
  ErrorBoundaryProvider,
  withErrorBoundary 
} from './UnifiedErrorBoundary';

// Export error fallback components
export { default as ErrorFallback } from './ErrorFallback';

// Export error reporting utilities
export * from '../../utils/errorHandling/errorReporter';

// Export error handling types
export * from '../../utils/errorHandling/types';
