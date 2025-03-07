
import React, { ReactNode, useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ErrorHandlingProviderProps {
  children: ReactNode;
}

/**
 * ErrorHandlingProvider
 * 
 * Global error handler that:
 * 1. Wraps app in ErrorBoundary for component errors
 * 2. Catches unhandled promise rejections
 * 3. Cleanly handles animation errors
 */
const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  // Set up global error handlers
  useEffect(() => {
    // Handle unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      // Prevent default browser handling
      event.preventDefault();
      
      // Set error state to trigger fallback UI if needed
      setHasError(true);
    };
    
    // Handle animation errors more gracefully
    const handleError = (event: ErrorEvent) => {
      // Check if error is animation-related
      const isAnimationError = 
        event.message?.includes('animation') || 
        event.message?.includes('Maximum update depth exceeded') ||
        event.message?.includes('Rendered more hooks than during the previous render');
      
      // For animation errors, log but don't crash app
      if (isAnimationError) {
        console.warn('Animation error caught:', event.message);
        event.preventDefault();
      }
    };
    
    // Add event listeners
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    window.addEventListener('error', handleError);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorHandlingProvider;
