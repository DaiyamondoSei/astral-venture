
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';

// Define the configuration options
export type PerformanceMonitoringLevel = 'high' | 'medium' | 'low' | 'debug';

export interface PerfConfigContextType {
  monitoringLevel: PerformanceMonitoringLevel;
  setMonitoringLevel: (level: PerformanceMonitoringLevel) => void;
  autoOptimize: boolean;
  setAutoOptimize: (enable: boolean) => void;
  trackInteractions: boolean;
  setTrackInteractions: (enable: boolean) => void;
  reportToServer: boolean;
  setReportToServer: (enable: boolean) => void;
  debugMode: boolean;
  setDebugMode: (enable: boolean) => void;
  lastReport: number;
  clearData: () => void;
  
  // Essential config properties used by components
  webVitals: Record<string, number>;
  deviceCapability: 'high' | 'medium' | 'low';
  features: {
    animations: boolean;
    particleEffects: boolean;
    backgroundEffects: boolean;
    highQualityRendering: boolean;
  };
  manualPerformanceMode: 'auto' | 'high' | 'balanced' | 'low';
  setManualPerformanceMode: (mode: 'auto' | 'high' | 'balanced' | 'low') => void;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags for tracking
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  
  // Update functions
  updateConfig: (updates: Partial<ConfigState>) => void;
  applyPreset: (preset: 'minimal' | 'balanced' | 'comprehensive' | 'debug') => void;
}

// Internal config state
interface ConfigState {
  monitoringLevel: PerformanceMonitoringLevel;
  autoOptimize: boolean;
  trackInteractions: boolean;
  reportToServer: boolean;
  debugMode: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  deviceCapability: 'high' | 'medium' | 'low';
  manualPerformanceMode: 'auto' | 'high' | 'balanced' | 'low';
  features: {
    animations: boolean;
    particleEffects: boolean;
    backgroundEffects: boolean;
    highQualityRendering: boolean;
  };
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  webVitals: Record<string, number>;
}

// Create the context with a default value
const PerfConfigContext = createContext<PerfConfigContextType | null>(null);

// Detect device capability
function detectDeviceCapability(): 'high' | 'medium' | 'low' {
  // Simple detection based on memory and cores
  try {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (memory >= 6 && cores >= 8) return 'high';
    if (memory >= 4 && cores >= 4) return 'medium';
    return 'low';
  } catch (e) {
    return 'medium'; // Fallback
  }
}

