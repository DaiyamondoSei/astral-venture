
/**
 * API Error Handler
 * 
 * Provides utilities for handling API errors consistently across the application.
 */

export class ApiError extends Error {
  public readonly code: ApiError.ErrorCode;
  public readonly context?: Record<string, any>;
  public readonly originalError?: any;

  constructor(
    message: string,
    code: ApiError.ErrorCode = ApiError.ErrorCode.GENERIC_ERROR,
    options: {
      context?: Record<string, any>;
      originalError?: any;
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.context = options.context;
    this.originalError = options.originalError;
  }

  /**
   * Get a user-friendly message for this error
   */
  public getUserMessage(): string {
    // Default user-friendly messages for different error codes
    switch (this.code) {
      case ApiError.ErrorCode.NETWORK_ERROR:
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      
      case ApiError.ErrorCode.AUTHENTICATION_ERROR:
        return 'Authentication failed. Please sign in again.';
      
      case ApiError.ErrorCode.AUTHORIZATION_ERROR:
        return 'You do not have permission to perform this action.';
      
      case ApiError.ErrorCode.RESOURCE_NOT_FOUND:
        return 'The requested resource could not be found.';
      
      case ApiError.ErrorCode.VALIDATION_ERROR:
        return 'The provided information is invalid. Please check your inputs and try again.';
      
      case ApiError.ErrorCode.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please try again later.';
      
      case ApiError.ErrorCode.SERVER_ERROR:
        return 'Server error occurred. We\'ve been notified and are working on a fix.';
      
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
}

// Namespace for error codes
export namespace ApiError {
  export enum ErrorCode {
    GENERIC_ERROR = 'generic_error',
    NETWORK_ERROR = 'network_error',
    AUTHENTICATION_ERROR = 'authentication_error',
    AUTHORIZATION_ERROR = 'authorization_error',
    RESOURCE_NOT_FOUND = 'resource_not_found',
    VALIDATION_ERROR = 'validation_error',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    SERVER_ERROR = 'server_error',
    API_ERROR = 'api_error',
    DATABASE_ERROR = 'database_error'
  }
}

/**
 * Handle an API error and perform appropriate actions
 */
export function handleApiError(
  error: any,
  options: {
    showToast?: boolean;
    logToConsole?: boolean;
    logToServer?: boolean;
    onError?: (error: ApiError) => void;
  } = {
    showToast: true,
    logToConsole: true,
    logToServer: false
  }
): ApiError {
  // Convert to ApiError if not already
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(
        error?.message || 'An unknown error occurred',
        ApiError.ErrorCode.GENERIC_ERROR,
        { originalError: error }
      );
  
  // Log to console if enabled
  if (options.logToConsole) {
    console.error('[API Error]', apiError);
    if (apiError.originalError) {
      console.error('[Original Error]', apiError.originalError);
    }
  }
  
  // Show toast if enabled
  if (options.showToast) {
    // This would use a toast service
    // toast.error(apiError.getUserMessage());
    console.error('[Toast]', apiError.getUserMessage());
  }
  
  // Log to server if enabled
  if (options.logToServer) {
    // Implementation would depend on server logging setup
    console.log('[Would log to server]', apiError);
  }
  
  // Call custom error handler if provided
  if (options.onError) {
    options.onError(apiError);
  }
  
  return apiError;
}
