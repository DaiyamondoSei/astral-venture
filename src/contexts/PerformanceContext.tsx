
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  DeviceCapability, 
  detectDeviceCapability, 
  logPerformanceMetric 
} from '@/utils/performanceUtils';
import { metricsCollector } from '@/utils/performance/collectors/MetricsCollector';

// Define performance context interface
export interface PerformanceContextType {
  deviceCapability: DeviceCapability;
  isMonitoring: boolean;
  metrics: Record<string, any>;
  trackMetric: (componentName: string, metricName: string, value: number) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearMetrics: () => void;
  config?: Record<string, any>;
  // App performance features
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableParticles: boolean;
  enableComplexAnimations: boolean;
  // Feature toggles manager
  shouldEnableFeature: (featureName: string) => boolean;
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
  
  // Features based on device capability
  const isLowPerformance = deviceCapability === 'low';
  const isMediumPerformance = deviceCapability === 'medium';
  const isHighPerformance = deviceCapability === 'high';
  
  // Feature flags
  const enableBlur = !isLowPerformance;
  const enableShadows = !isLowPerformance;
  const enableParticles = !isLowPerformance;
  const enableComplexAnimations = isHighPerformance;
  
  // Config with default values
  const config = {
    enablePerformanceTracking: true,
    samplingRate: isLowPerformance ? 0.3 : isMediumPerformance ? 0.7 : 1,
    throttleInterval: isLowPerformance ? 150 : isMediumPerformance ? 80 : 30
  };
  
  // Detect device capability on mount
  useEffect(() => {
    const detectedCapability = detectDeviceCapability();
    setDeviceCapability(detectedCapability);
    
    // Start background monitoring of core web vitals
    monitorWebVitals();
    
    return () => {
      // Cleanup web vitals monitoring
      // Currently no cleanup needed
    };
  }, []);
  
  // Track performance metrics
  const trackMetric = useCallback((componentName: string, metricName: string, value: number) => {
    if (!isMonitoring) return;
    
    // Log in development mode
    logPerformanceMetric(componentName, metricName, value);
    
    // Add to metrics collector
    metricsCollector.trackComponentMetric(componentName, metricName, value);
    
    // Update internal state
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
    import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB, onINP, onFCP }) => {
      // Cumulative Layout Shift
      onCLS(({ value }) => {
        metricsCollector.addWebVital('CLS', value, 'visual_stability');
        trackMetric('CoreWebVitals', 'CLS', value);
      });
      
      // First Input Delay
      onFID(({ value }) => {
        metricsCollector.addWebVital('FID', value, 'interaction');
        trackMetric('CoreWebVitals', 'FID', value);
      });
      
      // Largest Contentful Paint
      onLCP(({ value }) => {
        metricsCollector.addWebVital('LCP', value, 'loading');
        trackMetric('CoreWebVitals', 'LCP', value);
      });
      
      // Time To First Byte
      onTTFB(({ value }) => {
        metricsCollector.addWebVital('TTFB', value, 'loading');
        trackMetric('CoreWebVitals', 'TTFB', value);
      });
      
      // Interaction to Next Paint
      onINP(({ value }) => {
        metricsCollector.addWebVital('INP', value, 'interaction');
        trackMetric('CoreWebVitals', 'INP', value);
      });
      
      // First Contentful Paint
      onFCP(({ value }) => {
        metricsCollector.addWebVital('FCP', value, 'loading');
        trackMetric('CoreWebVitals', 'FCP', value);
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
    
    // Enable metrics collector
    metricsCollector.setEnabled(true);
  }, [toast]);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    toast({
      title: "Performance monitoring disabled",
      description: "The app will no longer collect performance metrics."
    });
    
    // Disable metrics collector
    metricsCollector.setEnabled(false);
  }, [toast]);
  
  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({});
    
    // Clear metrics collector
    metricsCollector.clear();
  }, []);
  
  // Feature toggle helper
  const shouldEnableFeature = useCallback((featureName: string): boolean => {
    switch (featureName) {
      case 'blur': 
        return enableBlur;
      case 'shadows': 
        return enableShadows;
      case 'particles': 
        return enableParticles;
      case 'complex-animations': 
        return enableComplexAnimations;
      case 'high-quality-effects':
        return isHighPerformance;
      case 'background-effects':
        return !isLowPerformance;
      case 'advanced-transitions':
        return isHighPerformance;
      default:
        return true;
    }
  }, [
    enableBlur, 
    enableShadows, 
    enableParticles, 
    enableComplexAnimations,
    isLowPerformance,
    isHighPerformance
  ]);
  
  // Provide context value
  const contextValue: PerformanceContextType = {
    deviceCapability,
    isMonitoring,
    metrics,
    trackMetric,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    config,
    // App performance features
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    enableBlur,
    enableShadows,
    enableParticles,
    enableComplexAnimations,
    // Feature toggle helper
    shouldEnableFeature
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
