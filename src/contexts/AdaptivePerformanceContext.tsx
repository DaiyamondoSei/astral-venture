
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getPerformanceCategory, DeviceCapability } from '@/utils/performanceUtils';
import { initAdaptiveRendering, isFeatureEnabled } from '@/utils/adaptiveRendering';
import { initWebVitals, getWebVitalsMetrics } from '@/utils/webVitalsMonitor';

// Helper type for the manual performance mode
type PerformanceMode = DeviceCapability | 'auto';

interface AdaptivePerformanceContextType {
  // Device capability
  deviceCapability: DeviceCapability;
  // Manual override for performance mode
  manualPerformanceMode: PerformanceMode;
  // Feature flags based on device capability
  features: {
    enableParticles: boolean;
    enableComplexAnimations: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    enableWebWorkers: boolean;
    enableHighResImages: boolean;
  };
  // Web vitals metrics
  webVitals: ReturnType<typeof getWebVitalsMetrics>;
  // Functions
  setManualPerformanceMode: (mode: PerformanceMode) => void;
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
  const [manualMode, setManualMode] = useState<PerformanceMode>('auto');
  // Calculated device capability
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(DeviceCapability.MEDIUM);
  // Web vitals metrics
  const [webVitals, setWebVitals] = useState(getWebVitalsMetrics());
  
  // Update device capability when manual mode changes
  useEffect(() => {
    if (manualMode === 'auto') {
      setDeviceCapability(getPerformanceCategory());
    } else {
      setDeviceCapability(manualMode);
    }
  }, [manualMode]);
  
  // Initialize adaptive rendering system
  useEffect(() => {
    initAdaptiveRendering();
    initWebVitals();
    
    // Listen for web vitals updates
    const handleWebVitalsUpdate = (event: CustomEvent) => {
      setWebVitals(getWebVitalsMetrics());
    };
    
    window.addEventListener('webvitals', handleWebVitalsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('webvitals', handleWebVitalsUpdate as EventListener);
    };
  }, []);
  
  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('performanceMode') as PerformanceMode | null;
      if (savedMode) {
        setManualMode(savedMode);
      }
    }
  }, []);
  
  // Manual mode setter
  const setManualPerformanceMode = (mode: PerformanceMode) => {
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
      enableWebWorkers: !isLowPerformance,
      enableHighResImages: isHighPerformance
    };
  }, [deviceCapability]);
  
  // Create context value
  const contextValue = useMemo(() => ({
    deviceCapability,
    manualPerformanceMode: manualMode,
    features,
    webVitals,
    setManualPerformanceMode,
    adaptElementCount,
    adaptUpdateInterval
  }), [deviceCapability, manualMode, features, webVitals]);
  
  return (
    <AdaptivePerformanceContext.Provider value={contextValue}>
      {children}
    </AdaptivePerformanceContext.Provider>
  );
};
