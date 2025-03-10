
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  componentName?: string;
  errorContext?: string;
}

/**
 * A fallback component to display when an error occurs
 * Used by error boundaries to present friendly error messages to users
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  componentName = 'Component',
  errorContext = 'application'
}: ErrorFallbackProps): JSX.Element {
  return (
    <Card className="p-6 max-w-md mx-auto bg-background/95 backdrop-blur-sm border-muted-foreground/20">
      <div className="flex flex-col space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="ml-2">Error in {componentName}</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || `An error occurred in the ${errorContext}.`}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground mt-2">
          {process.env.NODE_ENV !== 'production' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">Technical details</summary>
              <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-2 text-xs">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        {resetErrorBoundary && (
          <Button 
            onClick={resetErrorBoundary}
            className="mt-4" 
            variant="outline"
          >
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ErrorFallback;
