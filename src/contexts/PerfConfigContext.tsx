
import React, { createContext, useContext, useState } from 'react';

export interface PerfConfig {
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  // Additional properties needed by components
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
}

export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  applyPreset: (preset: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => void;
}

const defaultConfig: PerfConfig = {
  enablePerformanceTracking: process.env.NODE_ENV === 'development',
  enableRenderTracking: process.env.NODE_ENV === 'development',
  enableValidation: process.env.NODE_ENV === 'development',
  enablePropTracking: false,
  enableDebugLogging: false,
  samplingRate: 0.3, // 30% sampling by default
  throttleInterval: 500, // 500ms throttle by default
  maxTrackedComponents: 20,
  intelligentProfiling: true,
  inactiveTabThrottling: true,
  batchUpdates: true
};

export const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  applyPreset: () => {}
});

interface PerfConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<PerfConfig>;
}

export const PerfConfigProvider: React.FC<PerfConfigProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [config, setConfig] = useState<PerfConfig>({
    ...defaultConfig,
    ...initialConfig
  });

  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const applyPreset = (preset: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => {
    let presetConfig: Partial<PerfConfig> = {};
    
    switch (preset) {
      case 'comprehensive':
        presetConfig = {
          enablePerformanceTracking: true,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: true,
          enableDebugLogging: true,
          samplingRate: 1.0,
          throttleInterval: 300,
          intelligentProfiling: true,
          inactiveTabThrottling: true,
          batchUpdates: true
        };
        break;
      case 'balanced':
        presetConfig = {
          enablePerformanceTracking: true,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: false,
          enableDebugLogging: false,
          samplingRate: 0.3,
          throttleInterval: 500,
          intelligentProfiling: true,
          inactiveTabThrottling: true,
          batchUpdates: true
        };
        break;
      case 'minimal':
        presetConfig = {
          enablePerformanceTracking: true,
          enableRenderTracking: false,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          samplingRate: 0.1,
          throttleInterval: 1000,
          intelligentProfiling: false,
          inactiveTabThrottling: true,
          batchUpdates: false
        };
        break;
      case 'disabled':
        presetConfig = {
          enablePerformanceTracking: false,
          enableRenderTracking: false,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          samplingRate: 0,
          throttleInterval: 2000,
          intelligentProfiling: false,
          inactiveTabThrottling: false,
          batchUpdates: false
        };
        break;
    }
    
    setConfig(prev => ({ ...prev, ...presetConfig }));
  };

  return (
    <PerfConfigContext.Provider value={{ config, updateConfig, applyPreset }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

// This export is deprecated and will be removed in future versions
export const usePerfConfig = () => useContext(PerfConfigContext).config;

// Correct way to use the context
export const usePerfConfigContext = () => useContext(PerfConfigContext);
