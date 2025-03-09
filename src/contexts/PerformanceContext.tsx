
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { getPerformanceCategory, type DeviceCapability } from '@/utils/performanceUtils';

// Context type
export interface PerformanceContextType {
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

// Create the context with default values
const PerformanceContext = createContext<PerformanceContextType>({
  deviceCapability: 'medium',
  isLowPerformance: false,
  isMediumPerformance: true,
  isHighPerformance: false,
  enableParticles: true,
  enableComplexAnimations: true,
  enableBlur: true,
  enableShadows: true,
  setManualPerformanceMode: () => {}
});

// Provider component
export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for device capability
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('medium');
  
  // States for feature flags
  const [enableParticles, setEnableParticles] = useState(true);
  const [enableComplexAnimations, setEnableComplexAnimations] = useState(true);
  const [enableBlur, setEnableBlur] = useState(true);
  const [enableShadows, setEnableShadows] = useState(true);
  
  // Manual override mode
  const [manualMode, setManualMode] = useState<DeviceCapability | 'auto'>('auto');
  
  // Initialize device capability on mount
  useEffect(() => {
    const updateCapabilities = () => {
      // Use manual mode if set
      const capability = manualMode === 'auto' 
        ? getPerformanceCategory() 
        : manualMode;
      
      setDeviceCapability(capability);
      
      // Update feature flags based on capability
      switch (capability) {
        case 'low':
          setEnableParticles(false);
          setEnableComplexAnimations(false);
          setEnableBlur(false);
          setEnableShadows(false);
          break;
        case 'medium':
          setEnableParticles(true);
          setEnableComplexAnimations(false);
          setEnableBlur(true);
          setEnableShadows(true);
          break;
        case 'high':
          setEnableParticles(true);
          setEnableComplexAnimations(true);
          setEnableBlur(true);
          setEnableShadows(true);
          break;
      }
      
      // Store for debugging
      if (typeof window !== 'undefined') {
        (window as any).__deviceCapability = capability;
      }
    };
    
    // Initial update
    updateCapabilities();
    
    // Setup listener for changes (e.g. window resize that might change performance mode)
    window.addEventListener('resize', updateCapabilities);
    return () => window.removeEventListener('resize', updateCapabilities);
  }, [manualMode]);
  
  // Handler for manual mode setting
  const setManualPerformanceMode = (mode: DeviceCapability | 'auto') => {
    setManualMode(mode);
    
    // Store user preference
    if (mode !== 'auto' && typeof localStorage !== 'undefined') {
      localStorage.setItem('performanceMode', mode);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('performanceMode');
    }
  };
  
  return (
    <PerformanceContext.Provider value={{
      deviceCapability,
      isLowPerformance: deviceCapability === 'low',
      isMediumPerformance: deviceCapability === 'medium' || deviceCapability === 'high',
      isHighPerformance: deviceCapability === 'high',
      enableParticles,
      enableComplexAnimations,
      enableBlur,
      enableShadows,
      setManualPerformanceMode
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Hook for using the context
export const usePerformance = () => useContext(PerformanceContext);
