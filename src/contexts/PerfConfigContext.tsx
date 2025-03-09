
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

// Performance configuration type
export interface PerfConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  enablePerformanceReporting: boolean;
  enableIntersectionObserver: boolean;
  deviceCapability: 'low' | 'medium' | 'high';
}

// Context type
export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (config: Partial<PerfConfig>) => void;
}

// Default configuration
const defaultConfig: PerfConfig = {
  enableVirtualization: true,
  enableLazyLoading: true,
  enablePerformanceReporting: false,
  enableIntersectionObserver: true,
  deviceCapability: 'medium',
};

// Create context
const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
});

// Provider component
export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PerfConfig>(defaultConfig);

  // Detect device capability on mount
  useEffect(() => {
    const detectDeviceCapability = () => {
      // Simple device capability detection based on browser features
      const memory = (navigator as any).deviceMemory;
      const cpuCores = navigator.hardwareConcurrency;
      
      // Assess device capability based on available resources
      if (memory && memory <= 2 || cpuCores && cpuCores <= 2) {
        return 'low';
      } else if (memory && memory >= 8 || cpuCores && cpuCores >= 8) {
        return 'high';
      } else {
        return 'medium';
      }
    };

    // Update config with detected capability
    const capability = detectDeviceCapability();
    setConfig(prev => ({
      ...prev,
      deviceCapability: capability,
      // Adjust settings for low-end devices
      enableVirtualization: capability !== 'low' ? prev.enableVirtualization : true,
      enableLazyLoading: capability !== 'low' ? prev.enableLazyLoading : true,
    }));
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  }, []);

  return (
    <PerfConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
