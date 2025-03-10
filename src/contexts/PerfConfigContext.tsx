
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { PerfConfig, defaultConfigs } from '@/hooks/usePerfConfig';
import performanceMonitor from '@/utils/performance/performanceMonitor';

export interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  applyPreset: (preset: 'low' | 'medium' | 'high' | 'auto') => void;
  deviceCapability: 'low' | 'medium' | 'high';
  setDeviceCapability: (capability: 'low' | 'medium' | 'high') => void;
  manualPerformanceMode: boolean;
  setManualPerformanceMode: (manual: boolean) => void;
  features: {
    virtualization: boolean;
    lazyLoading: boolean;
    imageOptimization: boolean;
  };
  webVitals: {
    fcp: number | null;
    lcp: number | null;
    cls: number | null;
    fid: number | null;
    ttfb: number | null;
  };
}

const defaultContext: PerfConfigContextType = {
  config: defaultConfigs.medium,
  updateConfig: () => {},
  applyPreset: () => {},
  deviceCapability: 'medium',
  setDeviceCapability: () => {},
  manualPerformanceMode: false,
  setManualPerformanceMode: () => {},
  features: {
    virtualization: true,
    lazyLoading: true,
    imageOptimization: true
  },
  webVitals: {
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null
  }
};

const PerfConfigContext = createContext<PerfConfigContextType>(defaultContext);

export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect device capability based on user agent, memory and hardware concurrency
  const detectDeviceCapability = useCallback((): 'low' | 'medium' | 'high' => {
    if (typeof window === 'undefined') return 'medium';

    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check for available memory (if available in the browser)
    const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;

    // Check for CPU cores
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    // Determine capability level
    if (isMobile && (lowMemory || lowCPU)) {
      return 'low';
    } else if (
      (navigator as any).deviceMemory &&
      (navigator as any).deviceMemory >= 8 &&
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency >= 8
    ) {
      return 'high';
    }

    return 'medium';
  }, []);

  const [deviceCapability, setDeviceCapability] = useState<'low' | 'medium' | 'high'>(
    detectDeviceCapability()
  );
  const [manualPerformanceMode, setManualPerformanceMode] = useState(false);
  const [config, setConfig] = useState<PerfConfig>(defaultConfigs[deviceCapability]);
  const [webVitals, setWebVitals] = useState({
    fcp: null as number | null,
    lcp: null as number | null,
    cls: null as number | null,
    fid: null as number | null,
    ttfb: null as number | null
  });

  // Apply config based on device capability on mount
  useEffect(() => {
    if (!manualPerformanceMode) {
      setConfig(defaultConfigs[deviceCapability]);
    }
  }, [deviceCapability, manualPerformanceMode]);

  // Update config with partial changes
  const updateConfig = useCallback((updates: Partial<PerfConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates
    }));
    
    // Enable manual mode when the config is updated
    setManualPerformanceMode(true);
  }, []);

  // Apply a preset configuration
  const applyPreset = useCallback((preset: 'low' | 'medium' | 'high' | 'auto') => {
    if (preset === 'auto') {
      const detectedCapability = detectDeviceCapability();
      setDeviceCapability(detectedCapability);
      setConfig(defaultConfigs[detectedCapability]);
      setManualPerformanceMode(false);
    } else {
      setConfig(defaultConfigs[preset]);
      setDeviceCapability(preset);
      setManualPerformanceMode(true);
    }
  }, [detectDeviceCapability]);

  // Derive features from config
  const features = useMemo(() => ({
    virtualization: config.virtualizeLists,
    lazyLoading: true,
    imageOptimization: true
  }), [config.virtualizeLists]);

  // Enable/disable performance tracking based on config
  useEffect(() => {
    performanceMonitor.setMetricsEnabled(config.enableMetricsCollection || false);
  }, [config.enableMetricsCollection]);

  // Context value
  const contextValue = useMemo(
    () => ({
      config,
      updateConfig,
      applyPreset,
      deviceCapability,
      setDeviceCapability,
      manualPerformanceMode,
      setManualPerformanceMode,
      features,
      webVitals
    }),
    [
      config,
      updateConfig,
      applyPreset,
      deviceCapability,
      setDeviceCapability,
      manualPerformanceMode,
      setManualPerformanceMode,
      features,
      webVitals
    ]
  );

  return (
    <PerfConfigContext.Provider value={contextValue}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
