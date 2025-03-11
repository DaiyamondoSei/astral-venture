
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ValidationError, ValidationErrorDetail } from '@/utils/validation/validator';
import { 
  ApiError, 
  NotFoundError, 
  DatabaseError, 
  isNotFoundError, 
  isDatabaseError 
} from '@/utils/api/createResourceService';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * A component that displays various types of errors in a consistent way
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  showDetails = false,
  onRetry,
  className = '',
}) => {
  // Generate appropriate error message and title based on error type
  const getErrorContent = () => {
    if (error instanceof ValidationError) {
      const details = error.details.length > 0 
        ? error.details.map((detail: ValidationErrorDetail) => (
            <li key={detail.field || detail.message} className="text-sm">
              {detail.message}
            </li>
          ))
        : null;
        
      return {
        title: title || 'Validation Error',
        message: error.message,
        details,
        showRetry: false,
      };
    }
    
    if (isNotFoundError(error)) {
      return {
        title: title || 'Not Found',
        message: error.message,
        details: null,
        showRetry: true,
      };
    }
    
    if (isDatabaseError(error)) {
      return {
        title: title || 'Database Error',
        message: 'An error occurred while accessing the database.',
        details: showDetails ? <p className="text-sm mt-2">{error.message}</p> : null,
        showRetry: true,
      };
    }
    
    if (error instanceof ApiError) {
      return {
        title: title || 'API Error',
        message: 'An error occurred while communicating with the server.',
        details: showDetails ? <p className="text-sm mt-2">{error.message}</p> : null,
        showRetry: true,
      };
    }
    
    if (error instanceof Error) {
      return {
        title: title || 'Error',
        message: error.message || 'An unexpected error occurred.',
        details: showDetails && error.stack 
          ? <pre className="text-xs mt-2 bg-secondary/50 p-2 rounded overflow-auto max-h-32">{error.stack}</pre> 
          : null,
        showRetry: true,
      };
    }
    
    // Fallback for unknown error types
    return {
      title: title || 'Error',
      message: error ? String(error) : 'An unknown error occurred.',
      details: null,
      showRetry: true,
    };
  };
  
  const { title: errorTitle, message, details, showRetry } = getErrorContent();
  
  return (
    <Alert variant="destructive" className={`border-destructive ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p>{message}</p>
          {details && <div className="mt-2">{details}</div>}
          
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
