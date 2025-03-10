
import { ApiError, ApiErrorType } from './ApiError';
import { toast } from 'sonner';

/**
 * Options for error handling behavior
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  retry?: boolean | number;
  fallbackValue?: any;
  context?: Record<string, any>;
  suppressErrors?: ApiErrorType[];
  transform?: (error: ApiError) => ApiError;
  onError?: (error: ApiError) => void;
}

/**
 * Default error handling options
 */
const defaultOptions: ErrorHandlingOptions = {
  showToast: true,
  logToConsole: true,
  logToServer: false,
  retry: false,
  suppressErrors: []
};

/**
 * Central error handler for API errors
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): ApiError {
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Normalize to ApiError
  let apiError: ApiError;
  
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = ApiError.fromNetworkError(error);
  } else if (typeof error === 'string') {
    apiError = new ApiError(error);
  } else {
    apiError = new ApiError(
      'An unknown error occurred',
      ApiErrorType.UNKNOWN_ERROR,
      { originalError: error }
    );
  }
  
  // Apply error transformation if provided
  if (mergedOptions.transform) {
    apiError = mergedOptions.transform(apiError);
  }
  
  // Check if this error type should be suppressed
  const shouldSuppress = mergedOptions.suppressErrors?.includes(apiError.type);
  
  // Console logging
  if (mergedOptions.logToConsole && !shouldSuppress) {
    console.error(
      `API Error (${apiError.type}): ${apiError.message}`,
      mergedOptions.context ? { context: mergedOptions.context, error: apiError } : apiError
    );
  }
  
  // Toast notification
  if (mergedOptions.showToast && !shouldSuppress) {
    showErrorToast(apiError);
  }
  
  // Log to server
  if (mergedOptions.logToServer && !shouldSuppress) {
    logErrorToServer(apiError, mergedOptions.context).catch(console.error);
  }
  
  // Custom error handler
  if (mergedOptions.onError) {
    mergedOptions.onError(apiError);
  }
  
  return apiError;
}

/**
 * Display a toast notification for an error
 */
function showErrorToast(error: ApiError): void {
  // Select appropriate toast variant based on error type
  switch (error.type) {
    case ApiErrorType.NETWORK_ERROR:
    case ApiErrorType.CONNECTION_ERROR:
      toast.error('Network Error', {
        description: 'Please check your internet connection and try again.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.TIMEOUT_ERROR:
      toast.error('Request Timeout', {
        description: 'The server took too long to respond. Please try again later.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.UNAUTHORIZED:
      toast.error('Authentication Required', {
        description: 'Please log in to continue.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.FORBIDDEN:
      toast.error('Access Denied', {
        description: 'You don\'t have permission to perform this action.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.NOT_FOUND:
      toast.error('Not Found', {
        description: 'The requested resource could not be found.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.VALIDATION_ERROR:
      toast.error('Validation Error', {
        description: error.message || 'Please check your input and try again.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.SERVER_ERROR:
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.SERVICE_UNAVAILABLE:
      toast.error('Service Unavailable', {
        description: 'The service is currently unavailable. Please try again later.',
        duration: 5000
      });
      break;
    
    case ApiErrorType.RATE_LIMITED:
      toast.error('Too Many Requests', {
        description: 'Please slow down and try again later.',
        duration: 5000
      });
      break;
    
    default:
      toast.error('Error', {
        description: error.message || 'An unexpected error occurred.',
        duration: 5000
      });
      break;
  }
}

/**
 * Log error to a server for monitoring
 */
async function logErrorToServer(
  error: ApiError,
  context?: Record<string, any>
): Promise<void> {
  try {
    // Implementation depends on your error tracking service
    // This is a placeholder implementation
    const payload = {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      endpoint: error.endpoint,
      timestamp: new Date().toISOString(),
      context: context || {},
      // Exclude potentially large or sensitive data
      details: error.details ? JSON.stringify(error.details).substring(0, 1000) : undefined
    };
    
    // Example implementation using fetch
    await fetch('/api/error-logging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Don't wait too long and don't retry
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {
    // Don't throw from the error handler
    console.error('Failed to log error to server:', e);
  }
}

/**
 * Higher-order function to wrap an async function with error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options?: ErrorHandlingOptions
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      const apiError = handleApiError(error, options);
      
      // Return fallback value if provided
      if (options?.fallbackValue !== undefined) {
        return options.fallbackValue as T;
      }
      
      throw apiError;
    }
  };
}

/**
 * Utility to check if an error is of a specific type
 */
export function isErrorType(error: unknown, type: ApiErrorType): boolean {
  return error instanceof ApiError && error.type === type;
}

export default {
  handleApiError,
  withErrorHandling,
  isErrorType
};
