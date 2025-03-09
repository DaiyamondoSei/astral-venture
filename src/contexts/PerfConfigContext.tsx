import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { detectDeviceCapability } from '@/utils/adaptiveRendering';

// Performance configuration type
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

// Default configuration
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

  return (
    <PerfConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
