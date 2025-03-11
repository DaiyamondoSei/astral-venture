
/**
 * Hook for managing performance configuration
 */
import { useState, useCallback, useMemo } from 'react';
import { DeviceCapability } from '../utils/performanceUtils';

export interface PerfConfig {
  // Core settings
  deviceCapability: 'low' | 'medium' | 'high';
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Collector settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Advanced features
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
}

export const DEFAULT_PERF_CONFIG: PerfConfig = {
  deviceCapability: 'medium',
  useManualCapability: false,
  disableAnimations: false,
  disableEffects: false,
  
  samplingRate: 0.1,
  throttleInterval: 1000,
  maxTrackedComponents: 50,
  
  enablePerformanceTracking: true,
  enableRenderTracking: true,
  enableValidation: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true
};

// Preset configurations for different performance profiles
const PRESETS = {
  comprehensive: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 1.0,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    intelligentProfiling: true
  },
  balanced: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 0.3,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: false,
    enableDebugLogging: false
  },
  minimal: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 0.1,
    enablePerformanceTracking: true,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false
  },
  disabled: {
    ...DEFAULT_PERF_CONFIG,
    enablePerformanceTracking: false,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false
  }
};

export type PresetName = 'comprehensive' | 'balanced' | 'minimal' | 'disabled';

/**
 * Hook for managing performance configuration
 */
export function usePerfConfig(initialConfig: Partial<PerfConfig> = {}) {
  const [config, setConfig] = useState<PerfConfig>({
    ...DEFAULT_PERF_CONFIG,
    ...initialConfig
  });
  
  /**
   * Update configuration with partial updates
   */
  const updateConfig = useCallback((updates: Partial<PerfConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  }, []);
  
  /**
   * Apply a preset configuration
   */
  const applyPreset = useCallback((presetName: PresetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setConfig(preset);
    }
  }, []);
  
  // Derived state for UI-level flags
  const isLowPerformance = useMemo(() => config.deviceCapability === 'low', [config.deviceCapability]);
  const isMediumPerformance = useMemo(() => config.deviceCapability === 'medium', [config.deviceCapability]);
  const isHighPerformance = useMemo(() => config.deviceCapability === 'high', [config.deviceCapability]);
  
  // Should we use simplified UI based on device capability?
  const shouldUseSimplifiedUI = useMemo(() => {
    return isLowPerformance || (config.disableEffects && !isHighPerformance);
  }, [isLowPerformance, isHighPerformance, config.disableEffects]);
  
  return {
    config,
    updateConfig,
    deviceCapability: config.deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    shouldUseSimplifiedUI,
    applyPreset
  };
}

export default usePerfConfig;
