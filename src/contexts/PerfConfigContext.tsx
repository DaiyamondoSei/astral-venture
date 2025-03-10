
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { initWebVitals, trackWebVital, trackComponentRender, reportMetricsToServer } from '../utils/webVitalsMonitor';
import { validateDefined, validateOneOf } from '../utils/validation/runtimeValidation';

// Define device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define logging levels
export type LoggingLevel = 'debug' | 'balanced' | 'minimal' | 'comprehensive';

// Define performance configuration interface
export interface PerfConfig {
  // Feature flags
  enableHighPerformanceMode: boolean;
  enableAdaptiveRendering: boolean;
  enableMetricsCollection: boolean;
  
  // Rendering flags
  animations: boolean;
  particleEffects: boolean;
  backgroundEffects: boolean;
  highQualityRendering: boolean;
  
  // Device classification
  deviceCapability: DeviceCapability;
  
  // Monitoring settings
  monitorMemory: boolean;
  monitorFramerate: boolean;
  
  // Logging configuration
  loggingLevel: LoggingLevel;
}

// Default configuration for different device capabilities
const defaultConfigs: Record<DeviceCapability, PerfConfig> = {
  low: {
    enableHighPerformanceMode: false,
    enableAdaptiveRendering: true,
    enableMetricsCollection: true,
    animations: false,
    particleEffects: false,
    backgroundEffects: false,
    highQualityRendering: false,
    deviceCapability: 'low',
    monitorMemory: true,
    monitorFramerate: true,
    loggingLevel: 'minimal'
  },
  medium: {
    enableHighPerformanceMode: false,
    enableAdaptiveRendering: true,
    enableMetricsCollection: true,
    animations: true,
    particleEffects: true,
    backgroundEffects: false,
    highQualityRendering: false,
    deviceCapability: 'medium',
    monitorMemory: true,
    monitorFramerate: true,
    loggingLevel: 'balanced'
  },
  high: {
    enableHighPerformanceMode: true,
    enableAdaptiveRendering: false,
    enableMetricsCollection: true,
    animations: true,
    particleEffects: true,
    backgroundEffects: true,
    highQualityRendering: true,
    deviceCapability: 'high',
    monitorMemory: true,
    monitorFramerate: true,
    loggingLevel: 'comprehensive'
  }
};

// Performance metrics collection functions
export interface PerformanceMetricsCollector {
  addComponentMetric: (
    componentName: string, 
    renderTime: number, 
    type?: 'render' | 'load' | 'interaction'
  ) => void;
  addWebVital: (
    name: string, 
    value: number, 
    category: 'loading' | 'interaction' | 'visual_stability'
  ) => void;
  reportNow: () => Promise<boolean>;
}

// Context type definition
export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (partial: Partial<PerfConfig>) => void;
  setDeviceCapability: (capability: DeviceCapability) => void;
  resetToDefault: () => void;
  metricsCollector: PerformanceMetricsCollector;
}

// Create the context with a default value
export const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfigs.medium,
  updateConfig: () => {},
  setDeviceCapability: () => {},
  resetToDefault: () => {},
  metricsCollector: {
    addComponentMetric: () => {},
    addWebVital: () => {},
    reportNow: async () => false
  }
});

