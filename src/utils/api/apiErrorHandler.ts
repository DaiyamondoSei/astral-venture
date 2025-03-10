
import { ValidationError } from '@/utils/validation/ValidationError';
import { AppError, ErrorSeverity, ErrorCategory } from '@/utils/errorHandling/AppError';
import { handleError } from '@/utils/errorHandling/handleError';

export interface ApiErrorContext {
  endpoint: string;
  method: string;
  status?: number;
  params?: Record<string, unknown>;
  responseData?: unknown;
  retryCount?: number;
}

/**
 * Unified API error handler
 * Processes various kinds of API errors and standardizes them
 */
export class ApiErrorHandler {
  /**
   * Handle a network error (e.g., timeout, no connection)
   */
  static handleNetworkError(
    error: Error,
    context: ApiErrorContext
  ): AppError {
    const { endpoint, method } = context;
    
    const appError = new AppError(
      `Network error when calling ${method} ${endpoint}: ${error.message}`,
      ErrorCategory.NETWORK,
      ErrorSeverity.ERROR
    );
    
    appError.recoverable = true;
    appError.userActionable = true;
    appError.actionLabel = 'Retry';
    appError.userMessage = 'Could not connect to the server. Please check your internet connection and try again.';
    appError.context = {
      endpoint,
      method,
      originalError: error,
      ...context
    };
    
    // Log the error using the central error handling system
    handleError(appError, {
      logToConsole: true,
      logToServer: true,
      throwError: false,
      showToast: true
    });
    
    return appError;
  }
  
  /**
   * Handle a server error (e.g., 500 Internal Server Error)
   */
  static handleServerError(
    error: Error,
    context: ApiErrorContext
  ): AppError {
    const { endpoint, method, status } = context;
    
    const appError = new AppError(
      `Server error when calling ${method} ${endpoint}: ${error.message}`,
      ErrorCategory.API,
      ErrorSeverity.ERROR
    );
    
    appError.recoverable = false;
    appError.userActionable = false;
    appError.userMessage = 'The server encountered an error while processing your request. Our team has been notified.';
    appError.context = {
      endpoint,
      method,
      status,
      originalError: error,
      ...context
    };
    
    // Log the error using the central error handling system
    handleError(appError, {
      logToConsole: true,
      logToServer: true,
      throwError: false,
      showToast: true
    });
    
    return appError;
  }
  
  /**
   * Handle an authentication error (e.g., 401 Unauthorized)
   */
  static handleAuthError(
    error: Error,
    context: ApiErrorContext
  ): AppError {
    const { endpoint, method, status } = context;
    
    const appError = new AppError(
      `Authentication error when calling ${method} ${endpoint}: ${error.message}`,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.WARNING
    );
    
    appError.recoverable = true;
    appError.userActionable = true;
    appError.actionLabel = 'Log In';
    appError.userMessage = 'Your session has expired. Please sign in again.';
    appError.context = {
      endpoint,
      method,
      status,
      originalError: error,
      ...context
    };
    
    // Log the error using the central error handling system
    handleError(appError, {
      logToConsole: true,
      logToServer: true,
      throwError: false,
      showToast: true
    });
    
    return appError;
  }
  
  /**
   * Handle a validation error (e.g., 400 Bad Request with validation failures)
   */
  static handleValidationError(
    error: ValidationError | Error,
    context: ApiErrorContext
  ): AppError {
    const { endpoint, method } = context;
    const isValidationError = error instanceof ValidationError;
    
    const appError = new AppError(
      isValidationError
        ? `Validation error in ${error.field}: ${error.message}`
        : `Validation error when calling ${method} ${endpoint}: ${error.message}`,
      ErrorCategory.VALIDATION,
      ErrorSeverity.WARNING
    );
    
    appError.recoverable = true;
    appError.userActionable = true;
    appError.userMessage = isValidationError
      ? `Please check the ${error.field} field and try again.`
      : 'Some of the information you provided is invalid. Please check your inputs and try again.';
    appError.context = {
      endpoint,
      method,
      originalError: error,
      ...context,
      ...(isValidationError ? {
        field: error.field,
        validationRule: error.rule,
        expectedType: error.expectedType
      } : {})
    };
    
    // Log the error using the central error handling system
    handleError(appError, {
      logToConsole: true,
      logToServer: false, // No need to log validation errors to server
      throwError: false,
      showToast: true
    });
    
    return appError;
  }
  
  /**
   * Handle a rate limiting error (e.g., 429 Too Many Requests)
   */
  static handleRateLimitError(
    error: Error,
    context: ApiErrorContext,
    retryAfter?: number
  ): AppError {
    const { endpoint, method } = context;
    
    const appError = new AppError(
      `Rate limited when calling ${method} ${endpoint}: ${error.message}`,
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.WARNING
    );
    
    appError.recoverable = true;
    appError.userActionable = retryAfter !== undefined;
    
    if (retryAfter !== undefined) {
      const seconds = Math.ceil(retryAfter);
      const waitMessage = seconds === 1 
        ? '1 second' 
        : `${seconds} seconds`;
      
      appError.actionLabel = `Retry in ${waitMessage}`;
      appError.userMessage = `You've made too many requests. Please wait ${waitMessage} before trying again.`;
    } else {
      appError.userMessage = 'You\'ve made too many requests. Please wait a moment before trying again.';
    }
    
    appError.context = {
      endpoint,
      method,
      retryAfter,
      originalError: error,
      ...context
    };
    
    // Log the error using the central error handling system
    handleError(appError, {
      logToConsole: true,
      logToServer: false, // No need to log rate limit errors to server
      throwError: false,
      showToast: true
    });
    
    return appError;
  }
  
  /**
   * Process any API error and categorize it appropriately
   */
  static processApiError(
    error: Error,
    context: ApiErrorContext
  ): AppError {
    const { status } = context;
    
    // Categorize based on status code if available
    if (status) {
      if (status === 401 || status === 403) {
        return this.handleAuthError(error, context);
      }
      
      if (status === 400 && error instanceof ValidationError) {
        return this.handleValidationError(error, context);
      }
      
      if (status === 429) {
        return this.handleRateLimitError(error, context);
      }
      
      if (status >= 500) {
        return this.handleServerError(error, context);
      }
    }
    
    // If error is a ValidationError, handle it appropriately
    if (error instanceof ValidationError) {
      return this.handleValidationError(error, context);
    }
    
    // Check for network errors
    if (
      error.message.includes('Network Error') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    ) {
      return this.handleNetworkError(error, context);
    }
    
    // Default to server error if we can't categorize
    return this.handleServerError(error, context);
  }
}

export default ApiErrorHandler;
