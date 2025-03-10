
/**
 * Custom error class for API errors with enhanced metadata
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly recoverable: boolean;
  public readonly requestId?: string;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;
  public readonly context?: Record<string, unknown>;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    
    this.name = 'ApiError';
    this.statusCode = options.statusCode || 500;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.userMessage = options.userMessage || 'An error occurred while processing your request';
    this.recoverable = options.recoverable ?? true;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
    this.originalError = options.originalError;
    this.context = options.context;
    
    // Ensure stack trace is captured properly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create a network error instance
   */
  static network(message: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Network error occurred',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      statusCode: 0,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      retryable: true,
      originalError
    });
  }

  /**
   * Create an unauthorized error instance
   */
  static unauthorized(message?: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Authentication required',
      userMessage: 'Please log in to continue',
      statusCode: 401,
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
      originalError
    });
  }

  /**
   * Create a forbidden error instance
   */
  static forbidden(message?: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Access denied',
      userMessage: 'You do not have permission to perform this action',
      statusCode: 403,
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.WARNING,
      recoverable: false,
      retryable: false,
      originalError
    });
  }

  /**
   * Create a not found error instance
   */
  static notFound(message?: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Resource not found',
      userMessage: 'The requested resource could not be found',
      statusCode: 404,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
      originalError
    });
  }

  /**
   * Create a validation error instance
   */
  static validation(message: string, context?: Record<string, unknown>, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Validation error',
      userMessage: 'Please check your input and try again',
      statusCode: 400,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
      originalError,
      context
    });
  }

  /**
   * Create a server error instance
   */
  static server(message?: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Server error',
      userMessage: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.ERROR,
      recoverable: false,
      retryable: true,
      originalError
    });
  }

  /**
   * Create a timeout error instance
   */
  static timeout(message?: string, originalError?: unknown): ApiError {
    return new ApiError({
      message: message || 'Request timeout',
      userMessage: 'The request took too long to complete. Please try again.',
      statusCode: 408,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.WARNING,
      recoverable: true,
      retryable: true,
      originalError
    });
  }

  /**
   * Check if an error is an instance of ApiError
   */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  /**
   * Convert any error to an ApiError
   */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      // Handle network errors
      if (
        /network|failed to fetch|internet|connection/i.test(error.message) ||
        error.name === 'NetworkError'
      ) {
        return ApiError.network(error.message, error);
      }

      // Handle timeout errors
      if (/timeout|timed out/i.test(error.message)) {
        return ApiError.timeout(error.message, error);
      }

      return new ApiError({
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again later.',
        statusCode: 500,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.ERROR,
        recoverable: true,
        retryable: true,
        originalError: error
      });
    }

    // Handle non-Error objects
    return new ApiError({
      message: String(error),
      userMessage: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      recoverable: true,
      retryable: true,
      originalError: error
    });
  }
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
  CONNECTIVITY = 'connectivity'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Options for the ApiError constructor
 */
export interface ApiErrorOptions {
  message: string;
  userMessage?: string;
  statusCode?: number;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  recoverable?: boolean;
  requestId?: string;
  retryable?: boolean;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  retry?: boolean;
  fallbackData?: unknown;
  rethrow?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
