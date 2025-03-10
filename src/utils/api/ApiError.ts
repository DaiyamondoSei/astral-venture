
/**
 * Comprehensive API Error class
 * Advanced error handling for network requests with error categorization and recovery strategies
 */
export enum ApiErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

export enum HttpStatusCategory {
  INFO = 'info',           // 100-199
  SUCCESS = 'success',     // 200-299
  REDIRECT = 'redirect',   // 300-399
  CLIENT_ERROR = 'client', // 400-499
  SERVER_ERROR = 'server', // 500-599
  UNKNOWN = 'unknown'      // everything else
}

export type ApiErrorRecoveryStrategy = 
  | 'retry'
  | 'auth-refresh'
  | 'offline-queue'
  | 'fallback-data'
  | 'manual-resolution'
  | 'none';

export interface ApiErrorContext {
  endpoint?: string;
  method?: string;
  requestId?: string;
  timestamp?: string;
  statusCode?: number;
  responseData?: any;
  requestData?: any;
  retryCount?: number;
  serviceId?: string;
}

export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly statusCategory?: HttpStatusCategory;
  public readonly context: ApiErrorContext;
  public readonly recoveryStrategy: ApiErrorRecoveryStrategy;
  public readonly originalError?: Error;
  public readonly retryable: boolean;
  
  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN,
    statusCode?: number,
    context: ApiErrorContext = {},
    recoveryStrategy: ApiErrorRecoveryStrategy = 'none',
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.statusCategory = statusCode ? this.getStatusCategory(statusCode) : undefined;
    this.context = context;
    this.recoveryStrategy = recoveryStrategy;
    this.originalError = originalError;
    this.retryable = this.isRetryable();
    
    // Maintain the prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Add timestamp if not provided
    if (!this.context.timestamp) {
      this.context.timestamp = new Date().toISOString();
    }
  }
  
  /**
   * Determine if this error should be retried
   */
  private isRetryable(): boolean {
    // Network errors, timeouts, and certain server errors can be retried
    if (
      this.type === ApiErrorType.NETWORK ||
      this.type === ApiErrorType.TIMEOUT ||
      (this.type === ApiErrorType.SERVER && this.statusCode && this.statusCode >= 500 && this.statusCode !== 501)
    ) {
      return true;
    }
    
    // Some rate limit errors can be retried after a delay
    if (this.type === ApiErrorType.RATE_LIMIT) {
      return true;
    }
    
    // Offline errors can be queued for retry when online
    if (this.type === ApiErrorType.OFFLINE) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get HTTP status category based on status code
   */
  private getStatusCategory(status: number): HttpStatusCategory {
    if (status >= 100 && status < 200) return HttpStatusCategory.INFO;
    if (status >= 200 && status < 300) return HttpStatusCategory.SUCCESS;
    if (status >= 300 && status < 400) return HttpStatusCategory.REDIRECT;
    if (status >= 400 && status < 500) return HttpStatusCategory.CLIENT_ERROR;
    if (status >= 500 && status < 600) return HttpStatusCategory.SERVER_ERROR;
    return HttpStatusCategory.UNKNOWN;
  }
  
  /**
   * Create a network error
   */
  static network(message: string, context?: ApiErrorContext, originalError?: Error): ApiError {
    return new ApiError(
      message || 'Network error occurred',
      ApiErrorType.NETWORK,
      undefined,
      context,
      'retry',
      originalError
    );
  }
  
  /**
   * Create a timeout error
   */
  static timeout(context?: ApiErrorContext, originalError?: Error): ApiError {
    return new ApiError(
      'Request timeout exceeded',
      ApiErrorType.TIMEOUT,
      408,
      context,
      'retry',
      originalError
    );
  }
  
  /**
   * Create an authentication error
   */
  static auth(message: string, statusCode?: number, context?: ApiErrorContext): ApiError {
    return new ApiError(
      message || 'Authentication failed',
      ApiErrorType.AUTH,
      statusCode || 401,
      context,
      'auth-refresh'
    );
  }
  
  /**
   * Create a server error
   */
  static server(message: string, statusCode?: number, context?: ApiErrorContext): ApiError {
    return new ApiError(
      message || 'Server error occurred',
      ApiErrorType.SERVER,
      statusCode || 500,
      context,
      'retry'
    );
  }
  
  /**
   * Create a client error
   */
  static client(message: string, statusCode?: number, context?: ApiErrorContext): ApiError {
    return new ApiError(
      message || 'Client error occurred',
      ApiErrorType.CLIENT,
      statusCode || 400,
      context,
      'none'
    );
  }
  
  /**
   * Create a rate limit error
   */
  static rateLimit(retryAfter?: number, context?: ApiErrorContext): ApiError {
    const errorContext = {
      ...(context || {}),
      retryAfter
    };
    
    return new ApiError(
      'Rate limit exceeded',
      ApiErrorType.RATE_LIMIT,
      429,
      errorContext,
      'retry'
    );
  }
  
  /**
   * Create an offline error
   */
  static offline(context?: ApiErrorContext): ApiError {
    return new ApiError(
      'No internet connection',
      ApiErrorType.OFFLINE,
      undefined,
      context,
      'offline-queue'
    );
  }
  
  /**
   * Create a validation error
   */
  static validation(message: string, fieldErrors?: Record<string, string[]>, context?: ApiErrorContext): ApiError {
    const errorContext = {
      ...(context || {}),
      fieldErrors
    };
    
    return new ApiError(
      message || 'Validation failed',
      ApiErrorType.VALIDATION,
      422,
      errorContext,
      'none'
    );
  }
  
  /**
   * Create an error from an HTTP response
   */
  static fromResponse(response: Response, responseData?: any, requestContext?: ApiErrorContext): ApiError {
    const status = response.status;
    const context = {
      ...requestContext,
      statusCode: status,
      responseData,
      method: requestContext?.method || 'GET',
      endpoint: requestContext?.endpoint || response.url
    };
    
    // Authentication errors
    if (status === 401 || status === 403) {
      return ApiError.auth(
        responseData?.message || response.statusText || 'Authentication failed',
        status,
        context
      );
    }
    
    // Rate limiting
    if (status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      return ApiError.rateLimit(retryAfter, context);
    }
    
    // Server errors
    if (status >= 500) {
      return ApiError.server(
        responseData?.message || response.statusText || 'Server error',
        status,
        context
      );
    }
    
    // Validation errors
    if (status === 422 || status === 400) {
      return ApiError.validation(
        responseData?.message || response.statusText || 'Validation failed',
        responseData?.errors || responseData?.fieldErrors,
        context
      );
    }
    
    // Generic client errors for all other 4xx
    if (status >= 400 && status < 500) {
      return ApiError.client(
        responseData?.message || response.statusText || 'Client error',
        status,
        context
      );
    }
    
    // Fallback for any other status codes
    return new ApiError(
      responseData?.message || response.statusText || 'Unknown error',
      ApiErrorType.UNKNOWN,
      status,
      context,
      'none'
    );
  }
  
  /**
   * Convert from generic error
   */
  static fromError(error: Error, context?: ApiErrorContext): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    // Network errors
    if (
      error.name === 'NetworkError' || 
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      return ApiError.network(error.message, context, error);
    }
    
    // Timeout errors
    if (
      error.name === 'TimeoutError' ||
      error.message.includes('timeout') ||
      error.message.includes('timed out')
    ) {
      return ApiError.timeout(context, error);
    }
    
    // Generic fallback
    return new ApiError(
      error.message,
      ApiErrorType.UNKNOWN,
      undefined,
      context,
      'none',
      error
    );
  }
  
  /**
   * Create a more user-friendly message for this error
   */
  getUserMessage(): string {
    switch (this.type) {
      case ApiErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      
      case ApiErrorType.OFFLINE:
        return 'You appear to be offline. Your request will be sent when you reconnect.';
      
      case ApiErrorType.TIMEOUT:
        return 'The request took too long to complete. Please try again.';
      
      case ApiErrorType.AUTH:
        return 'You need to log in again to continue.';
      
      case ApiErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.';
      
      case ApiErrorType.SERVER:
        return 'Something went wrong on our end. Our team has been notified. Please try again later.';
      
      case ApiErrorType.VALIDATION:
        return this.message || 'Please check your input and try again.';
      
      case ApiErrorType.CLIENT:
        return this.message || 'Please check your request and try again.';
      
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
  
  /**
   * Generate a detailed log message for debugging
   */
  getLogDetails(): Record<string, any> {
    return {
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
      statusCategory: this.statusCategory,
      context: this.context,
      recoveryStrategy: this.recoveryStrategy,
      retryable: this.retryable,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

export default ApiError;
