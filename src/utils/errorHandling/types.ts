
/**
 * Error Handling Types
 * 
 * This module provides types for the error handling system.
 */

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'low' | 'medium' | 'high';

export type ErrorCategory = 
  | 'validation' 
  | 'authentication' 
  | 'authorization' 
  | 'network' 
  | 'database' 
  | 'api' 
  | 'internal' 
  | 'ui'
  | 'performance'
  | 'security'
  | 'unknown';

export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  reportToService?: boolean;
  showToUser?: boolean;
  showToast?: boolean;
  context?: Record<string, unknown> | string;
  userId?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  customMessage?: string;
  onError?: (error: Error) => void;
  rethrow?: boolean;
  isValidation?: boolean;
  includeValidationDetails?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ErrorReportOptions {
  userId?: string;
  context?: Record<string, unknown>;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  tags?: string[];
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorFallbackProps {
  error: Error;
  componentName?: string;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
}
