
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  /** The error that occurred */
  error: Error;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
  /** Optional title for the error message */
  title?: string;
  /** Optional description for the error message */
  description?: string;
  /** Whether to show the error details */
  showDetails?: boolean;
}

/**
 * Default error fallback component for error boundaries
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'An error occurred while rendering this component.',
  showDetails = true
}) => {
  return (
    <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">{description}</p>
          
          {showDetails && (
            <div className="mt-3">
              <details className="group">
                <summary className="text-sm cursor-pointer text-red-700 dark:text-red-300 hover:underline">
                  Error details
                </summary>
                <pre className="mt-2 text-xs p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto max-h-40">
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      <span className="text-red-600 dark:text-red-400">Stack trace:</span>
                      {'\n'}
                      {error.stack.split('\n').slice(1).join('\n')}
                    </>
                  )}
                </pre>
              </details>
            </div>
          )}
          
          <button
            onClick={resetErrorBoundary}
            className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
