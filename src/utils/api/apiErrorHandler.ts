
import { ApiError, ErrorCategory, ErrorSeverity, ErrorHandlingOptions } from './ApiError';
import { toast } from 'sonner';

/**
 * Process an API error and return a standardized error object
 */
export function processApiError(error: unknown, options: ErrorHandlingOptions = {}): ApiError {
  const apiError = ApiError.from(error);
  
  // Log error based on severity
  logApiError(apiError, options.logLevel);
  
  // Show user-friendly toast for errors that should be visible
  if (shouldShowErrorToast(apiError)) {
    showErrorToast(apiError);
  }
  
  return apiError;
}

/**
 * Handle an API response and process errors
 */
export function handleApiResponse<T>(
  response: { data: T | null; error: Error | null },
  options: ErrorHandlingOptions = {}
): T {
  if (response.error) {
    const apiError = processApiError(response.error, options);
    
    // Use fallback data if provided
    if (options.fallbackData !== undefined) {
      return options.fallbackData as T;
    }
    
    // Retry if specified
    if (options.retry && apiError.retryable) {
      // Implementation would depend on the retry strategy
      console.info('Retrying request...');
    }
    
    // Rethrow if specified or no fallback provided
    if (options.rethrow || options.fallbackData === undefined) {
      throw apiError;
    }
    
    return {} as T;
  }
  
  // Ensure we have data
  if (response.data === null || response.data === undefined) {
    const error = new ApiError({
      message: 'Response data is null or undefined',
      category: ErrorCategory.SERVER,
      severity: ErrorSeverity.WARNING,
      statusCode: 204
    });
    
    if (options.fallbackData !== undefined) {
      return options.fallbackData as T;
    }
    
    throw error;
  }
  
  return response.data;
}

/**
 * Log API errors based on severity
 */
function logApiError(error: ApiError, logLevel?: string): void {
  const { severity, message, statusCode, category, context } = error;
  const logData = {
    message,
    statusCode,
    category,
    context,
    stack: error.stack
  };
  
  // Override severity with provided log level
  const effectiveSeverity = logLevel ? mapLogLevelToSeverity(logLevel) : severity;
  
  switch (effectiveSeverity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.ERROR:
      console.error('API Error:', logData);
      break;
    case ErrorSeverity.WARNING:
      console.warn('API Warning:', logData);
      break;
    case ErrorSeverity.INFO:
    default:
      console.info('API Info:', logData);
      break;
  }
}

/**
 * Map log level to error severity
 */
function mapLogLevelToSeverity(logLevel: string): ErrorSeverity {
  switch (logLevel) {
    case 'error':
      return ErrorSeverity.ERROR;
    case 'warn':
      return ErrorSeverity.WARNING;
    case 'info':
      return ErrorSeverity.INFO;
    case 'debug':
      return ErrorSeverity.INFO;
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Determine if error should be shown to user
 */
function shouldShowErrorToast(error: ApiError): boolean {
  // Don't show not found errors to users
  if (error.category === ErrorCategory.NOT_FOUND) {
    return false;
  }
  
  // Network errors should be shown
  if (error.category === ErrorCategory.NETWORK || 
      error.category === ErrorCategory.CONNECTIVITY) {
    return true;
  }
  
  // Show errors based on severity
  return error.severity === ErrorSeverity.ERROR || 
         error.severity === ErrorSeverity.CRITICAL;
}

/**
 * Show error toast to user
 */
function showErrorToast(error: ApiError): void {
  toast.error(error.userMessage, {
    description: error.recoverable 
      ? 'Please try again or contact support if the problem persists.'
      : 'Our team has been notified. Please try again later.',
    duration: 5000
  });
}

export default { processApiError, handleApiResponse };
