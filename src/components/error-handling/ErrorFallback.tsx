
/**
 * ErrorFallback Component
 * 
 * Used by ErrorBoundary to display errors in a user-friendly way
 */
import React from 'react';
import { ErrorFallbackProps } from './index';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandling/errorReporter';

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  componentName, 
  resetErrorBoundary 
}) => {
  const errorMessage = getUserFriendlyErrorMessage(error);
  const displayName = componentName || 'this component';

  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800">
          Something went wrong in {displayName}
        </h3>
      </div>
      
      <p className="mb-4 text-red-700">{errorMessage}</p>
      
      <div className="flex justify-end">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
