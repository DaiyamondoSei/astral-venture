
import { handleError, ErrorHandlingOptions } from '../handleError';
import { ErrorSeverity, ErrorCategory, createApiError } from '../AppError';

/**
 * Specialized options for API error handling
 */
export interface ApiErrorHandlingOptions extends ErrorHandlingOptions {
  endpoint?: string;
  method?: string;
  retryCount?: number;
}

/**
 * Specialized error handler for API errors
 */
export function handleApiError(
  error: unknown,
  options: ApiErrorHandlingOptions = {}
) {
  const { endpoint, method, retryCount, ...baseOptions } = options;
  
  // Create enhanced context with API-specific information
  const apiContext = {
    ...baseOptions.context,
    endpoint,
    method,
    retryCount
  };
  
  // Use standardized error handling with API-specific defaults
  return handleError(error, {
    showToast: true,
    logToServer: true,
    throwError: false,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.API,
    context: apiContext,
    ...baseOptions
  });
}

/**
 * Create a specialized API error with details about the request
 */
export function createEnhancedApiError(
  message: string,
  originalError: unknown,
  endpoint?: string,
  method?: string
) {
  return createApiError(message, originalError, {
    context: {
      endpoint,
      method,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Wrap an async function to apply standard API error handling
 */
export function withApiErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ApiErrorHandlingOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, options);
      throw error;
    }
  };
}
