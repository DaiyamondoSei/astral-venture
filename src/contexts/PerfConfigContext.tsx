
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

// Simplified performance configuration type
export interface PerfConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  enablePerformanceReporting: boolean;
  deviceCapability: 'low' | 'medium' | 'high';
}

// Context type
export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (config: Partial<PerfConfig>) => void;
}

// Default configuration - simplified
const defaultConfig: PerfConfig = {
  enableVirtualization: true,
  enableLazyLoading: true,
  enablePerformanceReporting: false,
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

  // Detect device capability on mount - simplified approach
  useEffect(() => {
    const detectDeviceCapability = () => {
      // Simple device capability detection
      const isMobile = /Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent);
      const cpuCores = navigator.hardwareConcurrency || 4;
      
      // Basic capability assessment
      if (isMobile || (cpuCores && cpuCores <= 2)) {
        return 'low';
      } else if (cpuCores && cpuCores >= 8) {
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
      // Adjust settings for low-end devices to ensure good performance
      enableVirtualization: capability === 'low' ? true : prev.enableVirtualization,
      enableLazyLoading: capability === 'low' ? true : prev.enableLazyLoading,
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