// Provider component
export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with medium settings by default until we detect device capabilities
  const [config, setConfig] = useState<PerfConfig>(defaultConfigs.medium);
  
  // Reference to cleanup function for web vitals
  const [webVitalsCleanup, setWebVitalsCleanup] = useState<(() => void) | null>(null);
  
  // Function to detect device capabilities
  const detectDeviceCapability = useCallback((): DeviceCapability => {
    try {
      // Access navigator properties safely
      const nav = navigator as any;
      
      // Low-end device detection
      if (
        // Memory constraints (less than 4GB)
        (nav.deviceMemory && nav.deviceMemory < 4) ||
        // CPU constraints (less than 4 cores)
        (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) ||
        // Connection constraints (slow connection)
        (nav.connection && 
          ['slow-2g', '2g', '3g'].includes(nav.connection.effectiveType))
      ) {
        return 'low';
      }
      
      // High-end device detection
      if (
        // Good memory (8GB+)
        (nav.deviceMemory && nav.deviceMemory >= 8) &&
        // Good CPU (8+ cores)
        (nav.hardwareConcurrency && nav.hardwareConcurrency >= 8) &&
        // Good connection
        (!nav.connection || 
          ['4g', 'wifi'].includes(nav.connection.effectiveType))
      ) {
        return 'high';
      }
      
      // Default to medium for anything else
      return 'medium';
    } catch (error) {
      console.warn('Error detecting device capability:', error);
      return 'medium'; // Default to medium on error
    }
  }, []);
  
  // Update the config with partial changes
  const updateConfig = useCallback((partialConfig: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...partialConfig
    }));
  }, []);
  
  // Set the device capability and update config accordingly
  const setDeviceCapability = useCallback((capability: DeviceCapability) => {
    // Validate capability using our validation utilities
    try {
      const validatedCapability = validateOneOf(
        capability, 
        ['low', 'medium', 'high'] as DeviceCapability[], 
        'deviceCapability'
      );
      setConfig(defaultConfigs[validatedCapability]);
    } catch (error) {
      console.error('Invalid device capability:', error);
      // Fall back to medium if invalid
      setConfig(defaultConfigs.medium);
    }
  }, []);
  
  // Reset to default based on device capability
  const resetToDefault = useCallback(() => {
    const capability = detectDeviceCapability();
    setConfig(defaultConfigs[capability]);
  }, [detectDeviceCapability]);
  
  // Initialize performance metrics collector
  const metricsCollector: PerformanceMetricsCollector = {
    addComponentMetric: (componentName, renderTime, type = 'render') => {
      try {
        // Validate inputs
        validateDefined(componentName, 'componentName');
        validateDefined(renderTime, 'renderTime');
        
        // Use the trackComponentRender function directly
        trackComponentRender(
          componentName, 
          renderTime, 
          type === 'load' ? 'initial' : (type === 'interaction' ? 'effect' : 'update')
        );
      } catch (error) {
        console.error('Error recording component metric:', error);
      }
    },
    
    addWebVital: (name, value, category) => {
      try {
        // Validate inputs
        validateDefined(name, 'name');
        validateDefined(value, 'value');
        validateOneOf(category, ['loading', 'interaction', 'visual_stability'], 'category');
        
        // Use the trackWebVital function directly
        trackWebVital(name, value, category);
      } catch (error) {
        console.error('Error recording web vital:', error);
      }
    },
    
    reportNow: async () => {
      try {
        // Use the reportMetricsToServer function directly
        return await reportMetricsToServer();
      } catch (error) {
        console.error('Error reporting metrics:', error);
        return false;
      }
    }
  };
  
  // Initialize web vitals monitoring when enabled
  useEffect(() => {
    if (config.enableMetricsCollection) {
      // Clean up previous instance if any
      if (webVitalsCleanup) {
        webVitalsCleanup();
      }
      
      // Only initialize in production to avoid development overhead
      if (import.meta.env.PROD) {
        // Use the initWebVitals function directly
        const cleanup = initWebVitals();
        setWebVitalsCleanup(() => cleanup);
      }
    }
    
    return () => {
      // Clean up when unmounting or config changes
      if (webVitalsCleanup) {
        webVitalsCleanup();
        setWebVitalsCleanup(null);
      }
    };
  }, [config.enableMetricsCollection]);
  
  // Detect device capability on mount
  useEffect(() => {
    // Start with medium settings
    let initialCapability: DeviceCapability = 'medium';
    
    try {
      // Try to detect device capability
      initialCapability = detectDeviceCapability();
      
      // Override with URL parameters if present (for testing)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const forceCapability = urlParams.get('deviceCap') as DeviceCapability | null;
        
        if (forceCapability && ['low', 'medium', 'high'].includes(forceCapability)) {
          initialCapability = forceCapability as DeviceCapability;
          console.log(`Forced device capability via URL: ${forceCapability}`);
        }
      }
    } catch (error) {
      console.warn('Error during initial capability detection:', error);
    }
    
    // Set initial configuration based on detected capability
    setConfig(defaultConfigs[initialCapability]);
    
    // Log the detected capability
    console.log(`Detected device capability: ${initialCapability}`);
  }, [detectDeviceCapability]);
  
  // Create context value
  const contextValue: PerfConfigContextType = {
    config,
    updateConfig,
    setDeviceCapability,
    resetToDefault,
    metricsCollector
  };
  
  return (
    <PerfConfigContext.Provider value={contextValue}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
