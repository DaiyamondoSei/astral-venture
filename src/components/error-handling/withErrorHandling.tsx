
import React, { useState, useEffect } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import ErrorDisplay from './ErrorDisplay';
import { AsyncResult } from '@/hooks/useAsyncResult';

interface WithErrorHandlingProps<T> {
  result: AsyncResult<T, unknown>;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  renderData: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  isEmptyMessage?: string;
  className?: string;
  showRetry?: boolean;
}

/**
 * A higher-order component that handles loading, error, and empty states
 */
export function WithErrorHandling<T>({
  result,
  loadingComponent,
  errorComponent,
  emptyComponent,
  renderData,
  isEmpty,
  isEmptyMessage = 'No data available',
  className = '',
  showRetry = true,
}: WithErrorHandlingProps<T>) {
  const { trackMetric } = usePerformance();
  const [renderTime, setRenderTime] = useState<number | null>(null);
  
  // Track component rendering performance
  useEffect(() => {
    const startTime = performance.now();
    
    // Track end time on cleanup
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      
      if (duration > 0) {
        trackMetric('WithErrorHandling', 'renderTime', duration);
      }
    };
  }, [result.status, trackMetric]);
  
  // Loading state
  if (result.isLoading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Error state
  if (result.isError) {
    return errorComponent || (
      <ErrorDisplay 
        error={result.error} 
        onRetry={showRetry ? result.refetch : undefined}
        className={className}
      />
    );
  }
  
  // Empty state
  if (!result.data || (isEmpty && isEmpty(result.data))) {
    return emptyComponent || (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        {isEmptyMessage}
      </div>
    );
  }
  
  // Success state
  return <>{renderData(result.data)}</>;
}

/**
 * Create a component with error handling capabilities
 */
export function withErrorHandling<P extends object, T>(
  Component: React.ComponentType<P & { data: T }>,
  options: Omit<WithErrorHandlingProps<T>, 'result' | 'renderData'> = {}
) {
  return function WithErrorHandlingWrapper(
    props: P & { result: AsyncResult<T, unknown> }
  ) {
    return (
      <WithErrorHandling
        result={props.result}
        renderData={(data) => <Component {...props} data={data} />}
        {...options}
      />
    );
  };
}

export default WithErrorHandling;
