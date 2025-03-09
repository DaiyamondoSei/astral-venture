
import React, { createContext, useState, useMemo, useEffect } from 'react';

export interface PerfConfigContextType {
  // Core feature flags
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Advanced settings
  samplingRate: number;  // Only monitor a percentage of renders
  throttleInterval: number; // Milliseconds between captures
  maxTrackedComponents: number; // Limit total tracked components
  batchUpdates: boolean; // Batch state updates for efficiency
  
  // Backend integration
  enableBackendIntegration: boolean;
  backendSyncInterval: number;
  
  // Optimizations
  intelligentProfiling: boolean; // Focus on problematic components
  inactiveTabThrottling: boolean; // Reduce monitoring when tab inactive
  
  // Reset and apply functions
  setPerformanceConfig: (config: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig' | 'applyPreset'>>) => void;
  applyPreset: (preset: 'disabled' | 'minimal' | 'balanced' | 'comprehensive') => void;
}

export const PerfConfigContext = createContext<PerfConfigContextType | null>(null);

interface PerfConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig' | 'applyPreset'>>;
}

// Preset configurations for quick application
const presets = {
  disabled: {
    enablePerformanceTracking: false,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    intelligentProfiling: false,
    inactiveTabThrottling: false,
    enableBackendIntegration: false,
  },
  minimal: {
    enablePerformanceTracking: true,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false, 
    enableDebugLogging: false,
    samplingRate: 0.05, // Only track 5% of renders (reduced from 0.1)
    throttleInterval: 2000, // 2 seconds between updates (increased from 1000)
    maxTrackedComponents: 5, // Reduced from 10
    intelligentProfiling: true,
    inactiveTabThrottling: true,
    enableBackendIntegration: true,
    backendSyncInterval: 60000, // 1 minute
  },
  balanced: {
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: false,
    enableDebugLogging: false,
    samplingRate: 0.2, // Reduced from 0.3
    throttleInterval: 1000, // Increased from 500
    maxTrackedComponents: 15, // Reduced from 30
    intelligentProfiling: true,
    inactiveTabThrottling: true,
    enableBackendIntegration: true,
    backendSyncInterval: 30000, // 30 seconds
  },
  comprehensive: {
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    samplingRate: 0.5, // Track 50% of renders (reduced from 1.0)
    throttleInterval: 500, // 500ms (increased from 0)
    maxTrackedComponents: 30, // Reduced from 100
    intelligentProfiling: true,
    inactiveTabThrottling: true,
    enableBackendIntegration: true,
    backendSyncInterval: 15000, // 15 seconds
  }
};

export const PerfConfigProvider: React.FC<PerfConfigProviderProps> = ({ 
  children,
  initialConfig = {}
}) => {
  // Default configuration optimized for development without excessive overhead
  const [config, setConfig] = useState({
    // Core feature flags - only enable performance tracking by default
    enablePerformanceTracking: process.env.NODE_ENV === 'development',
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    
    // Advanced settings
    samplingRate: 0.1, // Only monitor 10% of renders by default (reduced from 0.3)
    throttleInterval: 1000, // 1000ms between captures by default (increased from 500)
    maxTrackedComponents: 10, // Limit tracked components to 10 (reduced from 20)
    batchUpdates: true, // Use batched updates for better performance
    
    // Backend integration
    enableBackendIntegration: true,
    backendSyncInterval: 30000, // 30 seconds
    
    // Optimizations
    intelligentProfiling: true, // Focus monitoring on problematic components
    inactiveTabThrottling: true, // Reduce monitoring when tab is inactive
    
    ...initialConfig
  });
  
  // Tab visibility tracking for throttling
  useEffect(() => {
    if (!config.inactiveTabThrottling) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Drastically reduce monitoring when tab is inactive
        setConfig(prev => ({
          ...prev,
          samplingRate: Math.min(prev.samplingRate, 0.02), // Reduced from 0.05
          throttleInterval: Math.max(prev.throttleInterval, 5000) // Increased from 2000
        }));
      } else {
        // Restore original settings when tab becomes active again
        setConfig(prev => ({
          ...prev,
          samplingRate: initialConfig.samplingRate || 0.1, // Reduced from 0.3
          throttleInterval: initialConfig.throttleInterval || 1000 // Increased from 500
        }));
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [config.inactiveTabThrottling, initialConfig]);
  
  // Detect device capabilities and adjust settings accordingly
  useEffect(() => {
    // Simple device capability detection
    const isLowEndDevice = () => {
      // Check for low memory devices
      if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        return true;
      }
      
      // Check for older devices based on hardware concurrency
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true;
      }
      
      return false;
    };
    
    // Adjust settings for low-end devices
    if (isLowEndDevice()) {
      setConfig(prev => ({
        ...prev,
        samplingRate: Math.min(prev.samplingRate, 0.05),
        throttleInterval: Math.max(prev.throttleInterval, 2000),
        maxTrackedComponents: Math.min(prev.maxTrackedComponents, 5),
        enableRenderTracking: false,
        enablePropTracking: false
      }));
    }
  }, []);
  
  const setPerformanceConfig = (newConfig: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig' | 'applyPreset'>>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };
  
  const applyPreset = (preset: 'disabled' | 'minimal' | 'balanced' | 'comprehensive') => {
    setConfig(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };
  
  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => ({
    ...config,
    setPerformanceConfig,
    applyPreset
  }), [config]);
  
  return (
    <PerfConfigContext.Provider value={contextValue}>
      {children}
    </PerfConfigContext.Provider>
  );
};
