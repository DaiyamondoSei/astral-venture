
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

// Performance mode definitions
export enum PerformanceMode {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Device capability
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Render frequency
export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive'
}

// Performance preset options
export type PerformancePreset = 'comprehensive' | 'balanced' | 'minimal' | 'disabled';

// Performance feature configuration
export interface FeatureConfig {
  particleCount: number;
  animationComplexity: number;
  enableBlur: boolean;
  enableGlow: boolean;
  enableShadows: boolean;
  enableParallax: boolean;
  enablePreciseRenderingOptimization: boolean;
}

// Performance feature flags
export interface PerformanceFeatureFlags {
  enableHeavyAnimations: boolean;
  enableBackgroundEffects: boolean;
  enableDetailedChakraVisualization: boolean;
  enableAdvancedParticles: boolean;
  enableRealtimeUpdates: boolean;
  enableHighResolutionAssets: boolean;
}

// Web Vitals Config
export interface WebVitalsConfig {
  lcpThreshold: number;
  fidThreshold: number;
  clsThreshold: number;
  ttfbThreshold: number;
  collectAll: boolean;
}

// Memory Usage Thresholds
export interface MemoryUsageThresholds {
  warning: number;  // MB
  critical: number; // MB
}

// Define performance metrics type
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  jsHeapSize?: number;
  loadTime?: number;
  domNodes?: number;
}

// Performance Configuration Interface
export interface PerformanceConfig {
  performanceMode: PerformanceMode;
  deviceCapability: DeviceCapability;
  adaptiveQuality: boolean;
  manualPerformanceMode: boolean;
  features: PerformanceFeatureFlags;
  webVitals: WebVitalsConfig;
  memoryThresholds: MemoryUsageThresholds;
  showPerformanceStats: boolean;
  enablePerformanceMonitoring: boolean;
  setManualPerformanceMode?: (mode: PerformanceMode) => void;
}

// Performance mode setting functions
export const applyLowPerformanceMode = (): void => {
  console.log("Applying low performance mode");
  performanceMonitor.startMonitoring();
};

export const applyMediumPerformanceMode = (): void => {
  console.log("Applying medium performance mode");
  performanceMonitor.startMonitoring();
};

export const applyHighPerformanceMode = (): void => {
  console.log("Applying high performance mode");
  performanceMonitor.startMonitoring();
};

// Detect device capability
export const detectDeviceCapability = (): DeviceCapability => {
  // Logic to detect device capability
  return DeviceCapability.HIGH;
};

// Get recommended performance mode based on device capability
export const getRecommendedPerformanceMode = (
  deviceCapability: DeviceCapability
): PerformanceMode => {
  switch (deviceCapability) {
    case DeviceCapability.LOW:
      return PerformanceMode.LOW;
    case DeviceCapability.MEDIUM:
      return PerformanceMode.MEDIUM;
    case DeviceCapability.HIGH:
      return PerformanceMode.HIGH;
    default:
      return PerformanceMode.MEDIUM;
  }
};

// Analyze system performance
export const analyzeSystemPerformance = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    // Simulate performance analysis
    setTimeout(() => {
      resolve({
        fps: 60,
        memoryUsage: 50,
        renderTime: 8,
        jsHeapSize: 20,
        loadTime: 1200,
        domNodes: 250
      });
    }, 100);
  });
};

// Get performance feature configuration based on mode
export const getFeatureConfig = (mode: PerformanceMode): FeatureConfig => {
  switch (mode) {
    case PerformanceMode.LOW:
      return {
        particleCount: 50,
        animationComplexity: 1,
        enableBlur: false,
        enableGlow: false,
        enableShadows: false,
        enableParallax: false,
        enablePreciseRenderingOptimization: false
      };
    case PerformanceMode.MEDIUM:
      return {
        particleCount: 150,
        animationComplexity: 2,
        enableBlur: true,
        enableGlow: true,
        enableShadows: false,
        enableParallax: true,
        enablePreciseRenderingOptimization: true
      };
    case PerformanceMode.HIGH:
      return {
        particleCount: 300,
        animationComplexity: 3,
        enableBlur: true,
        enableGlow: true,
        enableShadows: true,
        enableParallax: true,
        enablePreciseRenderingOptimization: true
      };
    default:
      return {
        particleCount: 150,
        animationComplexity: 2,
        enableBlur: true,
        enableGlow: true,
        enableShadows: false,
        enableParallax: true,
        enablePreciseRenderingOptimization: true
      };
  }
};

// Create default performance config
export const createDefaultPerformanceConfig = (): PerformanceConfig => {
  const deviceCapability = detectDeviceCapability();
  const recommendedMode = getRecommendedPerformanceMode(deviceCapability);
  
  return {
    performanceMode: recommendedMode,
    deviceCapability,
    adaptiveQuality: true,
    manualPerformanceMode: false,
    features: {
      enableHeavyAnimations: recommendedMode !== PerformanceMode.LOW,
      enableBackgroundEffects: recommendedMode !== PerformanceMode.LOW,
      enableDetailedChakraVisualization: recommendedMode === PerformanceMode.HIGH,
      enableAdvancedParticles: recommendedMode === PerformanceMode.HIGH,
      enableRealtimeUpdates: true,
      enableHighResolutionAssets: recommendedMode === PerformanceMode.HIGH
    },
    webVitals: {
      lcpThreshold: 2500,
      fidThreshold: 100,
      clsThreshold: 0.1,
      ttfbThreshold: 600,
      collectAll: true
    },
    memoryThresholds: {
      warning: 80,  // MB
      critical: 150 // MB
    },
    showPerformanceStats: false,
    enablePerformanceMonitoring: true
  };
};

// Get performance preset
export const getPerformancePreset = (preset: PerformancePreset): PerformanceConfig => {
  const baseConfig = createDefaultPerformanceConfig();
  
  switch (preset) {
    case 'comprehensive':
      return {
        ...baseConfig,
        performanceMode: PerformanceMode.HIGH,
        adaptiveQuality: false,
        features: {
          ...baseConfig.features,
          enableHeavyAnimations: true,
          enableBackgroundEffects: true,
          enableDetailedChakraVisualization: true,
          enableAdvancedParticles: true,
          enableRealtimeUpdates: true,
          enableHighResolutionAssets: true
        }
      };
    case 'balanced':
      return {
        ...baseConfig,
        performanceMode: PerformanceMode.MEDIUM,
        adaptiveQuality: true
      };
    case 'minimal':
      return {
        ...baseConfig,
        performanceMode: PerformanceMode.LOW,
        adaptiveQuality: false,
        features: {
          ...baseConfig.features,
          enableHeavyAnimations: false,
          enableBackgroundEffects: false,
          enableDetailedChakraVisualization: false,
          enableAdvancedParticles: false,
          enableRealtimeUpdates: true,
          enableHighResolutionAssets: false
        }
      };
    case 'disabled':
      return {
        ...baseConfig,
        performanceMode: PerformanceMode.LOW,
        adaptiveQuality: false,
        enablePerformanceMonitoring: false,
        features: {
          ...baseConfig.features,
          enableHeavyAnimations: false,
          enableBackgroundEffects: false,
          enableDetailedChakraVisualization: false,
          enableAdvancedParticles: false,
          enableRealtimeUpdates: false,
          enableHighResolutionAssets: false
        }
      };
    default:
      return baseConfig;
  }
};
