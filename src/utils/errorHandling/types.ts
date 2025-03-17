
/**
 * Error handling system types
 * Following the Type-Value Pattern for type safety
 */

// Error severity levels for the application
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

// Error categories for classification
export type ErrorCategory = 
  | 'validation' 
  | 'network' 
  | 'api' 
  | 'auth' 
  | 'database' 
  | 'ui' 
  | 'system' 
  | 'unknown';

// Error handling options
export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  reportToService?: boolean;
  showToUser?: boolean;
  context?: Record<string, unknown>;
  userId?: string;
  severity?: ErrorSeverity;
}

// Application error details
export interface AppErrorDetails {
  code?: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  originalError?: Error;
  context?: Record<string, unknown>;
  timestamp: number;
}

// Options for creating application errors
export interface AppErrorOptions {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  details?: Record<string, unknown>;
  context?: Record<string, unknown>;
  originalError?: Error;
}
