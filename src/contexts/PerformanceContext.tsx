
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { DeviceCapability, getPerformanceCategory, monitorPerformance } from '@/utils/performanceUtils';

interface PerformanceContextType {
  deviceCapability: DeviceCapability;
  isLowPerformance: boolean;
  isMediumPerformance: boolean;
  isHighPerformance: boolean;
  enableParticles: boolean;
  enableComplexAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  setManualPerformanceMode: (mode: DeviceCapability | 'auto') => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  deviceCapability: 'medium',
  isLowPerformance: false,
  isMediumPerformance: true,
  isHighPerformance: false,
  enableParticles: true,
  enableComplexAnimations: true,
  enableBlur: true,
  enableShadows: true,
  setManualPerformanceMode: () => {},
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [manualMode, setManualMode] = useState<DeviceCapability | 'auto'>('auto');
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('medium');

  // Detect device capability on mount
  useEffect(() => {
    if (manualMode === 'auto') {
      setDeviceCapability(getPerformanceCategory());
    } else {
      setDeviceCapability(manualMode);
    }
  }, [manualMode]);

  // Setup performance monitoring in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const cleanup = monitorPerformance();
      return cleanup;
    }
  }, []);

  // Manual mode setter
  const setManualPerformanceMode = useCallback((mode: DeviceCapability | 'auto') => {
    setManualMode(mode);
    
    // Store preference in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('performanceMode', mode);
    }
  }, []);

  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('performanceMode') as DeviceCapability | 'auto' | null;
      if (savedMode) {
        setManualMode(savedMode);
      }
    }
  }, []);

  // Compute derived values
  const contextValue = useMemo(() => {
    const isLowPerformance = deviceCapability === 'low';
    const isMediumPerformance = deviceCapability === 'medium';
    const isHighPerformance = deviceCapability === 'high';
    
    return {
      deviceCapability,
      isLowPerformance,
      isMediumPerformance,
      isHighPerformance,
      enableParticles: !isLowPerformance,
      enableComplexAnimations: !isLowPerformance,
      enableBlur: !isLowPerformance,
      enableShadows: !isLowPerformance,
      setManualPerformanceMode,
    };
  }, [deviceCapability, setManualPerformanceMode]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};
