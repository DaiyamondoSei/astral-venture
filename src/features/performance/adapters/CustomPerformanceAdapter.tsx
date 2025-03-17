
import React from 'react';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { createProtectedAdapter } from '@/utils/adapters/ProtectedComponentAdapter';

/**
 * Custom adapter for performance monitoring that works with the protected
 * AdaptivePerformanceAdapter without modifying it directly.
 */
export interface CustomPerformanceAdapterProps {
  children: React.ReactNode;
  componentName?: string;
  enableMetrics?: boolean;
  measuredOperation?: string;
}

/**
 * Creates a custom performance adapter component that safely interacts with
 * protected performance monitoring components.
 */
export const CustomPerformanceAdapter: React.FC<CustomPerformanceAdapterProps> = ({
  children,
  componentName,
  enableMetrics = true,
  measuredOperation = 'render'
}) => {
  // Use the context from the protected component
  const { deviceCapability } = useAdaptivePerformance();
  
  // Use our adapter pattern to create performance monitor props
  const monitorAdapter = createProtectedAdapter<React.ComponentProps<typeof PerformanceMonitor>>()(
    { componentName, enableMetrics, measuredOperation, children },
    {
      mapToProps: (props) => ({
        children: props.children,
        componentName: props.componentName,
        enableMetrics: props.enableMetrics,
        measuredOperation: props.measuredOperation
      })
    }
  );
  
  return <PerformanceMonitor {...monitorAdapter.props} />;
};

export default CustomPerformanceAdapter;
