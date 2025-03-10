
/**
 * Application error class with enhanced capabilities for error handling,
 * tracking, and user feedback
 */

export enum ErrorSeverity {
  INFO = 'info',         // Informational, not really an error but something to note
  WARNING = 'warning',   // Warning, operation succeeded but with concerns
  ERROR = 'error',       // Error, operation failed but system is stable
  CRITICAL = 'critical'  // Critical, operation failed and system may be unstable
}

export enum ErrorCategory {
  VALIDATION = 'validation',     // Data validation errors
  AUTHENTICATION = 'auth',       // Authentication/authorization errors
  API = 'api',                   // External API errors
  NETWORK = 'network',           // Network-related errors
  DATABASE = 'database',         // Database errors
  STATE = 'state',               // Application state errors
  RENDERING = 'rendering',       // UI rendering errors
  PERFORMANCE = 'performance',   // Performance-related issues
  SECURITY = 'security',         // Security-related issues
  BUSINESS_LOGIC = 'business',   // Business logic errors
  UNKNOWN = 'unknown'            // Uncategorized errors
}

export interface AppErrorOptions {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  code?: string;
  suggestedAction?: string;
  userMessage?: string;
  context?: Record<string, unknown>;
  cause?: Error | unknown;
  isSilent?: boolean;
  isReportable?: boolean;
  isRetryable?: boolean;
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly code?: string;
  public readonly suggestedAction?: string;
  public readonly userMessage: string;
  public readonly context: Record<string, unknown>;
  public readonly cause?: Error | unknown;
  public readonly isSilent: boolean;
  public readonly isReportable: boolean;
  public readonly isRetryable: boolean;
  public readonly timestamp: Date;
  
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    
    this.name = 'AppError';
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.code = options.code;
    this.suggestedAction = options.suggestedAction;
    this.userMessage = options.userMessage || message;
    this.context = options.context || {};
    this.cause = options.cause;
    this.isSilent = options.isSilent || false;
    this.isReportable = options.isReportable !== false; // Default to true
    this.isRetryable = options.isRetryable || false;
    this.timestamp = new Date();
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
  
  /**
   * Get the original cause error message if available
   */
  get causeMessage(): string | undefined {
    if (!this.cause) return undefined;
    
    if (this.cause instanceof Error) {
      return this.cause.message;
    }
    
    return String(this.cause);
  }
  
  /**
   * Convert to a serializable object for logging or API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      code: this.code,
      suggestedAction: this.suggestedAction,
      userMessage: this.userMessage,
      context: this.context,
      causeMessage: this.causeMessage,
      timestamp: this.timestamp.toISOString()
    };
  }
  
  /**
   * Create a user-friendly version of the error
   */
  toUserError(): Pick<AppError, 'userMessage' | 'suggestedAction' | 'severity'> {
    return {
      userMessage: this.userMessage,
      suggestedAction: this.suggestedAction,
      severity: this.severity
    };
  }
  
  /**
   * Create a copy of the error with additional context
   */
  withContext(additionalContext: Record<string, unknown>): AppError {
    return new AppError(this.message, {
      ...this,
      context: {
        ...this.context,
        ...additionalContext
      }
    });
  }
  
  /**
   * Create a copy of the error with a different severity
   */
  withSeverity(severity: ErrorSeverity): AppError {
    return new AppError(this.message, {
      ...this,
      severity
    });
  }
}

/**
 * Create an AppError from any error or unknown value
 */
export function createAppError(
  error: unknown,
  options: AppErrorOptions = {}
): AppError {
  if (error instanceof AppError) {
    // If already an AppError, merge in new options if provided
    if (Object.keys(options).length > 0) {
      return new AppError(error.message, {
        ...error,
        ...options,
        context: {
          ...error.context,
          ...(options.context || {})
        }
      });
    }
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, {
      ...options,
      cause: error
    });
  }
  
  const message = typeof error === 'string' 
    ? error 
    : 'An unknown error occurred';
  
  return new AppError(message, {
    ...options,
    cause: error
  });
}
