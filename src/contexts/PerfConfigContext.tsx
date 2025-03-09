
import React, { createContext, useEffect, useState } from 'react';

export interface PerformanceConfig {
  // Rendering settings
  enableAdaptiveRendering: boolean;
  adaptiveRenderingThreshold: number;
  lowPerfMode: boolean;
  reducedMotion: boolean;
  
  // Performance monitoring
  enablePerformanceTracking: boolean;
  performanceTrackingInterval: number;
  samplingRate: number;
  
  // Error prevention
  enableErrorPrevention: boolean;
  errorPreventionLevel: 'basic' | 'aggressive';
  validateProps: boolean;
  
  // Device capabilities
  devicePerformanceLevel: 'low' | 'medium' | 'high';
  isLowMemoryDevice: boolean;
  isLowCPUDevice: boolean;
  
  // Component optimization
  enableLazyLoading: boolean;
  enableCodeSplitting: boolean;
  
  // Network settings
  lowDataMode: boolean;
  offlineMode: boolean;
}

export type PerformanceConfigKey = keyof PerformanceConfig;

const defaultConfig: PerformanceConfig = {
  // Rendering settings
  enableAdaptiveRendering: true,
  adaptiveRenderingThreshold: 30, // fps
  lowPerfMode: false,
  reducedMotion: false,
  
  // Performance monitoring
  enablePerformanceTracking: true,
  performanceTrackingInterval: 5000,
  samplingRate: 0.1,
  
  // Error prevention
  enableErrorPrevention: true,
  errorPreventionLevel: 'basic',
  validateProps: true,
  
  // Device capabilities
  devicePerformanceLevel: 'medium',
  isLowMemoryDevice: false,
  isLowCPUDevice: false,
  
  // Component optimization
  enableLazyLoading: true,
  enableCodeSplitting: true,
  
  // Network settings
  lowDataMode: false,
  offlineMode: false
};

interface PerfConfigContextType {
  config: PerformanceConfig;
  setConfig: (config: Partial<PerformanceConfig>) => void;
  resetConfig: () => void;
  toggleSetting: (key: PerformanceConfigKey) => void;
  isLowPerfDevice: boolean;
  detectDeviceCapabilities: () => void;
}

export const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  setConfig: () => {},
  resetConfig: () => {},
  toggleSetting: () => {},
  isLowPerfDevice: false,
  detectDeviceCapabilities: () => {}
});

export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<PerformanceConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('perfConfig');
      return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
    } catch (e) {
      return defaultConfig;
    }
  });
  
  // Derive if this is a low performance device
  const isLowPerfDevice = config.devicePerformanceLevel === 'low' || 
                          config.isLowMemoryDevice || 
                          config.isLowCPUDevice;
  
  // Update config
  const setConfig = (newConfig: Partial<PerformanceConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('perfConfig', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save performance config to localStorage', e);
      }
      return updated;
    });
  };
  
  // Reset config to defaults
  const resetConfig = () => {
    setConfigState(defaultConfig);
    try {
      localStorage.removeItem('perfConfig');
    } catch (e) {
      console.warn('Could not remove performance config from localStorage', e);
    }
  };
  
  // Toggle boolean setting
  const toggleSetting = (key: PerformanceConfigKey) => {
    setConfigState(prev => {
      const value = prev[key];
      if (typeof value === 'boolean') {
        const updated = { ...prev, [key]: !value };
        try {
          localStorage.setItem('perfConfig', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not save performance config to localStorage', e);
        }
        return updated;
      }
      return prev;
    });
  };
  
  // Detect device capabilities
  const detectDeviceCapabilities = () => {
    // Detect device performance level
    const devicePerformanceLevel = detectPerformanceLevel();
    
    // Detect memory constraints
    const isLowMemoryDevice = typeof navigator !== 'undefined' && 'memory' in navigator && 
                              (navigator as any).memory && 
                              (navigator as any).memory.jsHeapSizeLimit < 2147483648; // 2GB
    
    // Detect CPU constraints based on hardware concurrency
    const isLowCPUDevice = typeof navigator !== 'undefined' && 
                           navigator.hardwareConcurrency != null && 
                           navigator.hardwareConcurrency <= 4;
    
    // Detect if reducedMotion is preferred
    const reducedMotion = typeof window !== 'undefined' && 
                          window.matchMedia && 
                          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect if data saver is enabled
    const lowDataMode = typeof navigator !== 'undefined' && 
                        'connection' in navigator && 
                        (navigator as any).connection && 
                        (navigator as any).connection.saveData === true;
    
    // Update config with detected values
    setConfig({
      devicePerformanceLevel,
      isLowMemoryDevice,
      isLowCPUDevice,
      reducedMotion,
      lowDataMode,
      // Adjust other settings based on device capabilities
      enableLazyLoading: true,
      enableCodeSplitting: !isLowMemoryDevice,
      enableAdaptiveRendering: true,
      lowPerfMode: devicePerformanceLevel === 'low',
      samplingRate: devicePerformanceLevel === 'low' ? 0.05 : devicePerformanceLevel === 'medium' ? 0.1 : 0.2
    });
  };
  
  // Helper to detect performance level
  const detectPerformanceLevel = (): 'low' | 'medium' | 'high' => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'medium';
    }
    
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    
    // Check for memory
    const memoryIsLow = typeof navigator !== 'undefined' && 
                        'memory' in navigator && 
                        (navigator as any).memory && 
                        (navigator as any).memory.jsHeapSizeLimit < 2147483648; // 2GB
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (cores <= 2 || (isMobile && memoryIsLow)) {
      return 'low';
    } else if (cores <= 4 || isMobile) {
      return 'medium';
    } else {
      return 'high';
    }
  };
  
  // Detect device capabilities on mount
  useEffect(() => {
    detectDeviceCapabilities();
    
    // Re-detect on visibility change (user may switch between tabs/devices)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        detectDeviceCapabilities();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <PerfConfigContext.Provider 
      value={{ 
        config, 
        setConfig, 
        resetConfig, 
        toggleSetting,
        isLowPerfDevice,
        detectDeviceCapabilities
      }}
    >
      {children}
    </PerfConfigContext.Provider>
  );
};
