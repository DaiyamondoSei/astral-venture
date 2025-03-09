
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Simple enum for device capability
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Simplified context type
interface AdaptivePerformanceContextType {
  // Device capability
  deviceCapability: DeviceCapability;
  // Manual override for performance mode
  manualPerformanceMode: DeviceCapability | 'auto';
  // Feature flags based on device capability
  features: {
    enableParticles: boolean;
    enableComplexAnimations: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    enableHighResImages: boolean;
  };
  // Functions
  setManualPerformanceMode: (mode: DeviceCapability | 'auto') => void;
  adaptElementCount: (baseCount: number) => number;
  adaptUpdateInterval: (baseIntervalMs: number) => number;
}

const AdaptivePerformanceContext = createContext<AdaptivePerformanceContextType | null>(null);

export const useAdaptivePerformance = () => {
  const context = useContext(AdaptivePerformanceContext);
  if (!context) {
    throw new Error('useAdaptivePerformance must be used within an AdaptivePerformanceProvider');
  }
  return context;
};

interface AdaptivePerformanceProviderProps {
  children: React.ReactNode;
}

export const AdaptivePerformanceProvider: React.FC<AdaptivePerformanceProviderProps> = ({ children }) => {
  // State for manual performance mode
  const [manualMode, setManualMode] = useState<DeviceCapability | 'auto'>('auto');
  // Calculated device capability
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(DeviceCapability.MEDIUM);
  
  // Update device capability when manual mode changes
  useEffect(() => {
    if (manualMode === 'auto') {
      // Simple detection - no complex calculations needed
      const isMobile = /Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent);
      const cpuCores = navigator.hardwareConcurrency || 4;
      
      if (isMobile || cpuCores <= 2) {
        setDeviceCapability(DeviceCapability.LOW);
      } else if (cpuCores >= 8) {
        setDeviceCapability(DeviceCapability.HIGH);
      } else {
        setDeviceCapability(DeviceCapability.MEDIUM);
      }
    } else {
      setDeviceCapability(manualMode);
    }
  }, [manualMode]);
  
  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('performanceMode') as DeviceCapability | 'auto' | null;
      if (savedMode) {
        setManualMode(savedMode);
      }
    }
  }, []);
  
  // Manual mode setter
  const setManualPerformanceMode = (mode: DeviceCapability | 'auto') => {
    setManualMode(mode);
    
    // Store preference in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('performanceMode', mode);
    }
  };
  
  // Helper functions for adapting rendering based on performance
  const adaptElementCount = (baseCount: number): number => {
    const factors: Record<DeviceCapability, number> = {
      [DeviceCapability.LOW]: 0.3,
      [DeviceCapability.MEDIUM]: 0.7,
      [DeviceCapability.HIGH]: 1.0
    };
    
    return Math.max(3, Math.floor(baseCount * factors[deviceCapability]));
  };
  
  const adaptUpdateInterval = (baseIntervalMs: number): number => {
    const factors: Record<DeviceCapability, number> = {
      [DeviceCapability.LOW]: 3,
      [DeviceCapability.MEDIUM]: 1.5,
      [DeviceCapability.HIGH]: 1
    };
    
    return Math.max(16, Math.floor(baseIntervalMs * factors[deviceCapability]));
  };
  
  // Compute derived feature flags
  const features = useMemo(() => {
    const isLowPerformance = deviceCapability === DeviceCapability.LOW;
    const isHighPerformance = deviceCapability === DeviceCapability.HIGH;
    
    return {
      enableParticles: !isLowPerformance,
      enableComplexAnimations: !isLowPerformance,
      enableBlur: !isLowPerformance,
      enableShadows: !isLowPerformance,
      enableHighResImages: isHighPerformance
    };
  }, [deviceCapability]);
  
  // Create context value
  const contextValue: AdaptivePerformanceContextType = {
    deviceCapability,
    manualPerformanceMode: manualMode,
    features,
    setManualPerformanceMode,
    adaptElementCount,
    adaptUpdateInterval
  };
  
  return (
    <AdaptivePerformanceContext.Provider value={contextValue}>
      {children}
    </AdaptivePerformanceContext.Provider>
  );
};
