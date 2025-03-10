
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Standard props for the error fallback component
 */
export interface StandardErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  showDetails?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
}

/**
 * Standard error fallback component to display when an error boundary catches an error
 * 
 * @param props - The component props
 * @returns The error fallback component
 */
const ErrorFallback: React.FC<StandardErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  showDetails = false,
  title = "Something went wrong",
  description,
  actionLabel = "Try again"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-background rounded-lg border border-border shadow-sm space-y-4">
      <div className="rounded-full bg-red-100 p-3 mb-2">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      
      <p className="text-muted-foreground">
        {description || error.message || "An unexpected error occurred. Please try again later."}
      </p>
      
      {showDetails && (
        <div className="w-full mt-4 px-3 py-2 bg-muted rounded text-left overflow-auto max-h-40">
          <pre className="text-xs text-muted-foreground">
            {error.stack || error.message}
          </pre>
        </div>
      )}
      
      {resetErrorBoundary && (
        <Button 
          onClick={resetErrorBoundary}
          variant="default"
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorFallback;
