
import React from 'react';
import { ErrorFallbackProps } from './EnhancedErrorBoundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Props for the ErrorFallback component
 */
interface StandardErrorFallbackProps extends ErrorFallbackProps {
  /** Title for the error message */
  title?: string;
  /** Whether to show a retry button */
  showRetry?: boolean;
  /** Whether to show a refresh button */
  showRefresh?: boolean;
  /** Whether to show the technical details by default */
  showDetailsByDefault?: boolean;
}

/**
 * A standardized error fallback component for use with ErrorBoundary
 */
export function ErrorFallback({
  error,
  resetError,
  errorInfo,
  title = 'Something went wrong',
  showRetry = true,
  showRefresh = true,
  showDetailsByDefault = false
}: StandardErrorFallbackProps): JSX.Element {
  const [showDetails, setShowDetails] = React.useState(showDetailsByDefault);
  
  /**
   * Refresh the page
   */
  const handleRefresh = (): void => {
    window.location.reload();
  };
  
  return (
    <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive-foreground">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-6 w-6" />
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="mb-4 text-destructive-foreground/90">
            {error.message || 'An unexpected error occurred.'}
          </p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {showRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetError}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </Button>
            )}
            
            {showRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh page
              </Button>
            )}
          </div>
          
          {errorInfo && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-sm text-muted-foreground hover:text-destructive-foreground transition-colors"
              >
                {showDetails ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {showDetails ? 'Hide technical details' : 'Show technical details'}
              </button>
              
              {showDetails && (
                <div className="mt-2 p-3 bg-card border rounded-md overflow-auto max-h-40 text-xs font-mono whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
