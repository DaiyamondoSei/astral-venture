
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectDeviceCapability } from '@/utils/adaptiveRendering';

// Simple enum for device capability
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Performance features based on capability
export interface PerformanceFeatures {
  enableParticles: boolean;
  enableComplexAnimations: boolean;
  enableHighResImages: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableWebWorkers: boolean;
}

// Web vitals metrics
export interface WebVitals {
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  domLoad?: number;
  fullLoad?: number;
  fps?: number;
}

// Simplified context type
interface AdaptivePerformanceContextType {
  // Device capability
  deviceCapability: DeviceCapability;
  // Manual override for performance mode
  manualPerformanceMode: DeviceCapability | 'auto';
  // Feature flags based on device capability
  features: PerformanceFeatures;
  webVitals?: WebVitals;
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
  
  // Basic web vitals tracking
  const [webVitals, setWebVitals] = useState<WebVitals>({});
  
  // Calculated device capability
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(() => {
    const detectedCapability = detectDeviceCapability();
    return DeviceCapability[detectedCapability.toUpperCase() as keyof typeof DeviceCapability];
  });
  
  // Update web vitals when available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const updateVitals = () => {
        try {
          // Get navigation timing if available
          let navTiming;
          if (performance.getEntriesByType && performance.getEntriesByType('navigation').length > 0) {
            navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          }
          
          // Get FCP if available
          let fcp = 0;
          const fcpEntry = performance.getEntriesByName && 
                          performance.getEntriesByName('first-contentful-paint')[0];
          if (fcpEntry) {
            fcp = fcpEntry.startTime;
          }
          
          // Create vitals object with available metrics
          const vitals: WebVitals = { fcp };
          
          // Add navigation timing metrics if available
          if (navTiming) {
            vitals.ttfb = navTiming.responseStart - navTiming.requestStart;
            vitals.domLoad = navTiming.domContentLoadedEventEnd - navTiming.fetchStart;
            vitals.fullLoad = navTiming.loadEventEnd - navTiming.fetchStart;
          }
          
          setWebVitals(vitals);
        } catch (err) {
          console.error('Error collecting performance metrics:', err);
        }
      };
      
      // Try to measure FPS
      let frameCount = 0;
      let lastTime = performance.now();
      let fps = 0;
      
      const measureFps = () => {
        frameCount++;
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastTime;
        
        if (elapsedTime >= 1000) {
          fps = Math.round((frameCount * 1000) / elapsedTime);
          frameCount = 0;
          lastTime = currentTime;
          
          setWebVitals(prev => ({
            ...prev,
            fps
          }));
        }
        
        requestAnimationFrame(measureFps);
      };
      
      // Start FPS measurement
      const fpsId = requestAnimationFrame(measureFps);
      
      // Update initially and on load
      window.addEventListener('load', updateVitals);
      setTimeout(updateVitals, 3000); // Initial delayed check
      
      return () => {
        window.removeEventListener('load', updateVitals);
        cancelAnimationFrame(fpsId);
      };
    }
  }, []);
  
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
  const setManualPerformanceMode = useCallback((mode: DeviceCapability | 'auto') => {
    setManualMode(mode);
    
    // Store preference in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('performanceMode', mode);
    }
  }, []);
  
  // Helper function for adapting rendering based on performance
  const adaptElementCount = useCallback((baseCount: number): number => {
    const factors: Record<DeviceCapability, number> = {
      [DeviceCapability.LOW]: 0.3,
      [DeviceCapability.MEDIUM]: 0.7,
      [DeviceCapability.HIGH]: 1.0
    };
    
    return Math.max(3, Math.floor(baseCount * factors[deviceCapability]));
  }, [deviceCapability]);
  
  // Compute derived feature flags
  const features: PerformanceFeatures = {
    enableParticles: deviceCapability !== DeviceCapability.LOW,
    enableComplexAnimations: deviceCapability !== DeviceCapability.LOW,
    enableHighResImages: deviceCapability === DeviceCapability.HIGH,
    enableBlur: deviceCapability !== DeviceCapability.LOW,
    enableShadows: deviceCapability !== DeviceCapability.LOW,
    enableWebWorkers: deviceCapability === DeviceCapability.HIGH
  };
  
  // Create context value
  const contextValue: AdaptivePerformanceContextType = {
    deviceCapability,
    manualPerformanceMode: manualMode,
    features,
    webVitals,
    setManualPerformanceMode,
    adaptElementCount
  };
  
  return (
    <AdaptivePerformanceContext.Provider value={contextValue}>
      {children}
    </AdaptivePerformanceContext.Provider>
  );
};

export default AdaptivePerformanceContext;
