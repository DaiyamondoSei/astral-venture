
/**
 * Performance Context
 * 
 * React context for performance monitoring and optimization.
 */
import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { metricsCollector } from '@/utils/performance/metricsCollector';
import { detectDeviceCapability } from '@/utils/performanceUtils';
import { 
  DeviceCapability,
  PerformanceMonitorConfig,
  MetricType
} from '@/utils/performance/types';

// Default monitor configuration
export const DEFAULT_MONITOR_CONFIG: PerformanceMonitorConfig = {
  enabled: true,
  metricsEnabled: true,
  slowRenderThreshold: 16, // 60fps threshold
  samplingRate: 0.1, // Sample 10% of metrics by default
  optimizationLevel: 'auto',
  throttleInterval: 1000,
  maxTrackedComponents: 50,
  enablePerformanceTracking: true,
  enableRenderTracking: true,
  enableValidation: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true,
  debugMode: false
};

// Context state
interface PerformanceContextState {
  // Configuration
  config: PerformanceMonitorConfig;
  updateConfig: (updates: Partial<PerformanceMonitorConfig>) => void;
  
  // Device capability
  deviceCapability: DeviceCapability;
  setDeviceCapability: (capability: DeviceCapability) => void;
  
  // Metrics tracking
  trackMetric: (
    componentName: string, 
    metricName: string, 
    value: number, 
    metadata?: Record<string, any>
  ) => void;
  
  // Performance levels
  qualityLevel: number;
  setQualityLevel: (level: number) => void;
  
  // Performance state
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
}

// Create the context
const PerformanceContext = createContext<PerformanceContextState | undefined>(undefined);

// Provider props
interface PerformanceProviderProps {
  children: ReactNode;
  initialConfig?: Partial<PerformanceMonitorConfig>;
}

/**
 * Performance Provider component
 */
export function PerformanceProvider({ 
  children,
  initialConfig = {}
}: PerformanceProviderProps) {
  // Initialize configuration
  const [config, setConfig] = useState<PerformanceMonitorConfig>({
    ...DEFAULT_MONITOR_CONFIG,
    ...initialConfig
  });
  
  // Device capability state
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('medium');
  
  // Quality level state
  const [qualityLevel, setQualityLevel] = useState<number>(3);
  
  // Derived performance states
  const isLowPerformance = deviceCapability === 'low';
  const isMediumPerformance = deviceCapability === 'medium';
  const isHighPerformance = deviceCapability === 'high';
  
  // Detect device capability on mount
  useEffect(() => {
    const detectedCapability = detectDeviceCapability();
    setDeviceCapability(detectedCapability);
    
    // Set appropriate quality level based on device capability
    if (detectedCapability === 'low') {
      setQualityLevel(1);
    } else if (detectedCapability === 'medium') {
      setQualityLevel(2);
    } else {
      setQualityLevel(4);
    }
  }, []);
  
  // Update configuration
  const updateConfig = (updates: Partial<PerformanceMonitorConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Apply configuration changes to the metrics collector
      if (metricsCollector) {
        metricsCollector.setEnabled(newConfig.enabled && newConfig.metricsEnabled);
        if (typeof newConfig.throttleInterval === 'number') {
          metricsCollector.setThrottleInterval(newConfig.throttleInterval);
        }
      }
      
      return newConfig;
    });
  };
  
  // Track a performance metric
  const trackMetric = (
    componentName: string, 
    metricName: string, 
    value: number, 
    metadata?: Record<string, any>
  ) => {
    if (config.enabled && config.enablePerformanceTracking) {
      const type: MetricType = metricName.includes('render') ? 'render' : 'metric';
      metricsCollector.collect(
        metricName,
        value,
        type,
        metadata,
        componentName
      );
    }
  };
  
  // Context value
  const contextValue = useMemo(() => ({
    config,
    updateConfig,
    deviceCapability,
    setDeviceCapability,
    trackMetric,
    qualityLevel,
    setQualityLevel,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance
  }), [
    config, 
    deviceCapability, 
    qualityLevel, 
    isLowPerformance, 
    isMediumPerformance, 
    isHighPerformance
  ]);
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to use the performance context
 */
export function usePerformance(): PerformanceContextState {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
