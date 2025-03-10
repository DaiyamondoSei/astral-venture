
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
}

/**
 * A component that displays error information when caught by an error boundary
 * Provides debug information in development and a friendly message in production
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  showDetails = process.env.NODE_ENV === 'development'
}) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Extract stack frames for better display
  const stackFrames = error.stack
    ? error.stack
        .split('\n')
        .slice(1) // Remove the first line (error message)
        .map(line => line.trim())
    : [];
  
  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-xl border-red-200 shadow-md">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <span className="i-lucide-alert-triangle h-5 w-5" />
            Application Error
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Something went wrong with this part of the application.
            </p>
            <p className="font-medium text-gray-800">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          
          {showDetails && (
            <div className="mt-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {expanded ? 'Hide technical details' : 'Show technical details'}
              </button>
              
              {expanded && (
                <div className="mt-2 text-xs">
                  <div className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    <p className="font-mono mb-1 font-semibold">{error.name}: {error.message}</p>
                    {stackFrames.map((frame, index) => (
                      <p key={index} className="font-mono text-gray-600">
                        {frame}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-gray-100 bg-gray-50">
          <Button 
            variant="outline" 
            onClick={resetErrorBoundary}
            className="mr-2"
          >
            Try Again
          </Button>
          
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorFallback;