// Provider component
export const PerfConfigProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [config, setConfig] = useState<ConfigState>({
    monitoringLevel: 'medium',
    autoOptimize: false,
    trackInteractions: true,
    reportToServer: false,
    debugMode: false,
    samplingRate: 50,
    throttleInterval: 2000,
    maxTrackedComponents: 50,
    deviceCapability: detectDeviceCapability(),
    manualPerformanceMode: 'auto',
    features: {
      animations: true,
      particleEffects: true,
      backgroundEffects: true,
      highQualityRendering: true
    },
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    intelligentProfiling: false,
    inactiveTabThrottling: true,
    batchUpdates: true,
    webVitals: {}
  });
  
  const [lastReport, setLastReport] = useState(0);
  
  // Load saved configuration from localStorage on component mount
  useEffect(() => {
    try {
      markStart('loadPerfConfig');
      const savedConfig = localStorage.getItem('perfConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({
          ...prev,
          monitoringLevel: parsedConfig.monitoringLevel || prev.monitoringLevel,
          autoOptimize: parsedConfig.autoOptimize ?? prev.autoOptimize,
          trackInteractions: parsedConfig.trackInteractions ?? prev.trackInteractions,
          reportToServer: parsedConfig.reportToServer ?? prev.reportToServer,
          debugMode: parsedConfig.debugMode ?? prev.debugMode,
          manualPerformanceMode: parsedConfig.manualPerformanceMode || prev.manualPerformanceMode
        }));
      }
      markEnd('loadPerfConfig');
    } catch (error) {
      console.error('Error loading performance configuration:', error);
    }
  }, []);
  
  // Save configuration to localStorage when it changes
  useEffect(() => {
    try {
      const configToSave = {
        monitoringLevel: config.monitoringLevel,
        autoOptimize: config.autoOptimize,
        trackInteractions: config.trackInteractions,
        reportToServer: config.reportToServer,
        debugMode: config.debugMode,
        manualPerformanceMode: config.manualPerformanceMode
      };
      localStorage.setItem('perfConfig', JSON.stringify(configToSave));
    } catch (error) {
      console.error('Error saving performance configuration:', error);
    }
  }, [config.monitoringLevel, config.autoOptimize, config.trackInteractions, 
      config.reportToServer, config.debugMode, config.manualPerformanceMode]);
  
  // Function to clear collected data
  const clearData = useCallback(() => {
    setLastReport(Date.now());
    // Additional data clearing logic would go here
  }, []);
  
  // Update config function
  const updateConfig = useCallback((updates: Partial<ConfigState>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates
    }));
  }, []);
  
  // Apply preset configurations
  const applyPreset = useCallback((preset: 'minimal' | 'balanced' | 'comprehensive' | 'debug') => {
    switch (preset) {
      case 'minimal':
        updateConfig({
          monitoringLevel: 'low',
          samplingRate: 10,
          enableRenderTracking: false,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          throttleInterval: 5000
        });
        break;
      case 'balanced':
        updateConfig({
          monitoringLevel: 'medium',
          samplingRate: 50,
          enableRenderTracking: true,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          throttleInterval: 2000
        });
        break;
      case 'comprehensive':
        updateConfig({
          monitoringLevel: 'high',
          samplingRate: 100,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: true,
          enableDebugLogging: false,
          throttleInterval: 1000
        });
        break;
      case 'debug':
        updateConfig({
          monitoringLevel: 'debug',
          samplingRate: 100,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: true,
          enableDebugLogging: true,
          throttleInterval: 500
        });
        break;
    }
  }, [updateConfig]);
  
  // Function to update feature capabilities based on performance mode
  useEffect(() => {
    if (config.manualPerformanceMode === 'auto') {
      // Auto mode uses device capability
      const deviceFeatures = {
        high: {
          animations: true,
          particleEffects: true,
          backgroundEffects: true,
          highQualityRendering: true
        },
        medium: {
          animations: true,
          particleEffects: true,
          backgroundEffects: true,
          highQualityRendering: false
        },
        low: {
          animations: true,
          particleEffects: false,
          backgroundEffects: false,
          highQualityRendering: false
        }
      };
      
      updateConfig({ 
        features: deviceFeatures[config.deviceCapability] 
      });
    } else {
      // Manual mode overrides
      const manualFeatures = {
        high: {
          animations: true,
          particleEffects: true,
          backgroundEffects: true,
          highQualityRendering: true
        },
        balanced: {
          animations: true,
          particleEffects: true,
          backgroundEffects: true,
          highQualityRendering: false
        },
        low: {
          animations: true,
          particleEffects: false,
          backgroundEffects: false,
          highQualityRendering: false
        }
      };
      
      if (config.manualPerformanceMode !== 'auto') {
        updateConfig({ 
          features: manualFeatures[config.manualPerformanceMode] 
        });
      }
    }
  }, [config.deviceCapability, config.manualPerformanceMode, updateConfig]);
  
  // Create context value
  const value: PerfConfigContextType = {
    monitoringLevel: config.monitoringLevel,
    setMonitoringLevel: (level) => updateConfig({ monitoringLevel: level }),
    autoOptimize: config.autoOptimize,
    setAutoOptimize: (enable) => updateConfig({ autoOptimize: enable }),
    trackInteractions: config.trackInteractions,
    setTrackInteractions: (enable) => updateConfig({ trackInteractions: enable }),
    reportToServer: config.reportToServer,
    setReportToServer: (enable) => updateConfig({ reportToServer: enable }),
    debugMode: config.debugMode,
    setDebugMode: (enable) => updateConfig({ debugMode: enable }),
    lastReport,
    clearData,
    
    // Additional properties
    deviceCapability: config.deviceCapability,
    manualPerformanceMode: config.manualPerformanceMode,
    setManualPerformanceMode: (mode) => updateConfig({ manualPerformanceMode: mode }),
    features: config.features,
    webVitals: config.webVitals,
    
    // Configuration options
    samplingRate: config.samplingRate, 
    throttleInterval: config.throttleInterval,
    maxTrackedComponents: config.maxTrackedComponents,
    
    // Feature flags
    enablePerformanceTracking: config.enablePerformanceTracking,
    enableRenderTracking: config.enableRenderTracking,
    enableValidation: config.enableValidation,
    enablePropTracking: config.enablePropTracking,
    enableDebugLogging: config.enableDebugLogging,
    intelligentProfiling: config.intelligentProfiling,
    inactiveTabThrottling: config.inactiveTabThrottling,
    batchUpdates: config.batchUpdates,
    
    // Update methods
    updateConfig,
    applyPreset
  };
  
  return (
    <PerfConfigContext.Provider value={value}>
      {children}
    </PerfConfigContext.Provider>
  );
};

export default PerfConfigContext;
