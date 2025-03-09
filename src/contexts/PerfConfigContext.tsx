import React, { createContext, useState, useCallback, useEffect } from 'react';
import { detectDeviceCapability } from '@/utils/adaptiveRendering';

// Performance configuration type
export interface PerfConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  deviceCapability: 'low' | 'medium' | 'high';
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
  samplingRate?: number;
  throttleInterval?: number;
  maxTrackedComponents?: number;
  enableMemoryMonitoring?: boolean;
  batchRenderUpdates?: boolean;
  enableDetailedLogging?: boolean;
}

// Context type
export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (config: Partial<PerfConfig>) => void;
  applyPreset: (preset: 'low' | 'medium' | 'high' | 'debug') => void;
  webVitals?: Record<string, number>;
  deviceCapability: 'low' | 'medium' | 'high';
  manualPerformanceMode?: 'low' | 'medium' | 'high' | 'auto';
  features: {
    enableParticles: boolean;
    enableComplexAnimations: boolean;
    enableHighResImages: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    enableWebWorkers: boolean;
  };
  setManualPerformanceMode?: (mode: 'low' | 'medium' | 'high' | 'auto') => void;
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
  samplingRate?: number;
  throttleInterval?: number;
  maxTrackedComponents?: number;
}

// Default configuration
const defaultConfig: PerfConfig = {
  enableVirtualization: true,
  enableLazyLoading: true,
  deviceCapability: 'medium',
  enablePerformanceTracking: false,
  enableRenderTracking: false,
  enableValidation: false,
  enablePropTracking: false,
  enableDebugLogging: false,
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true,
  samplingRate: 20,
  throttleInterval: 300,
  maxTrackedComponents: 20
};

// Create context
const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  applyPreset: () => {},
  deviceCapability: 'medium',
  features: {
    enableParticles: true,
    enableComplexAnimations: true,
    enableHighResImages: false,
    enableBlur: true,
    enableShadows: true,
    enableWebWorkers: true
  }
});

// Provider component
export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PerfConfig>(() => {
    // Use stored config if available
    if (typeof window !== 'undefined') {
      try {
        const storedConfig = localStorage.getItem('perfConfig');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          return {
            ...defaultConfig,
            ...parsedConfig
          };
        }
      } catch (error) {
        console.error('Error reading stored performance config:', error);
      }
    }
    
    // Otherwise use default with detected device capability
    return {
      ...defaultConfig,
      deviceCapability: detectDeviceCapability()
    };
  });

  // Save config changes to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('perfConfig', JSON.stringify(config));
      } catch (error) {
        console.error('Error saving performance config:', error);
      }
    }
  }, [config]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  }, []);

  // Apply preset configurations
  const applyPreset = useCallback((preset: 'low' | 'medium' | 'high' | 'debug') => {
    if (preset === 'low') {
      setConfig({
        ...defaultConfig,
        deviceCapability: 'low',
        enableVirtualization: true,
        enableLazyLoading: true,
        enablePerformanceTracking: false,
        enableRenderTracking: false,
        enableValidation: false,
        intelligentProfiling: false,
      });
    } else if (preset === 'medium') {
      setConfig({
        ...defaultConfig,
        deviceCapability: 'medium',
        enablePerformanceTracking: true,
        enableRenderTracking: false,
        intelligentProfiling: true,
      });
    } else if (preset === 'high') {
      setConfig({
        ...defaultConfig,
        deviceCapability: 'high',
        enablePerformanceTracking: true,
        enableRenderTracking: true,
        enableValidation: true,
        intelligentProfiling: true,
      });
    } else if (preset === 'debug') {
      setConfig({
        ...defaultConfig,
        deviceCapability: 'high',
        enablePerformanceTracking: true,
        enableRenderTracking: true,
        enableValidation: true,
        enablePropTracking: true,
        enableDebugLogging: true,
        intelligentProfiling: true,
        samplingRate: 100,
        maxTrackedComponents: 50,
      });
    }
  }, []);

  // Manual performance mode setting
  const [manualMode, setManualMode] = useState<'low' | 'medium' | 'high' | 'auto'>('auto');

  const setManualPerformanceMode = useCallback((mode: 'low' | 'medium' | 'high' | 'auto') => {
    setManualMode(mode);
    
    if (mode !== 'auto') {
      updateConfig({ deviceCapability: mode });
    } else {
      // When set to auto, redetect capability
      updateConfig({ deviceCapability: detectDeviceCapability() });
    }
    
    // Store preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('manualPerformanceMode', mode);
    }
  }, [updateConfig]);

  // Features derived from device capability
  const features = {
    enableParticles: config.deviceCapability !== 'low',
    enableComplexAnimations: config.deviceCapability !== 'low',
    enableHighResImages: config.deviceCapability === 'high',
    enableBlur: config.deviceCapability !== 'low',
    enableShadows: config.deviceCapability !== 'low',
    enableWebWorkers: config.deviceCapability !== 'low'
  };
  
  // Web vitals tracking
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});

  return (
    <PerfConfigContext.Provider 
      value={{ 
        config, 
        updateConfig, 
        applyPreset,
        webVitals,
        features,
        deviceCapability: config.deviceCapability,
        manualPerformanceMode: manualMode,
        setManualPerformanceMode,
        enablePerformanceTracking: config.enablePerformanceTracking,
        enableRenderTracking: config.enableRenderTracking,
        enableValidation: config.enableValidation,
        enablePropTracking: config.enablePropTracking,
        enableDebugLogging: config.enableDebugLogging,
        intelligentProfiling: config.intelligentProfiling,
        inactiveTabThrottling: config.inactiveTabThrottling,
        batchUpdates: config.batchUpdates,
        samplingRate: config.samplingRate,
        throttleInterval: config.throttleInterval,
        maxTrackedComponents: config.maxTrackedComponents
      }}
    >
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
