
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  componentName?: string;
  fallback?: React.ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Higher-Order Component that wraps a component with an ErrorBoundary
 */
function withErrorBoundary<P>(
  Component: React.ComponentType<P>, 
  options: WithErrorBoundaryOptions = {}
): React.FC<P> {
  const { componentName, fallback, showDetails, onError } = options;
  
  // Use Component's display name or name as the default componentName
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary 
        componentName={displayName}
        fallback={fallback}
        showDetails={showDetails}
        onError={onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  // Set display name for the wrapped component
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default withErrorBoundary;
