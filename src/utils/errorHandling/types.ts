
/**
 * Error Handling Type Definitions
 * 
 * Common type definitions for the error handling system
 */

/**
 * Severity levels for errors
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Categories of errors for better organization and handling
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  UNEXPECTED = 'unexpected',
  BUSINESS_LOGIC = 'business_logic',
  UI = 'ui',
  DATA_PROCESSING = 'data_processing',
  EXTERNAL_SERVICE = 'external_service'
}

/**
 * Options for error handling
 */
export interface ErrorHandlingOptions {
  /** User context where the error occurred */
  context?: string;
  
  /** Additional metadata for error tracking */
  metadata?: Record<string, unknown>;
  
  /** Whether to display a toast notification */
  showToast?: boolean;
  
  /** Custom message to show in toast */
  customMessage?: string;
  
  /** Whether to log the error to the console */
  logToConsole?: boolean;
  
  /** Whether to log the error to the server */
  logToServer?: boolean;
  
  /** Whether to rethrow the error after handling */
  rethrow?: boolean;
  
  /** Whether to track the user when reporting the error */
  captureUser?: boolean;
  
  /** Custom callback to run when the error occurs */
  onError?: (error: any) => void;
  
  /** Error severity level */
  severity?: ErrorSeverity;
  
  /** Error category */
  category?: ErrorCategory;
  
  /** Whether it's a validation error */
  isValidation?: boolean;
  
  /** Whether to include validation details */
  includeValidationDetails?: boolean;
}

/**
 * Represents a structured error log entry
 */
export interface ErrorLogEntry {
  /** Timestamp when the error occurred */
  timestamp: string;
  
  /** Error severity level */
  severity: ErrorSeverity;
  
  /** Error category */
  category: ErrorCategory;
  
  /** Error message */
  message: string;
  
  /** User-friendly error message */
  userMessage?: string;
  
  /** Location where the error occurred */
  location?: string;
  
  /** Additional context for the error */
  context?: Record<string, unknown>;
  
  /** Error stack trace */
  stackTrace?: string;
  
  /** User ID or session ID if available */
  userId?: string;
  
  /** Browser and device information */
  clientInfo?: {
    userAgent?: string;
    locale?: string;
    viewport?: {
      width: number;
      height: number;
    };
  };
}
