
/**
 * Enhanced Performance Configuration Hook
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  DeviceCapability, 
  PerformanceMode,
  AdaptiveSettings,
  QualityLevel
} from '../utils/performance/types';
import { Result, success } from '../utils/result/Result';
import { detectDeviceCapability } from '../utils/performanceUtils';

// Enhanced performance configuration with adaptive rendering
export interface PerfConfig {
  // Core settings
  deviceCapability: DeviceCapability;
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
  
  // Enhanced features (Phase 1)
  enableAdaptiveRendering: boolean;
  adaptiveQualityLevels: number;
  enableProgressiveEnhancement: boolean;
  resourceOptimizationLevel: 'none' | 'conservative' | 'aggressive';
  metricsPersistence: boolean;
}

// Enhanced default configuration
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
  batchUpdates: true,
  
  // Enhanced defaults (Phase 1)
  enableAdaptiveRendering: true,
  adaptiveQualityLevels: 3,
  enableProgressiveEnhancement: true,
  resourceOptimizationLevel: 'conservative',
  metricsPersistence: true
};

// Enhanced presets with new configuration options
const PRESETS = {
  comprehensive: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 1.0,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    intelligentProfiling: true,
    adaptiveQualityLevels: 5,
    resourceOptimizationLevel: 'aggressive'
  },
  balanced: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 0.3,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: false,
    enableDebugLogging: false,
    adaptiveQualityLevels: 3,
    resourceOptimizationLevel: 'conservative'
  },
  minimal: {
    ...DEFAULT_PERF_CONFIG,
    samplingRate: 0.1,
    enablePerformanceTracking: true,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    adaptiveQualityLevels: 2,
    resourceOptimizationLevel: 'conservative'
  },
  disabled: {
    ...DEFAULT_PERF_CONFIG,
    enablePerformanceTracking: false,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    enableAdaptiveRendering: false,
    enableProgressiveEnhancement: false,
    resourceOptimizationLevel: 'none'
  }
};

export type PresetName = 'comprehensive' | 'balanced' | 'minimal' | 'disabled';
export type OptimizationTarget = 'performance' | 'quality' | 'balanced';

/**
 * Enhanced hook for managing performance configuration
 */
export function usePerfConfig(initialConfig: Partial<PerfConfig> = {}) {
  // Initialize with enhanced defaults and provided values
  const [config, setConfig] = useState<PerfConfig>({
    ...DEFAULT_PERF_CONFIG,
    ...initialConfig
  });
  
  // Detect device capability on mount
  useEffect(() => {
    if (!config.useManualCapability) {
      const detectedCapability = detectDeviceCapability();
      setConfig(prev => ({
        ...prev,
        deviceCapability: detectedCapability
      }));
    }
  }, [config.useManualCapability]);
  
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
  
  /**
   * Optimize configuration for a specific target
   */
  const optimizeFor = useCallback((target: OptimizationTarget) => {
    switch (target) {
      case 'performance':
        setConfig(prev => ({
          ...prev,
          disableAnimations: prev.deviceCapability !== 'high',
          disableEffects: prev.deviceCapability !== 'high',
          samplingRate: 0.05,
          enablePropTracking: false,
          intelligentProfiling: true,
          adaptiveQualityLevels: 2,
          resourceOptimizationLevel: 'aggressive'
        }));
        break;
      case 'quality':
        setConfig(prev => ({
          ...prev,
          disableAnimations: false,
          disableEffects: false,
          samplingRate: 0.2,
          adaptiveQualityLevels: 5,
          resourceOptimizationLevel: 'conservative'
        }));
        break;
      case 'balanced':
      default:
        applyPreset('balanced');
        break;
    }
  }, [applyPreset]);
  
  /**
   * Get configuration summary
   */
  const getConfigSummary = useCallback((): Record<string, any> => {
    return {
      deviceTier: config.deviceCapability,
      animationsEnabled: !config.disableAnimations,
      effectsEnabled: !config.disableEffects,
      adaptiveRenderingEnabled: config.enableAdaptiveRendering,
      qualityLevels: config.adaptiveQualityLevels,
      optimizationLevel: config.resourceOptimizationLevel,
      trackingEnabled: config.enablePerformanceTracking
    };
  }, [config]);
  
  /**
   * Export configuration to JSON
   */
  const exportConfig = useCallback((): Result<string, Error> => {
    try {
      return success(JSON.stringify(config, null, 2));
    } catch (error) {
      return {
        type: 'failure',
        error: error instanceof Error ? error : new Error('Failed to export configuration')
      };
    }
  }, [config]);
  
  // Derived state for UI-level flags
  const isLowPerformance = useMemo(() => config.deviceCapability === 'low', [config.deviceCapability]);
  const isMediumPerformance = useMemo(() => config.deviceCapability === 'medium', [config.deviceCapability]);
  const isHighPerformance = useMemo(() => config.deviceCapability === 'high', [config.deviceCapability]);
  
  // Should we use simplified UI based on device capability and adaptive rendering?
  const shouldUseSimplifiedUI = useMemo(() => {
    if (!config.enableAdaptiveRendering) {
      // If adaptive rendering is disabled, use simplified UI only for low performance devices
      return isLowPerformance;
    }
    
    // With adaptive rendering, use simplified UI for low and potentially medium devices
    return isLowPerformance || 
           (isMediumPerformance && (config.disableEffects || config.adaptiveQualityLevels < 3));
  }, [
    isLowPerformance, 
    isMediumPerformance, 
    config.disableEffects, 
    config.enableAdaptiveRendering, 
    config.adaptiveQualityLevels
  ]);
  
  // Get the effective quality level based on configuration
  const effectiveQualityLevel = useMemo(() => {
    if (isHighPerformance && !config.disableEffects) return config.adaptiveQualityLevels;
    if (isMediumPerformance && !config.disableEffects) return Math.max(1, config.adaptiveQualityLevels - 1);
    return 1; // Lowest quality for low performance or when effects are disabled
  }, [
    isHighPerformance, 
    isMediumPerformance, 
    config.disableEffects, 
    config.adaptiveQualityLevels
  ]);
  
  return {
    config,
    updateConfig,
    deviceCapability: config.deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    shouldUseSimplifiedUI,
    effectiveQualityLevel,
    applyPreset,
    optimizeFor,
    getConfigSummary,
    exportConfig
  };
}

export default usePerfConfig;
