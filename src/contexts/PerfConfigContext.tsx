
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { PerfConfig, defaultConfigs } from '@/hooks/usePerfConfig';

export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (newConfig: Partial<PerfConfig>) => void;
  resetConfig: () => void;
  deviceCapability: 'low' | 'medium' | 'high';
  setDeviceCapability: (capability: 'low' | 'medium' | 'high') => void;
  manualPerformanceMode: boolean;
  setManualPerformanceMode: (enabled: boolean) => void;
  features: Record<string, boolean>;
  webVitals: Record<string, number>;
  applyPreset: (preset: 'low' | 'medium' | 'high') => void;
  // Extra helper methods
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  // Advanced configuration
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  // Metrics settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
}

const PerfConfigContext = createContext<PerfConfigContextType | undefined>(undefined);

export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect the device capability (in a real app, we would do more sophisticated detection)
  const [deviceCapability, setDeviceCapability] = useState<'low' | 'medium' | 'high'>('medium');
  const [manualPerformanceMode, setManualPerformanceMode] = useState(false);
  const [config, setConfig] = useState<PerfConfig>(defaultConfigs[deviceCapability]);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});

  // Update config when device capability changes
  useEffect(() => {
    if (!manualPerformanceMode) {
      setConfig(defaultConfigs[deviceCapability]);
    }
  }, [deviceCapability, manualPerformanceMode]);

  const updateConfig = useCallback((newConfig: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
    
    // Enable manual mode when user explicitly updates config
    setManualPerformanceMode(true);
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfigs[deviceCapability]);
    setManualPerformanceMode(false);
  }, [deviceCapability]);

  const applyPreset = useCallback((preset: 'low' | 'medium' | 'high') => {
    setConfig(defaultConfigs[preset]);
    setManualPerformanceMode(true);
  }, []);

  // Expose key configuration properties directly for convenience
  const enablePerformanceTracking = config.enablePerformanceTracking ?? false;
  const enableRenderTracking = config.enableRenderTracking ?? false;
  const enableValidation = config.enableValidation ?? false;
  const enablePropTracking = config.enablePropTracking ?? false;
  const enableDebugLogging = config.enableDetailedLogging ?? false;
  
  // Advanced configuration
  const intelligentProfiling = config.intelligentProfiling ?? false;
  const inactiveTabThrottling = config.inactiveTabThrottling ?? false;
  const batchUpdates = config.batchUpdates ?? false;
  
  // Metrics settings
  const samplingRate = config.samplingRate ?? 0.1;
  const throttleInterval = config.throttleInterval ?? 300;
  const maxTrackedComponents = config.maxTrackedComponents ?? 20;

  return (
    <PerfConfigContext.Provider value={{
      config,
      updateConfig,
      resetConfig,
      deviceCapability,
      setDeviceCapability,
      manualPerformanceMode,
      setManualPerformanceMode,
      features,
      webVitals,
      applyPreset,
      // Convenience accessors
      enablePerformanceTracking,
      enableRenderTracking,
      enableValidation,
      enablePropTracking,
      enableDebugLogging,
      // Advanced configuration
      intelligentProfiling,
      inactiveTabThrottling,
      batchUpdates,
      // Metrics settings
      samplingRate,
      throttleInterval,
      maxTrackedComponents,
    }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
