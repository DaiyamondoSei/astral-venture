
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
  
  // New optimizations
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
  },
  minimal: {
    enablePerformanceTracking: true,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false, 
    enableDebugLogging: false,
    samplingRate: 0.1, // Only track 10% of renders
    throttleInterval: 1000, // 1 second between updates
    maxTrackedComponents: 10,
    intelligentProfiling: true,
    inactiveTabThrottling: true,
  },
  balanced: {
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: false,
    enableDebugLogging: false,
    samplingRate: 0.3, 
    throttleInterval: 500,
    maxTrackedComponents: 30,
    intelligentProfiling: true,
    inactiveTabThrottling: true,
  },
  comprehensive: {
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    samplingRate: 1.0, // Track all renders
    throttleInterval: 0, // No throttling
    maxTrackedComponents: 100,
    intelligentProfiling: true,
    inactiveTabThrottling: true,
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
    samplingRate: 0.3, // Only monitor 30% of renders by default
    throttleInterval: 500, // 500ms between captures by default
    maxTrackedComponents: 20, // Limit tracked components to 20
    batchUpdates: true, // Use batched updates for better performance
    
    // New optimizations
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
          samplingRate: Math.min(prev.samplingRate, 0.05),
          throttleInterval: Math.max(prev.throttleInterval, 2000)
        }));
      } else {
        // Restore original settings when tab becomes active again
        setConfig(prev => ({
          ...prev,
          samplingRate: initialConfig.samplingRate || 0.3,
          throttleInterval: initialConfig.throttleInterval || 500
        }));
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [config.inactiveTabThrottling, initialConfig]);
  
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
