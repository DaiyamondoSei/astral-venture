
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceCapability, monitorPerformance } from '@/utils/performanceUtils';

interface PerformanceContextType {
  isLowPerformance: boolean;
  deviceCapability: DeviceCapability;
  fps: number;
  memoryUsage: {
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
  enablePerformanceMode: (enable: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowPerformance: false,
  deviceCapability: DeviceCapability.MEDIUM,
  fps: 60,
  memoryUsage: {},
  enablePerformanceMode: () => {}
});

export const PerformanceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>(DeviceCapability.MEDIUM);
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState<{
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  }>({});
  
  useEffect(() => {
    // Initial performance check
    const performanceData = monitorPerformance();
    setDeviceCapability(performanceData.deviceCapability);
    setFps(performanceData.fps);
    setMemoryUsage(performanceData.memoryUsage);
    
    // Set low performance mode based on device capability
    setIsLowPerformance(performanceData.deviceCapability === DeviceCapability.LOW);
    
    // Periodic monitoring
    const interval = setInterval(() => {
      const data = monitorPerformance();
      setFps(data.fps);
      setMemoryUsage(data.memoryUsage);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const enablePerformanceMode = (enable: boolean) => {
    setIsLowPerformance(enable);
  };
  
  return (
    <PerformanceContext.Provider value={{
      isLowPerformance,
      deviceCapability,
      fps,
      memoryUsage,
      enablePerformanceMode
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);
