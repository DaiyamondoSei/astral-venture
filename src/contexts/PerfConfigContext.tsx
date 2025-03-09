
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
  };
  setManualPerformanceMode?: (mode: 'low' | 'medium' | 'high' | 'auto') => void;
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
    enableHighResImages: false
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
    enableHighResImages: config.deviceCapability === 'high'
  };
  
  // Basic web vitals tracking
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});
  
  // Track basic web vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const updateVitals = () => {
        try {
          // Check browser support for various APIs
          if (performance.getEntriesByType && performance.getEntriesByName) {
            const navEntries = performance.getEntriesByType('navigation');
            const navTiming = navEntries.length > 0 ? navEntries[0] as PerformanceNavigationTiming : null;
            
            const fcpEntries = performance.getEntriesByName('first-contentful-paint');
            const fcp = fcpEntries.length > 0 ? fcpEntries[0].startTime : 0;
            
            const vitals: Record<string, number> = {
              fcp
            };
            
            if (navTiming) {
              vitals.ttfb = navTiming.responseStart - navTiming.requestStart;
              vitals.domLoad = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
              vitals.load = navTiming.loadEventEnd - navTiming.fetchStart;
            }
            
            setWebVitals(vitals);
          }
        } catch (err) {
          console.error('Error tracking web vitals:', err);
        }
      };
      
      // Update on load and after a delay
      window.addEventListener('load', updateVitals);
      setTimeout(updateVitals, 3000);
      
      return () => {
        window.removeEventListener('load', updateVitals);
      };
    }
  }, []);

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
        setManualPerformanceMode
      }}
    >
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
