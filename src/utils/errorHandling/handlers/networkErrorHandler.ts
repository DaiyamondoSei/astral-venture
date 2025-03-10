
import { handleError, ErrorHandlingOptions } from '../handleError';
import { ErrorSeverity, ErrorCategory, createNetworkError } from '../AppError';

/**
 * Specialized options for network error handling
 */
export interface NetworkErrorHandlingOptions extends ErrorHandlingOptions {
  url?: string;
  connectionType?: string;
  retryScheduled?: boolean;
}

/**
 * Check if an error is likely a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('offline') ||
      message.includes('internet') ||
      message.includes('timeout') ||
      message.includes('abort')
    );
  }
  
  return false;
}

/**
 * Specialized handler for network errors
 */
export function handleNetworkError(
  error: unknown,
  options: NetworkErrorHandlingOptions = {}
) {
  const { url, connectionType, retryScheduled, ...baseOptions } = options;
  
  // Create enhanced context with network-specific information
  const networkContext = {
    ...baseOptions.context,
    url,
    connectionType,
    retryScheduled,
    online: navigator?.onLine ?? false
  };
  
  // Use standardized error handling with network-specific defaults
  return handleError(error, {
    showToast: true,
    logToServer: false, // Often can't log to server during network issues
    throwError: false,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.NETWORK,
    context: networkContext,
    ...baseOptions
  });
}

/**
 * Wrap an async function to detect and handle network errors specifically
 */
export function withNetworkErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: NetworkErrorHandlingOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isNetworkError(error)) {
        handleNetworkError(error, options);
      } else {
        handleError(error, options);
      }
      throw error;
    }
  };
}
