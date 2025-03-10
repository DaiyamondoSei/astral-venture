
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Props for the ErrorFallback component
 */
interface ErrorFallbackProps {
  /** The error that occurred */
  error: Error | null;
  /** Additional information about the error */
  errorInfo: React.ErrorInfo | null;
  /** Function to reset the error state */
  resetError: () => void;
  /** Optional error message to display */
  message?: string;
}

/**
 * A fallback UI component to display when an error occurs
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  message = 'Something went wrong'
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="max-w-full p-6 m-4 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{message}</h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Button 
            onClick={resetError}
          >
            Try Again
          </Button>
        </div>
        
        {showDetails && (
          <div className="mt-4 text-left">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-64">
              <h3 className="font-bold mb-2">Error Details:</h3>
              <p className="font-mono text-sm whitespace-pre-wrap break-words">
                {error?.stack || 'No stack trace available'}
              </p>
              
              {errorInfo && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Component Stack:</h3>
                  <p className="font-mono text-sm whitespace-pre-wrap break-words">
                    {errorInfo.componentStack}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
