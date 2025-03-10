
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { captureException } from '@/utils/errorHandling/errorReporter';

export interface ErrorDetails {
  message: string;
  code?: string;
  componentName?: string;
  originalError?: unknown;
  recoverable?: boolean;
}

interface ErrorAction {
  type: string;
  label: string;
  handler: () => void;
}

export interface ErrorHandlingContextType {
  hasError: boolean;
  error: ErrorDetails | null;
  errorActions: ErrorAction[];
  reportError: (error: unknown, details?: Partial<ErrorDetails>) => void;
  clearError: () => void;
  addErrorAction: (action: ErrorAction) => void;
  removeErrorAction: (type: string) => void;
}

const ErrorHandlingContext = createContext<ErrorHandlingContextType | null>(null);

interface ErrorHandlingProviderProps {
  children: ReactNode;
}

export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({ children }) => {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [errorActions, setErrorActions] = useState<ErrorAction[]>([]);
  
  const reportError = useCallback((err: unknown, details?: Partial<ErrorDetails>) => {
    // Create standardized error details
    const errorDetails: ErrorDetails = {
      message: err instanceof Error ? err.message : String(err),
      code: details?.code || 'UNKNOWN_ERROR',
      componentName: details?.componentName,
      originalError: err,
      recoverable: details?.recoverable ?? true,
    };
    
    // Set the current error
    setError(errorDetails);
    
    // Report to monitoring system
    captureException(err, undefined, {
      componentName: details?.componentName,
      additionalContext: details,
    });
    
    return errorDetails;
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
    setErrorActions([]);
  }, []);
  
  const addErrorAction = useCallback((action: ErrorAction) => {
    setErrorActions(prev => [...prev.filter(a => a.type !== action.type), action]);
  }, []);
  
  const removeErrorAction = useCallback((type: string) => {
    setErrorActions(prev => prev.filter(action => action.type !== type));
  }, []);
  
  const value: ErrorHandlingContextType = {
    hasError: error !== null,
    error,
    errorActions,
    reportError,
    clearError,
    addErrorAction,
    removeErrorAction,
  };
  
  return (
    <ErrorHandlingContext.Provider value={value}>
      {children}
    </ErrorHandlingContext.Provider>
  );
};

/**
 * Hook to access the error handling context
 */
export function useErrorHandlingContext(): ErrorHandlingContextType {
  const context = useContext(ErrorHandlingContext);
  
  if (!context) {
    throw new Error('useErrorHandlingContext must be used within an ErrorHandlingProvider');
  }
  
  return context;
}

export default ErrorHandlingContext;
