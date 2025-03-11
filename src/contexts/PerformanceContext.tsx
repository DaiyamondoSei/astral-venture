
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { PerfConfig } from '../hooks/usePerfConfig';
import { usePerformanceTracking, PerformanceData } from '../hooks/usePerformanceTracking';
import perfMetricsService from '../utils/performance/perfMetricsService';
import { Result } from '../utils/result/Result';

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
  
  // Device and performance information
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
  deviceCapability: 'low' | 'medium' | 'high';
  shouldUseSimplifiedUI: boolean;
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
  const [deviceCapability, setDeviceCapability] = useState<'low' | 'medium' | 'high'>(
    initialConfig.deviceCapability || 'medium'
  );
  
  // Use the performance tracking hook for the provider itself
  const { getPerformanceData } = usePerformanceTracking({
    componentName: 'PerformanceProvider',
    trackMountTime: true,
    trackUpdateTime: true
  });
  
  // Detect device capability on mount
  useEffect(() => {
    const detectCapability = (): 'low' | 'medium' | 'high' => {
      // Use capability detection logic from config
      if (initialConfig.deviceCapability) {
        return initialConfig.deviceCapability;
      }
      
      // Check for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Check for available memory (if available in the browser)
      const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      
      // Check for CPU cores
      const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      
      // Determine capability level
      if (isMobile && (lowMemory || lowCPU)) {
        return 'low';
      } else if (
        (navigator as any).deviceMemory &&
        (navigator as any).deviceMemory >= 8 &&
        navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency >= 8
      ) {
        return 'high';
      }
      
      return 'medium';
    };
    
    setDeviceCapability(detectCapability());
  }, [initialConfig.deviceCapability]);
  
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
  const submitMetricsToBackend = async (metricsToSubmit: PerformanceMetric[]): Promise<Result<void, Error>> => {
    if (!config.enableMetricsCollection || metricsToSubmit.length === 0) {
      return { type: 'success', value: undefined };
    }
    
    try {
      // Convert to format expected by perfMetricsService
      const formattedMetrics = metricsToSubmit.map(metric => ({
        component_name: metric.componentName,
        metricName: metric.metricName,
        metric_name: metric.metricName,
        value: metric.value,
        timestamp: metric.timestamp,
        category: 'component',
        type: 'render',
        metadata: metric.metadata
      }));
      
      // Send metrics
      return await perfMetricsService.sendMetrics(formattedMetrics);
    } catch (error) {
      // Silently fail - we don't want performance monitoring to affect the app
      console.error('Error submitting performance metrics:', error);
      return { 
        type: 'failure', 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };
  
  // Calculate if we should use simplified UI based on device capability
  const shouldUseSimplifiedUI = useMemo(() => {
    return deviceCapability === 'low' || (config.enableAdaptiveRendering && deviceCapability !== 'high');
  }, [deviceCapability, config.enableAdaptiveRendering]);
  
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
    getAllComponentStats,
    isLowPerformance: deviceCapability === 'low',
    isMediumPerformance: deviceCapability === 'medium',
    isHighPerformance: deviceCapability === 'high',
    deviceCapability,
    shouldUseSimplifiedUI
  };
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceContext;
