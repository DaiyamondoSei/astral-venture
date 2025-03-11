
/**
 * Hook for visualization system configuration
 * 
 * Provides configuration for the visualization system based on device capability,
 * user preferences, and performance measurements.
 */
import { useState, useEffect, useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { VisualizationSystem, PerformanceSettings } from '../types/visualization/VisualSystemTypes';

/**
 * Default performance settings by device capability
 */
const DEFAULT_PERFORMANCE_SETTINGS: Record<'low' | 'medium' | 'high', PerformanceSettings> = {
  low: {
    adaptiveQuality: true,
    performanceMetrics: true,
    simplifiedForLowEnd: true,
    webglFallback: true,
    maxParticleCount: 100,
    animationFrameLimit: 30
  },
  medium: {
    adaptiveQuality: true,
    performanceMetrics: true,
    simplifiedForLowEnd: false,
    webglFallback: false,
    maxParticleCount: 500,
    animationFrameLimit: 60
  },
  high: {
    adaptiveQuality: false,
    performanceMetrics: true,
    simplifiedForLowEnd: false,
    webglFallback: false,
    maxParticleCount: 2000,
    animationFrameLimit: 120
  }
};

/**
 * Default visualization system configuration
 */
const DEFAULT_VISUALIZATION_SYSTEM: VisualizationSystem = {
  renderingEngine: 'svg',
  performanceSettings: DEFAULT_PERFORMANCE_SETTINGS.medium,
  
  visualStates: {
    transcendence: {
      active: false,
      intensity: 0,
      transitionProgress: 0,
      colorPalette: ['#8B5CF6', '#6366F1', '#3B82F6'],
      waveAmplitude: 0.5,
      waveFrequency: 0.1,
      radianceLevel: 0.7
    },
    infinity: {
      active: false,
      intensity: 0,
      transitionProgress: 0,
      colorPalette: ['#C4B5FD', '#A78BFA', '#8B5CF6'],
      dimensionDepth: 3,
      omnidirectionalFlow: true,
      universalConnectivity: 0.8
    },
    illumination: {
      active: false,
      intensity: 0,
      transitionProgress: 0,
      colorPalette: ['#FBBF24', '#F59E0B', '#D97706'],
      glowIntensity: 0.7,
      rayCount: 12,
      pulseRate: 0.2
    },
    fractal: {
      active: false,
      intensity: 0,
      transitionProgress: 0,
      colorPalette: ['#10B981', '#059669', '#047857'],
      complexity: 0.6,
      iterations: 5,
      patternType: 'chakra'
    }
  },
  
  animations: {
    transitions: {
      type: 'fade',
      duration: 0.3,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      delayBetweenElements: 0.05
    },
    particles: {
      enabled: true,
      configs: {
        default: {
          count: 500,
          size: 2,
          color: '#8B5CF6',
          speed: 1,
          lifespan: 2000,
          blendMode: 'screen'
        },
        energyFlow: {
          count: 200,
          size: 1.5,
          color: '#6366F1',
          speed: 0.8,
          lifespan: 3000,
          blendMode: 'add'
        }
      },
      adaptiveParticleReduction: true
    },
    glowEffects: {
      enabled: true,
      configs: {
        chakra: {
          intensity: 0.8,
          color: '#8B5CF6',
          radius: 10,
          pulseRate: 1.5
        },
        energy: {
          intensity: 0.6,
          color: '#3B82F6',
          radius: 15
        }
      },
      performanceOptimized: true
    }
  }
};

export interface VisualizationConfigOptions {
  initialConfig?: Partial<VisualizationSystem>;
  overrideDeviceCapability?: 'low' | 'medium' | 'high';
}

/**
 * Hook for visualization system configuration
 */
export function useVisualizationConfig(options: VisualizationConfigOptions = {}) {
  const { config: perfConfig } = usePerfConfig();
  const [config, setConfig] = useState<VisualizationSystem>({
    ...DEFAULT_VISUALIZATION_SYSTEM,
    ...options.initialConfig
  });
  
  // Determine device capability
  const deviceCapability = options.overrideDeviceCapability || perfConfig.deviceCapability || 'medium';
  
  // Update performance settings based on device capability
  useEffect(() => {
    setConfig(prevConfig => ({
      ...prevConfig,
      performanceSettings: {
        ...prevConfig.performanceSettings,
        ...DEFAULT_PERFORMANCE_SETTINGS[deviceCapability]
      },
      // Adjust rendering engine for low-end devices
      renderingEngine: deviceCapability === 'low' ? 'svg' : prevConfig.renderingEngine,
      // Adjust animation settings
      animations: {
        ...prevConfig.animations,
        particles: {
          ...prevConfig.animations.particles,
          enabled: deviceCapability !== 'low',
          adaptiveParticleReduction: deviceCapability !== 'high'
        },
        glowEffects: {
          ...prevConfig.animations.glowEffects,
          performanceOptimized: deviceCapability !== 'high'
        }
      }
    }));
  }, [deviceCapability]);
  
  // Determine if simplified UI should be used
  const shouldUseSimplifiedUI = useMemo(() => {
    return config.performanceSettings.simplifiedForLowEnd || 
           deviceCapability === 'low' || 
           perfConfig.enableAdaptiveRendering;
  }, [config.performanceSettings.simplifiedForLowEnd, deviceCapability, perfConfig.enableAdaptiveRendering]);
  
  // Update configuration
  const updateConfig = (updates: Partial<VisualizationSystem>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates
    }));
  };
  
  return {
    config,
    updateConfig,
    deviceCapability,
    shouldUseSimplifiedUI
  };
}
