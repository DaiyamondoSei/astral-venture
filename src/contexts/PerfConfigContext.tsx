
import React, { createContext, useContext, useState, useCallback } from 'react';

export type DeviceCapability = 'high' | 'medium' | 'low';
export type TrackingLevel = 'high' | 'medium' | 'low';

export interface PerfConfig {
  enablePerformanceTracking: boolean;
  samplingRate: number;
  renderTimeThreshold: number;
  interactionTimeThreshold: number;
  deviceCapability: DeviceCapability;
  trackingLevel: TrackingLevel;
  reportToServer: boolean;
  batchReportSize: number;
}

export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: PerfConfig = {
  enablePerformanceTracking: true,
  samplingRate: 0.1, // Track 10% of component renders by default
  renderTimeThreshold: 16, // 16ms = 60fps threshold
  interactionTimeThreshold: 100, // 100ms interaction time threshold
  deviceCapability: 'medium',
  trackingLevel: 'medium',
  reportToServer: false,
  batchReportSize: 10
};

const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  resetConfig: () => {}
});

export const usePerfConfig = () => useContext(PerfConfigContext);

export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PerfConfig>(defaultConfig);

  const updateConfig = useCallback((updates: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  return (
    <PerfConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
