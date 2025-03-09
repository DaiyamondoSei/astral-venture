
import React, { createContext, useContext, useState } from 'react';

export interface PerfConfig {
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
}

export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
}

const defaultConfig: PerfConfig = {
  enablePerformanceTracking: process.env.NODE_ENV === 'development',
  enableRenderTracking: process.env.NODE_ENV === 'development',
  enableValidation: process.env.NODE_ENV === 'development',
  enablePropTracking: false,
  enableDebugLogging: false
};

export const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {}
});

export const usePerfConfig = () => useContext(PerfConfigContext).config;

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

  return (
    <PerfConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </PerfConfigContext.Provider>
  );
};
