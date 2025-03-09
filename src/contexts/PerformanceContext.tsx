
import React, { createContext, useContext, useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { DeviceCapability, getPerformanceCategory } from '@/utils/performanceUtils';

interface PerformanceContextType {
  isLowPerformance: boolean;
  fpsTarget: number;
  enableAnimations: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableGlow: boolean;
  performanceCategory: DeviceCapability;
  setPerformanceCategory: (category: DeviceCapability) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

// Create context with default values
const PerformanceContext = createContext<PerformanceContextType>({
  isLowPerformance: false,
  fpsTarget: 60,
  enableAnimations: true,
  enableParticles: true,
  enableBlur: true,
  enableShadows: true,
  enableGlow: true,
  performanceCategory: DeviceCapability.MEDIUM,
  setPerformanceCategory: () => {},
  startMonitoring: () => {},
  stopMonitoring: () => {}
});

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceCategory, setPerformanceCategory] = useState<DeviceCapability>(DeviceCapability.MEDIUM);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize performance settings based on device capability
  useEffect(() => {
    if (!isInitialized) {
      const detectedCategory = getPerformanceCategory();
      setPerformanceCategory(detectedCategory);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Start performance monitoring
  const startMonitoring = () => {
    performanceMonitor.startMonitoring();
  };

  // Stop performance monitoring
  const stopMonitoring = () => {
    performanceMonitor.stopMonitoring();
  };

  // Determine feature availability based on performance category
  const isLowPerformance = performanceCategory === DeviceCapability.LOW;
  const fpsTarget = isLowPerformance ? 30 : 60;
  const enableAnimations = performanceCategory !== DeviceCapability.LOW;
  const enableParticles = performanceCategory === DeviceCapability.HIGH;
  const enableBlur = performanceCategory !== DeviceCapability.LOW;
  const enableShadows = performanceCategory !== DeviceCapability.LOW;
  const enableGlow = performanceCategory === DeviceCapability.HIGH;

  // Value object to be provided by context
  const contextValue = {
    isLowPerformance,
    fpsTarget,
    enableAnimations,
    enableParticles,
    enableBlur,
    enableShadows,
    enableGlow,
    performanceCategory,
    setPerformanceCategory,
    startMonitoring,
    stopMonitoring
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Custom hook for using the performance context
export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
