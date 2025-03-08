
import React, { createContext, useState, useMemo } from 'react';

export interface PerfConfigContextType {
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  setPerformanceConfig: (config: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig'>>) => void;
}

export const PerfConfigContext = createContext<PerfConfigContextType | null>(null);

interface PerfConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig'>>;
}

export const PerfConfigProvider: React.FC<PerfConfigProviderProps> = ({ 
  children,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState({
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: false,
    ...initialConfig
  });
  
  const setPerformanceConfig = (newConfig: Partial<Omit<PerfConfigContextType, 'setPerformanceConfig'>>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };
  
  const contextValue = useMemo(() => ({
    ...config,
    setPerformanceConfig
  }), [config]);
  
  return (
    <PerfConfigContext.Provider value={contextValue}>
      {children}
    </PerfConfigContext.Provider>
  );
};
