
import React from 'react';
import { Button } from '../ui/button';
import { ApiError, ApiErrorType } from '../../utils/api/types';
import { ValidationError } from '../../utils/validation/ValidationError';
import { AlertCircle, WifiOff, Clock, Lock, FileX, Server, AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | ApiError | ValidationError | unknown;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
  actionText?: string;
  showAction?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Error display component with contextual messaging based on error type
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  className = '',
  showDetails = false,
  actionText = 'Try Again',
  showAction = true,
  fallback
}) => {
  // Determine error type and display appropriate message and icon
  let title = 'An error occurred';
  let message = 'Something went wrong. Please try again later.';
  let details = null;
  let Icon = AlertCircle;
  
  // Handle API errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.code) {
      case ApiErrorType.NETWORK:
        title = 'Network Error';
        message = 'Unable to connect to the server. Please check your internet connection.';
        Icon = WifiOff;
        break;
      
      case ApiErrorType.TIMEOUT:
        title = 'Request Timeout';
        message = 'The request took too long to complete. Please try again.';
        Icon = Clock;
        break;
      
      case ApiErrorType.AUTH:
        title = 'Authentication Error';
        message = apiError.status === 401 
          ? 'You need to be logged in to access this resource.' 
          : 'You do not have permission to access this resource.';
        Icon = Lock;
        break;
      
      case ApiErrorType.VALIDATION:
        title = 'Validation Error';
        message = apiError.message || 'The data you submitted is invalid.';
        Icon = FileX;
        break;
      
      case ApiErrorType.NOT_FOUND:
        title = 'Not Found';
        message = 'The requested resource could not be found.';
        Icon = FileX;
        break;
      
      case ApiErrorType.SERVER:
        title = 'Server Error';
        message = 'Something went wrong on our server. Our team has been notified.';
        Icon = Server;
        break;
      
      default:
        title = 'Error';
        message = apiError.message || 'An unexpected error occurred.';
        Icon = AlertTriangle;
    }
    
    // Show details if available and showDetails is true
    if (showDetails && apiError.details) {
      details = apiError.details;
    }
  }
  // Handle validation errors
  else if (error instanceof ValidationError) {
    title = 'Validation Error';
    message = error.getFormattedMessage() || 'The data you submitted is invalid.';
    Icon = FileX;
    
    if (showDetails && error.details.length > 0) {
      details = error.details;
    }
  }
  // Handle standard errors
  else if (error instanceof Error) {
    message = error.message || message;
    
    if (showDetails && error.stack) {
      details = error.stack;
    }
  }
  
  // Custom fallback content
  if (fallback) {
    return (
      <div className={`error-container ${className}`}>
        {fallback}
        {showAction && onRetry && (
          <Button onClick={onRetry} className="mt-4">
            {actionText}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={`rounded-lg bg-destructive/5 p-4 flex flex-col items-center text-center ${className}`}>
      <Icon className="h-10 w-10 text-destructive mb-2" />
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      
      {showDetails && details && (
        <pre className="text-xs bg-card p-2 rounded overflow-auto max-h-24 w-full mb-4">
          {typeof details === 'string' 
            ? details 
            : JSON.stringify(details, null, 2)}
        </pre>
      )}
      
      {showAction && onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;
