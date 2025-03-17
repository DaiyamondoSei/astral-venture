
/**
 * AppError Class
 * 
 * Standard error class for application-wide use.
 */
import { ErrorCategory, ErrorSeverity } from './types';

interface AppErrorOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  code?: string;
  context?: Record<string, unknown> | string;
  cause?: Error | unknown;
  statusCode?: number;
  userMessage?: string;
}

/**
 * Application error class with enhanced metadata
 */
export class AppError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  context?: Record<string, unknown>;
  cause?: Error | unknown;
  statusCode?: number;
  userMessage: string;
  
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.category = options.category || 'unknown';
    this.severity = options.severity || 'error';
    this.code = options.code || 'APP_ERROR';
    this.userMessage = options.userMessage || 'An error occurred';
    this.statusCode = options.statusCode;
    
    // Set context
    if (options.context) {
      if (typeof options.context === 'string') {
        this.context = { source: options.context };
      } else {
        this.context = options.context;
      }
    }
    
    // Set cause
    if (options.cause) {
      this.cause = options.cause;
    }
    
    // Required for extending Error in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
  
  /**
   * Check if error is an AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

/**
 * Create an AppError from any error
 */
export function createAppError(error: unknown, options: AppErrorOptions = {}): AppError {
  if (AppError.isAppError(error)) {
    // Already an AppError, just update with any new options
    return Object.assign(error, {
      ...options
    });
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, {
      ...options,
      cause: error
    });
  }
  
  return new AppError(
    typeof error === 'string' ? error : 'Unknown error',
    options
  );
}

export default AppError;
