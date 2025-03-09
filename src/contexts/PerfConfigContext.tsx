
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

// Simplified performance configuration type
export interface PerfConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
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
  deviceCapability: 'medium',
};

// Create context
const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
});

// Simple device capability detection
const detectDeviceCapability = (): 'low' | 'medium' | 'high' => {
  if (typeof window === 'undefined') return 'medium';
  
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent);
  const cpuCores = navigator.hardwareConcurrency || 4;
  
  if (isMobile || (cpuCores && cpuCores <= 2)) {
    return 'low';
  } else if (cpuCores && cpuCores >= 8) {
    return 'high';
  } else {
    return 'medium';
  }
};

// Provider component
export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PerfConfig>({
    ...defaultConfig,
    deviceCapability: detectDeviceCapability()
  });

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
