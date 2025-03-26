
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ValidationError } from '@/utils/validation/ValidationError';

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * A component that displays various types of errors in a consistent way
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  onRetry,
  className = '',
}) => {
  // Generate appropriate error message and title based on error type
  const getErrorContent = () => {
    if (ValidationError.isValidationError(error)) {
      return {
        title: title || 'Validation Error',
        message: error.message,
        showRetry: false,
      };
    }
    
    if (error instanceof Error) {
      return {
        title: title || 'Error',
        message: error.message || 'An unexpected error occurred.',
        showRetry: true,
      };
    }
    
    // Fallback for unknown error types
    return {
      title: title || 'Error',
      message: error ? String(error) : 'An unknown error occurred.',
      showRetry: true,
    };
  };
  
  const { title: errorTitle, message, showRetry } = getErrorContent();
  
  return (
    <Alert variant="destructive" className={`border-destructive ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p>{message}</p>
          
          {showRetry && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="mt-4 bg-transparent border-destructive text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
