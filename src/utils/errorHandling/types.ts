
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
  context?: Record<string, unknown>;
  userId?: string;
  severity?: ErrorSeverity;
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
  resetErrorBoundary: () => void;
}
