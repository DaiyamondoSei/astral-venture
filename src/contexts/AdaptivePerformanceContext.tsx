
import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectDeviceCapability } from '@/utils/adaptiveRendering';

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
    enableHighResImages: boolean;
  };
  // Functions
  setManualPerformanceMode: (mode: DeviceCapability | 'auto') => void;
  adaptElementCount: (baseCount: number) => number;
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
  const [manualMode, setManualMode] = useState<DeviceCapability | 'auto'>(() => {
    // Get saved preference
    if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('performanceMode') as DeviceCapability | 'auto' | null;
      return savedMode || 'auto';
    }
    return 'auto';
  });
  
  // Calculated device capability
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(() => {
    const detectedCapability = detectDeviceCapability();
    return DeviceCapability[detectedCapability.toUpperCase() as keyof typeof DeviceCapability];
  });
  
  // Device detection - run only when manual mode changes
  useEffect(() => {
    if (manualMode === 'auto') {
      const detectedCapability = detectDeviceCapability();
      setDeviceCapability(DeviceCapability[detectedCapability.toUpperCase() as keyof typeof DeviceCapability]);
    } else {
      setDeviceCapability(manualMode);
    }
  }, [manualMode]);
  
  // Manual mode setter
  const setManualPerformanceMode = (mode: DeviceCapability | 'auto') => {
    setManualMode(mode);
    
    // Store preference in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('performanceMode', mode);
    }
  };
  
  // Helper function for adapting rendering based on performance
  const adaptElementCount = (baseCount: number): number => {
    const factors: Record<DeviceCapability, number> = {
      [DeviceCapability.LOW]: 0.3,
      [DeviceCapability.MEDIUM]: 0.7,
      [DeviceCapability.HIGH]: 1.0
    };
    
    return Math.max(3, Math.floor(baseCount * factors[deviceCapability]));
  };
  
  // Compute derived feature flags
  const features = {
    enableParticles: deviceCapability !== DeviceCapability.LOW,
    enableComplexAnimations: deviceCapability !== DeviceCapability.LOW,
    enableHighResImages: deviceCapability === DeviceCapability.HIGH
  };
  
  // Create context value
  const contextValue: AdaptivePerformanceContextType = {
    deviceCapability,
    manualPerformanceMode: manualMode,
    features,
    setManualPerformanceMode,
    adaptElementCount
  };
  
  return (
    <AdaptivePerformanceContext.Provider value={contextValue}>
      {children}
    </AdaptivePerformanceContext.Provider>
  );
};
