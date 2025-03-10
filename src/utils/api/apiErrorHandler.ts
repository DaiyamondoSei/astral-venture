
import ApiError, { ApiErrorType } from './ApiError';
import { toast } from 'sonner';
import { ErrorSeverity, ErrorCategory } from '@/utils/errorHandling/AppError';
import { handleError } from '@/utils/errorHandling/handleError';

// Error handling options
export interface ApiErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  throwError?: boolean;
  message?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  context?: Record<string, unknown>;
  fallbackData?: any;
  retryFn?: () => Promise<any>;
  retryCount?: number;
  maxRetries?: number;
}

// Default error handling options
const defaultOptions: ApiErrorHandlingOptions = {
  showToast: true,
  logToConsole: true,
  logToServer: true,
  throwError: true,
  severity: ErrorSeverity.ERROR,
  category: ErrorCategory.API
};

/**
 * Centralized API error handler with retry support
 */
export async function handleApiError(
  error: Error | ApiError | unknown,
  options: ApiErrorHandlingOptions = {}
): Promise<never> {
  // Merge with default options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Convert to ApiError if needed
  const apiError = error instanceof ApiError 
    ? error 
    : ApiError.fromError(error instanceof Error ? error : new Error(String(error)));
  
  // Custom error message if provided
  const errorMessage = mergedOptions.message || apiError.getUserMessage();
  
  // Show toast if enabled
  if (mergedOptions.showToast) {
    switch (apiError.type) {
      case ApiErrorType.OFFLINE:
        toast.warning(errorMessage, {
          description: 'Your request will be processed when you reconnect.'
        });
        break;
        
      case ApiErrorType.AUTH:
        toast.error(errorMessage, {
          description: 'Please try logging in again.'
        });
        break;
        
      case ApiErrorType.RATE_LIMIT:
        toast.warning(errorMessage, {
          description: `Please wait before trying again.`
        });
        break;
        
      case ApiErrorType.TIMEOUT:
        toast.error(errorMessage, {
          description: 'The server took too long to respond.'
        });
        break;
        
      default:
        toast.error(errorMessage);
    }
  }
  
  // Determine error category for central error handler
  const errorCategory = mergedOptions.category || (() => {
    switch (apiError.type) {
      case ApiErrorType.NETWORK:
      case ApiErrorType.TIMEOUT:
        return ErrorCategory.NETWORK;
        
      case ApiErrorType.AUTH:
        return ErrorCategory.AUTH;
        
      case ApiErrorType.VALIDATION:
        return ErrorCategory.VALIDATION;
        
      case ApiErrorType.OFFLINE:
        return ErrorCategory.CONNECTIVITY;
        
      default:
        return ErrorCategory.API;
    }
  })();
  
  // Build error context with API details
  const errorContext = {
    ...apiError.context,
    ...mergedOptions.context,
    apiErrorType: apiError.type,
    statusCode: apiError.statusCode,
    retryable: apiError.retryable
  };
  
  // Process through central error handling system
  handleError(apiError, {
    severity: mergedOptions.severity,
    category: errorCategory,
    showToast: false, // Already handled above
    logToConsole: mergedOptions.logToConsole,
    logToServer: mergedOptions.logToServer,
    throwError: false, // We'll handle throwing here
    context: errorContext
  });
  
  // Handle retry logic if provided
  if (
    apiError.retryable && 
    mergedOptions.retryFn && 
    mergedOptions.retryCount !== undefined && 
    mergedOptions.maxRetries !== undefined &&
    mergedOptions.retryCount < mergedOptions.maxRetries
  ) {
    const retryDelay = Math.min(1000 * Math.pow(2, mergedOptions.retryCount), 30000);
    
    if (mergedOptions.logToConsole) {
      console.info(`Retrying after ${retryDelay}ms (${mergedOptions.retryCount + 1}/${mergedOptions.maxRetries})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
      return await mergedOptions.retryFn();
    } catch (retryError) {
      // Recursively handle retry error with incremented retry count
      return handleApiError(retryError, {
        ...mergedOptions,
        retryCount: (mergedOptions.retryCount + 1)
      });
    }
  }
  
  // Throw error if enabled
  if (mergedOptions.throwError) {
    throw apiError;
  }
  
  // Return fallback data if provided
  return mergedOptions.fallbackData;
}

/**
 * Wrap a function with standardized API error handling
 */
export function withApiErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: Omit<ApiErrorHandlingOptions, 'retryFn' | 'retryCount' | 'maxRetries'> = {}
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error, {
        ...options,
        retryFn: options.throwError === false ? undefined : () => fn(...args),
        retryCount: 0,
        maxRetries: 3
      });
    }
  };
}

export default {
  handleApiError,
  withApiErrorHandling
};
