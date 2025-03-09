
import React, { createContext, useContext, useState, useEffect } from 'react';

// Performance configuration interface
export interface PerfConfig {
  // Core settings
  enableRenderTracking: boolean;
  enableMemoryMonitoring: boolean;
  enablePerformanceReporting: boolean;
  
  // Animation settings
  particleDensity: number;
  enableComplexAnimations: boolean;
  animationFrameSkip: number;
  
  // Visual settings
  enableBlur: boolean;
  enableGlow: boolean;
  enableShadows: boolean;
  enableParticles: boolean;
  
  // Component optimization
  enableVirtualization: boolean;
  lazyLoadThreshold: number;
  batchRenderUpdates: boolean;
  
  // Debug settings
  showPerformanceMetrics: boolean;
  enableDetailedLogging: boolean;
}

// Preset configurations for different performance levels
const performancePresets: Record<string, Partial<PerfConfig>> = {
  comprehensive: {
    enableRenderTracking: true,
    enableMemoryMonitoring: true,
    enablePerformanceReporting: true,
    particleDensity: 1.0,
    enableComplexAnimations: true,
    animationFrameSkip: 0,
    enableBlur: true,
    enableGlow: true,
    enableShadows: true,
    enableParticles: true,
    enableVirtualization: true,
    lazyLoadThreshold: 200,
    batchRenderUpdates: true,
    showPerformanceMetrics: false,
    enableDetailedLogging: process.env.NODE_ENV === 'development'
  },
  
  balanced: {
    enableRenderTracking: process.env.NODE_ENV === 'development',
    enableMemoryMonitoring: true,
    enablePerformanceReporting: true,
    particleDensity: 0.7,
    enableComplexAnimations: true,
    animationFrameSkip: 1,
    enableBlur: true,
    enableGlow: false,
    enableShadows: true,
    enableParticles: true,
    enableVirtualization: true,
    lazyLoadThreshold: 300,
    batchRenderUpdates: true,
    showPerformanceMetrics: false,
    enableDetailedLogging: false
  },
  
  minimal: {
    enableRenderTracking: false,
    enableMemoryMonitoring: true,
    enablePerformanceReporting: false,
    particleDensity: 0.3,
    enableComplexAnimations: false,
    animationFrameSkip: 2,
    enableBlur: false,
    enableGlow: false,
    enableShadows: false,
    enableParticles: false,
    enableVirtualization: true,
    lazyLoadThreshold: 500,
    batchRenderUpdates: true,
    showPerformanceMetrics: false,
    enableDetailedLogging: false
  },
  
  disabled: {
    enableRenderTracking: false,
    enableMemoryMonitoring: false,
    enablePerformanceReporting: false,
    particleDensity: 0.1,
    enableComplexAnimations: false,
    animationFrameSkip: 3,
    enableBlur: false,
    enableGlow: false,
    enableShadows: false,
    enableParticles: false,
    enableVirtualization: false,
    lazyLoadThreshold: 1000,
    batchRenderUpdates: false,
    showPerformanceMetrics: false,
    enableDetailedLogging: false
  }
};

// Default configuration (balanced preset)
const defaultConfig: PerfConfig = {
  ...performancePresets.balanced
} as PerfConfig;

// Context type definition
interface PerfConfigContextType {
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  applyPreset: (preset: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => void;
}

// Create context with default values
const PerfConfigContext = createContext<PerfConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  applyPreset: () => {}
});

// Context provider component
export const PerfConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with default config
  const [config, setConfig] = useState<PerfConfig>(defaultConfig);
  
  // Load saved configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = localStorage.getItem('perfConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig(current => ({ ...current, ...parsedConfig }));
        } else {
          // No saved config, detect device capability and apply appropriate preset
          const { getPerformanceCategory } = await import('@/utils/performanceUtils');
          const capability = getPerformanceCategory();
          
          let preset: keyof typeof performancePresets;
          
          switch (capability) {
            case 'high':
              preset = 'comprehensive';
              break;
            case 'medium':
              preset = 'balanced';
              break;
            case 'low':
              preset = 'minimal';
              break;
            default:
              preset = 'balanced';
          }
          
          setConfig(current => ({ ...current, ...performancePresets[preset] }));
        }
      } catch (error) {
        console.error('Error loading performance config:', error);
        // Fall back to default config
      }
    };
    
    loadConfig();
  }, []);
  
  // Update configuration
  const updateConfig = (updates: Partial<PerfConfig>) => {
    setConfig(current => {
      const newConfig = { ...current, ...updates };
      // Save to localStorage
      try {
        localStorage.setItem('perfConfig', JSON.stringify(newConfig));
      } catch (e) {
        console.error('Error saving performance config:', e);
      }
      return newConfig;
    });
  };
  
  // Apply a preset configuration
  const applyPreset = (preset: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => {
    const presetConfig = performancePresets[preset];
    if (presetConfig) {
      updateConfig(presetConfig);
    }
  };
  
  return (
    <PerfConfigContext.Provider value={{ config, updateConfig, applyPreset }}>
      {children}
    </PerfConfigContext.Provider>
  );
};

// Custom hook to use the performance config
export const usePerfConfig = (): PerfConfigContextType => {
  const context = useContext(PerfConfigContext);
  if (!context) {
    throw new Error('usePerfConfig must be used within a PerfConfigProvider');
  }
  return context;
};

export default PerfConfigContext;
