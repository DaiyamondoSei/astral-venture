
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PerfConfig {
  enableValidation: boolean;
  targetFPS: number;
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  disableAnimations: boolean;
  disableEffects: boolean;
}

export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

export interface PerformanceContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  deviceCapability: DeviceCapability;
  isLowPerformance: boolean;
  trackMetric: (component: string, metricName: string, value: number, tags?: Record<string, any>) => void;
  startTiming: (label: string) => void;
  endTiming: (label: string) => void;
  measureDOM: (element: HTMLElement) => void;
  exportConfig: () => { success: boolean; data?: PerfConfig; error?: string };
}

const defaultConfig: PerfConfig = {
  enableValidation: true,
  targetFPS: 60,
  qualityLevel: 'high',
  disableAnimations: false,
  disableEffects: false
};

const PerformanceContext = createContext<PerformanceContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  deviceCapability: 'high-end',
  isLowPerformance: false,
  trackMetric: () => {},
  startTiming: () => {},
  endTiming: () => {},
  measureDOM: () => {},
  exportConfig: () => ({ success: true, data: defaultConfig })
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceProviderProps {
  children: ReactNode;
  initialConfig?: Partial<PerfConfig>;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<PerfConfig>({
    ...defaultConfig,
    ...initialConfig
  });
  
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('high-end');
  
  useEffect(() => {
    // Detect device capability on mount
    const detectCapability = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      if (isMobile) {
        setDeviceCapability('mid-range');
      } else {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl');
          if (!gl) {
            setDeviceCapability('low-end');
            return;
          }
          
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          const renderer = debugInfo 
            ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : '';
            
          if (renderer.match(/intel/i)) {
            setDeviceCapability('mid-range');
          }
        } catch (e) {
          console.error('Error detecting GPU capabilities:', e);
        }
      }
    };
    
    detectCapability();
  }, []);
  
  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...updates }));
  };
  
  const trackMetric = (component: string, metricName: string, value: number, tags = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Metric [${component}:${metricName}]`, value, tags);
    }
  };
  
  const startTiming = (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  };
  
  const endTiming = (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const entries = performance.getEntriesByName(label);
      if (entries.length > 0) {
        const duration = entries[0].duration;
        trackMetric('timing', label, duration);
      }
      
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    }
  };
  
  const measureDOM = (element: HTMLElement) => {
    if (!element) return;
    
    const startTime = performance.now();
    const nodeCount = element.querySelectorAll('*').length;
    const depth = getMaxDepth(element);
    const endTime = performance.now();
    
    trackMetric('dom', 'node-count', nodeCount);
    trackMetric('dom', 'max-depth', depth);
    trackMetric('dom', 'analysis-time', endTime - startTime);
  };
  
  const getMaxDepth = (element: HTMLElement, currentDepth = 0): number => {
    if (!element.children || element.children.length === 0) {
      return currentDepth;
    }
    
    let maxChildDepth = currentDepth;
    
    for (let i = 0; i < element.children.length; i++) {
      const childDepth = getMaxDepth(element.children[i] as HTMLElement, currentDepth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    
    return maxChildDepth;
  };
  
  const exportConfig = () => {
    try {
      return {
        success: true,
        data: config
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  return (
    <PerformanceContext.Provider value={{
      config,
      updateConfig,
      deviceCapability,
      isLowPerformance: deviceCapability === 'low-end',
      trackMetric,
      startTiming,
      endTiming,
      measureDOM,
      exportConfig
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceContext;
