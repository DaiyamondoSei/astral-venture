
import { useCallback } from 'react';
import { reportError, ErrorReportOptions } from '@/utils/errorHandling/errorReporter';
import { useAuth } from '@/hooks/auth';

/**
 * Hook for handling errors with additional context
 * 
 * Automatically includes user ID and other contextual information
 * when reporting errors
 */
export function useErrorHandler(defaultOptions?: Omit<ErrorReportOptions, 'userId'>) {
  // Get current user ID from auth context
  const { user } = useAuth();
  
  const handleError = useCallback((
    error: Error | unknown,
    additionalOptions?: Omit<ErrorReportOptions, 'userId'>
  ) => {
    // Combine default options with additional options and user ID
    const options: ErrorReportOptions = {
      ...defaultOptions,
      ...additionalOptions,
      userId: user?.id,
    };
    
    // Report the error
    reportError(error, options);
    
    // Rethrow if specified (useful for letting error boundaries catch it)
    if (additionalOptions?.metadata?.rethrow) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }, [user?.id, defaultOptions]);
  
  return handleError;
}

export default useErrorHandler;
