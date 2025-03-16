
/**
 * Error handling type definitions
 * Following the Type-Value Pattern
 */

// Error categories
export type ErrorCategory = 
  | 'validation' 
  | 'network' 
  | 'api' 
  | 'auth' 
  | 'database' 
  | 'ui' 
  | 'system' 
  | 'unknown';

// Error severity levels
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

// Error handling options
export interface ErrorHandlingOptions {
  showToUser?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  rethrow?: boolean;
  showToast?: boolean;
  context?: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  customMessage?: string;
  isValidation?: boolean;
  includeValidationDetails?: boolean;
  metadata?: Record<string, any>;
  logToServer?: boolean;
  onError?: (error: Error) => void;
}

// Application error options
export interface AppErrorOptions {
  message: string;
  originalError?: Error;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
  code?: string;
}

// Props for the error fallback component
export interface ErrorFallbackProps {
  error: Error;
  componentName?: string;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
}
