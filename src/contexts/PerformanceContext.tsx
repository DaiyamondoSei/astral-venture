
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Define performance capability levels
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define context interface
export interface PerformanceContextType {
  deviceCapability: DeviceCapability;
  isMonitoring: boolean;
  metrics: Record<string, any>;
  trackMetric: (componentName: string, metricName: string, value: number) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearMetrics: () => void;
}

// Create the context with default values
export const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  LOW: { fps: 30, renderTime: 50, loadTime: 1000 },
  MEDIUM: { fps: 45, renderTime: 20, loadTime: 500 },
  HIGH: { fps: 60, renderTime: 10, loadTime: 200 }
};

// Props for the provider component
interface PerformanceProviderProps {
  children: React.ReactNode;
  initialCapability?: DeviceCapability;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children, 
  initialCapability = 'medium' 
}) => {
  // State management
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(initialCapability);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const { toast } = useToast();
  
  // Detect device capability on mount
  useEffect(() => {
    detectDeviceCapability();
    
    // Start background monitoring of core web vitals
    monitorWebVitals();
    
    return () => {
      // Cleanup web vitals monitoring
      // Currently no cleanup needed
    };
  }, []);
  
  // Detect device capability
  const detectDeviceCapability = useCallback(() => {
    // Simple detection based on user agent and hardware concurrency
    const navigator = window.navigator;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check if device is low end
    const isLowEnd = userAgent.includes('android 4') || 
                     userAgent.includes('android 5') ||
                     (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    
    // Check if device is high end
    const isHighEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8;
    
    // Set device capability
    if (isLowEnd) {
      setDeviceCapability('low');
    } else if (isHighEnd) {
      setDeviceCapability('high');
    } else {
      setDeviceCapability('medium');
    }
  }, []);
  
  // Track performance metrics
  const trackMetric = useCallback((componentName: string, metricName: string, value: number) => {
    if (!isMonitoring) return;
    
    setMetrics(prev => {
      // Create component object if it doesn't exist
      const componentMetrics = prev[componentName] || {};
      
      // Add metric to component metrics
      const updatedComponentMetrics = {
        ...componentMetrics,
        [metricName]: value
      };
      
      // Return updated metrics
      return {
        ...prev,
        [componentName]: updatedComponentMetrics
      };
    });
    
    // For critical metrics that exceed thresholds, persist to backend
    if (
      (metricName === 'renderTime' && value > PERFORMANCE_THRESHOLDS.HIGH.renderTime * 2) ||
      (metricName === 'loadTime' && value > PERFORMANCE_THRESHOLDS.HIGH.loadTime)
    ) {
      persistPerformanceMetric(componentName, metricName, value);
    }
  }, [isMonitoring]);
  
  // Persist performance metric to Supabase if user is logged in
  const persistPerformanceMetric = useCallback(async (
    componentName: string, 
    metricName: string, 
    value: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Use edge function to persist metric
        await supabase.functions.invoke('track-performance', {
          body: {
            userId: user.id,
            componentName,
            metricName,
            value,
            deviceCapability,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Failed to persist performance metric:', error);
    }
  }, [deviceCapability]);
  
  // Monitor core web vitals
  const monitorWebVitals = useCallback(() => {
    // Use dynamic import for better performance
    import('web-vitals').then(({ onCLS, onFID, onLCP }) => {
      // Cumulative Layout Shift
      onCLS(({ value }) => {
        trackMetric('CoreWebVitals', 'CLS', value);
      });
      
      // First Input Delay
      onFID(({ value }) => {
        trackMetric('CoreWebVitals', 'FID', value);
      });
      
      // Largest Contentful Paint
      onLCP(({ value }) => {
        trackMetric('CoreWebVitals', 'LCP', value);
      });
    });
  }, [trackMetric]);
  
  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    toast({
      title: "Performance monitoring enabled",
      description: "The app will now collect performance metrics to optimize your experience."
    });
  }, [toast]);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    toast({
      title: "Performance monitoring disabled",
      description: "The app will no longer collect performance metrics."
    });
  }, [toast]);
  
  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({});
  }, []);
  
  // Provide context value
  const contextValue: PerformanceContextType = {
    deviceCapability,
    isMonitoring,
    metrics,
    trackMetric,
    startMonitoring,
    stopMonitoring,
    clearMetrics
  };
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
};

export default PerformanceProvider;
