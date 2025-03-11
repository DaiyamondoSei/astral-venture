import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { PerfConfig } from '../hooks/usePerfConfig';
import { usePerformanceTracking, PerformanceData } from '../hooks/usePerformanceTracking';

interface PerformanceMetric {
  componentName: string;
  metricName: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceContextType {
  // Configuration
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  
  // Metrics tracking
  trackMetric: (componentName: string, metricName: string, value: number, metadata?: Record<string, any>) => void;
  trackEvent: (eventName: string, metadata?: Record<string, any>) => void;
  getMetrics: (componentName?: string) => PerformanceMetric[];
  
  // Performance data
  getComponentStats: (componentName: string) => PerformanceData | null;
  getAllComponentStats: () => Record<string, PerformanceData>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
  initialConfig: PerfConfig;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [config, setConfig] = useState<PerfConfig>(initialConfig);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [componentStats, setComponentStats] = useState<Record<string, PerformanceData>>({});
  
  // Use the performance tracking hook for the provider itself
  const { getPerformanceData } = usePerformanceTracking({
    componentName: 'PerformanceProvider',
    trackMountTime: true,
    trackUpdateTime: true
  });
  
  // Update configuration
  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  // Track a performance metric
  const trackMetric = (
    componentName: string, 
    metricName: string, 
    value: number,
    metadata?: Record<string, any>
  ) => {
    const newMetric: PerformanceMetric = {
      componentName,
      metricName,
      value,
      timestamp: Date.now(),
      metadata
    };
    
    setMetrics(prev => [...prev, newMetric]);
    
    // Optionally send metrics to backend
    if (config.enableMetricsCollection) {
      submitMetricsToBackend([newMetric]);
    }
  };
  
  // Track a performance event
  const trackEvent = (
    eventName: string,
    metadata?: Record<string, any>
  ) => {
    // Event tracking is a special case of metric tracking
    trackMetric('app', eventName, 1, metadata);
  };
  
  // Get metrics for a specific component or all metrics
  const getMetrics = (componentName?: string): PerformanceMetric[] => {
    if (componentName) {
      return metrics.filter(m => m.componentName === componentName);
    }
    return metrics;
  };
  
  // Get performance stats for a specific component
  const getComponentStats = (componentName: string): PerformanceData | null => {
    return componentStats[componentName] || null;
  };
  
  // Get performance stats for all components
  const getAllComponentStats = (): Record<string, PerformanceData> => {
    return componentStats;
  };
  
  // Update component stats
  const updateComponentStats = (name: string, data: PerformanceData) => {
    setComponentStats(prev => ({
      ...prev,
      [name]: data
    }));
  };
  
  // Submit metrics to backend
  const submitMetricsToBackend = async (metricsToSubmit: PerformanceMetric[]) => {
    if (!config.enableMetricsCollection || metricsToSubmit.length === 0) {
      return;
    }
    
    try {
      // Don't await to avoid blocking
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToSubmit }),
        // Use keepalive to ensure the request completes even if page is unloading
        keepalive: true
      });
    } catch (error) {
      // Silently fail - we don't want performance monitoring to affect the app
      console.error('Error submitting performance metrics:', error);
    }
  };
  
  // Register this provider's metrics on unmount
  useEffect(() => {
    return () => {
      const providerData = getPerformanceData();
      updateComponentStats('PerformanceProvider', providerData);
      
      // Flush metrics on unmount
      if (config.enableMetricsCollection && metrics.length > 0) {
        submitMetricsToBackend(metrics);
      }
    };
  }, [metrics, config.enableMetricsCollection]);
  
  const contextValue: PerformanceContextType = {
    config,
    updateConfig,
    trackMetric,
    trackEvent,
    getMetrics,
    getComponentStats,
    getAllComponentStats
  };
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceContext;
