
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PerfConfig, DEFAULT_PERF_CONFIG } from '../hooks/usePerfConfig';
import { performanceMonitor } from '../utils/performance/performanceMonitor';

// Preset configurations
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

// Context shape
export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  deviceCapability: 'low' | 'medium' | 'high';
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
  shouldUseSimplifiedUI: boolean;
  applyPreset: (presetName: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => void;
}

// Create context
const PerfConfigContext = createContext<PerfConfigContextType | null>(null);

// Hook to use the context
export const usePerfConfig = (): PerfConfigContextType => {
  const context = useContext(PerfConfigContext);
  if (!context) {
    throw new Error('usePerfConfig must be used within a PerfConfigProvider');
  }
  return context;
};

// Provider component
interface PerfConfigProviderProps {
  children: ReactNode;
  initialConfig?: Partial<PerfConfig>;
}

export const PerfConfigProvider: React.FC<PerfConfigProviderProps> = ({
  children,
  initialConfig = {}
}) => {
  // State for the configuration
  const [config, setConfig] = useState<PerfConfig>({
    ...DEFAULT_PERF_CONFIG,
    ...initialConfig
  });
  
  // Update performance monitor when config changes
  React.useEffect(() => {
    performanceMonitor.configure({
      enabled: config.enablePerformanceTracking,
      samplingRate: config.samplingRate,
      debugMode: config.enableDebugLogging
    });
  }, [
    config.enablePerformanceTracking,
    config.samplingRate,
    config.enableDebugLogging
  ]);
  
  // Update configuration with partial updates
  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Apply a preset configuration
  const applyPreset = (presetName: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => {
    const preset = PRESETS[presetName];
    if (preset) {
      setConfig(preset);
    }
  };
  
  // Derived state for UI-level flags
  const isLowPerformance = config.deviceCapability === 'low';
  const isMediumPerformance = config.deviceCapability === 'medium';
  const isHighPerformance = config.deviceCapability === 'high';
  
  // Should we use simplified UI based on device capability?
  const shouldUseSimplifiedUI = isLowPerformance || 
    (config.disableEffects && !isHighPerformance);
  
  // Context value
  const contextValue: PerfConfigContextType = {
    config,
    updateConfig,
    deviceCapability: config.deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    shouldUseSimplifiedUI,
    applyPreset
  };
  
  return (
    <PerfConfigContext.Provider value={contextValue}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
