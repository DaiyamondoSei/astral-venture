
/**
 * Performance Provider Component
 * 
 * Provides performance monitoring, adaptive configuration, and
 * metrics collection for the entire application.
 */
import React, { createContext, useState, useEffect, useContext, useMemo, ReactNode } from 'react';
import { PerfConfig, DEFAULT_PERF_CONFIG, detectDeviceCapability } from '../hooks/usePerfConfig';
import { perfMetricsCollector } from '../utils/performance/perfMetricsCollector';
import { initWebVitals } from '../utils/performance/webVitalsMonitor';
import { initAdaptivePerformance, getAdaptiveConfig, AdaptiveFeatureConfig } from '../utils/performance/adaptivePerformance';

// Performance context type
interface PerformanceContextType {
  // Configuration
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  
  // Adaptive features
  adaptiveConfig: AdaptiveFeatureConfig;
  updateAdaptiveConfig: (updates: Partial<AdaptiveFeatureConfig>) => void;
  
  // Device capability
  deviceCapability: 'low' | 'medium' | 'high';
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
  
  // Helper functions
  shouldUseSimplifiedUI: boolean;
  
  // Metrics
  trackMetric: (
    componentName: string, 
    metricName: string, 
    value: number, 
    metadata?: Record<string, any>
  ) => void;
  
  trackInteraction: (
    name: string, 
    duration: number, 
    metadata?: Record<string, any>
  ) => void;
}

// Create context with default value
const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Provider props
interface PerformanceProviderProps {
  children: ReactNode;
  initialConfig?: Partial<PerfConfig>;
  enableWebVitals?: boolean;
  enableAdaptiveConfig?: boolean;
  enableLogging?: boolean;
}

/**
 * Provider component for performance monitoring
 */
export function PerformanceProvider({
  children,
  initialConfig = {},
  enableWebVitals = true,
  enableAdaptiveConfig = true,
  enableLogging = false
}: PerformanceProviderProps) {
  // Detect device capability
  const deviceCapability = useMemo(() => detectDeviceCapability(), []);
  
  // Initialize performance config
  const [config, setConfig] = useState<PerfConfig>({
    ...DEFAULT_PERF_CONFIG,
    deviceCapability,
    ...initialConfig
  });
  
  // Initialize adaptive config
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveFeatureConfig>(
    getAdaptiveConfig()
  );
  
  // Update configuration
  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Update metrics collector configuration
      perfMetricsCollector.setEnabled(newConfig.enableMetricsCollection);
      perfMetricsCollector.setSamplingRate(newConfig.samplingRate);
      
      return newConfig;
    });
  };
  
  // Update adaptive configuration
  const updateAdaptiveConfig = (updates: Partial<AdaptiveFeatureConfig>) => {
    setAdaptiveConfig(prev => ({ ...prev, ...updates }));
  };
  
  // Track a metric
  const trackMetric = (
    componentName: string,
    metricName: string,
    value: number,
    metadata?: Record<string, any>
  ) => {
    if (!config.enableMetricsCollection) return;
    
    perfMetricsCollector.addMetric({
      component_name: componentName,
      metric_name: metricName,
      value,
      category: 'component',
      type: 'metric',
      ...(metadata && { metadata })
    });
  };
  
  // Track an interaction
  const trackInteraction = (
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ) => {
    if (!config.enableMetricsCollection) return;
    
    perfMetricsCollector.trackInteraction(name, duration, metadata);
  };
  
  // Initialize systems
  useEffect(() => {
    // Initialize web vitals monitoring
    let stopWebVitals: (() => void) | undefined;
    
    if (enableWebVitals) {
      stopWebVitals = initWebVitals({
        enableLogging,
        samplingRate: config.samplingRate
      });
    }
    
    // Initialize adaptive performance
    if (enableAdaptiveConfig) {
      initAdaptivePerformance();
    }
    
    // Configure metrics collector
    perfMetricsCollector.setEnabled(config.enableMetricsCollection);
    perfMetricsCollector.setSamplingRate(config.samplingRate);
    
    // Track initial page load
    perfMetricsCollector.addMetric({
      metric_name: 'pageLoad',
      value: performance.now(),
      category: 'navigation',
      type: 'load',
      page_url: window.location.pathname
    });
    
    if (enableLogging) {
      console.log(`[Performance] Provider initialized with device capability: ${deviceCapability}`);
    }
    
    // Cleanup function
    return () => {
      if (stopWebVitals) {
        stopWebVitals();
      }
      
      // Flush any pending metrics
      perfMetricsCollector.flush();
    };
  }, [enableWebVitals, enableAdaptiveConfig, enableLogging, config.samplingRate, config.enableMetricsCollection, deviceCapability]);
  
  // Update adaptive config periodically
  useEffect(() => {
    if (!enableAdaptiveConfig) return;
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      const newConfig = getAdaptiveConfig();
      setAdaptiveConfig(newConfig);
      
      if (enableLogging) {
        console.log('[Performance] Updated adaptive config:', newConfig);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [enableAdaptiveConfig, enableLogging]);
  
  // Compute derived values
  const isLowPerformance = deviceCapability === 'low';
  const isMediumPerformance = deviceCapability === 'medium';
  const isHighPerformance = deviceCapability === 'high';
  const shouldUseSimplifiedUI = isLowPerformance || 
    (config.enableAdaptiveRendering && !isHighPerformance);
  
  // Context value
  const contextValue: PerformanceContextType = {
    config,
    updateConfig,
    adaptiveConfig,
    updateAdaptiveConfig,
    deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    shouldUseSimplifiedUI,
    trackMetric,
    trackInteraction
  };
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to use performance context
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
}

export default PerformanceContext;
