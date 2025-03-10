
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorReportOptions, reportError } from '@/utils/errorHandling/errorReporter';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-toast';

interface ErrorHandlingContextType {
  handleError: (error: Error | unknown, options?: ErrorReportOptions) => void;
  showErrorToast: (message: string, error?: Error | unknown) => void;
  clearErrors: () => void;
  lastError: Error | null;
}

const ErrorHandlingContext = createContext<ErrorHandlingContextType | undefined>(undefined);

export const ErrorHandlingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastError, setLastError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Main error handler
  const handleError = useCallback((
    error: Error | unknown, 
    options?: ErrorReportOptions
  ) => {
    // Convert to Error object if not already
    const errorObject = error instanceof Error ? error : new Error(String(error));
    
    // Store the last error
    setLastError(errorObject);
    
    // Report error with user context
    reportError(errorObject, {
      ...options,
      userId: user?.id || options?.userId,
    });
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Handled]', errorObject);
    }
  }, [user?.id]);

  // Show error toast with optional error reporting
  const showErrorToast = useCallback((
    message: string, 
    error?: Error | unknown
  ) => {
    // Show toast
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    
    // Report error if provided
    if (error) {
      handleError(error, {
        metadata: { toastMessage: message }
      });
    }
  }, [handleError]);

  // Clear any stored errors
  const clearErrors = useCallback(() => {
    setLastError(null);
  }, []);

  const value = {
    handleError,
    showErrorToast,
    clearErrors,
    lastError,
  };

  return (
    <ErrorHandlingContext.Provider value={value}>
      {children}
    </ErrorHandlingContext.Provider>
  );
};

// Hook to use the error handling context
export function useErrorHandling() {
  const context = useContext(ErrorHandlingContext);
  
  if (context === undefined) {
    throw new Error('useErrorHandling must be used within an ErrorHandlingProvider');
  }
  
  return context;
}

export default ErrorHandlingContext;
