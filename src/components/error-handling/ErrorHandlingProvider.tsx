
import React, { ReactNode, useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { handleError } from '@/utils/errorHandling';

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
  // Set up global error handlers
  useEffect(() => {
    // Handle unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      // Prevent default browser handling
      event.preventDefault();
      
      // Use our centralized error handler
      handleError(event.reason, {
        context: 'Unhandled Promise Rejection',
        category: 'unknown',
        showToast: true
      });
    };
    
    // Handle animation errors more gracefully
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if error is animation-related
      const isAnimationError = 
        event.message?.includes('animation') || 
        event.message?.includes('Maximum update depth exceeded') ||
        event.message?.includes('Rendered more hooks than during the previous render');
      
      // For animation errors, log but don't crash app
      if (isAnimationError) {
        console.warn('Animation error caught:', event.message);
        event.preventDefault();
        
        // Use our centralized error handler with reduced severity
        handleError(new Error(event.message), {
          context: 'Animation Error',
          category: 'ui',
          severity: 'warning',
          showToast: false
        });
      } else {
        // Use centralized error handler for other errors
        handleError(new Error(event.message), {
          context: 'Global Error',
          showToast: true
        });
      }
    };
    
    // Add event listeners
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    window.addEventListener('error', handleGlobalError);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
  
  return (
    <ErrorBoundary componentName="Root">
      {children}
    </ErrorBoundary>
  );
};

export default ErrorHandlingProvider;
