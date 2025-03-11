
import { DeviceCapability, AdaptiveConfig } from './core/systemTypes';
import { performanceMonitor } from './performanceMonitor';

export class AdaptiveRenderer {
  private static instance: AdaptiveRenderer;
  private currentConfig: AdaptiveConfig;

  private constructor() {
    this.currentConfig = this.getDefaultConfig('medium');
  }

  static getInstance(): AdaptiveRenderer {
    if (!AdaptiveRenderer.instance) {
      AdaptiveRenderer.instance = new AdaptiveRenderer();
    }
    return AdaptiveRenderer.instance;
  }

  private getDefaultConfig(capability: DeviceCapability): AdaptiveConfig {
    switch (capability) {
      case 'high':
        return {
          qualityLevel: 5,
          particleCount: 1000,
          effectsEnabled: true,
          geometryDetail: 4
        };
      case 'medium':
        return {
          qualityLevel: 3,
          particleCount: 500,
          effectsEnabled: true,
          geometryDetail: 2
        };
      case 'low':
        return {
          qualityLevel: 1,
          particleCount: 200,
          effectsEnabled: false,
          geometryDetail: 1
        };
    }
  }

  updateConfiguration(metrics: { fps: number; memoryUsage: number }): void {
    const currentConfig = this.currentConfig;
    
    if (metrics.fps < 30) {
      this.degradeQuality();
    } else if (metrics.fps > 58 && metrics.memoryUsage < 500) {
      this.improveQuality();
    }

    if (this.currentConfig !== currentConfig) {
      performanceMonitor.logConfigChange(this.currentConfig);
    }
  }

  private degradeQuality(): void {
    this.currentConfig = {
      ...this.currentConfig,
      qualityLevel: Math.max(1, this.currentConfig.qualityLevel - 1),
      particleCount: Math.max(200, this.currentConfig.particleCount * 0.8),
      effectsEnabled: this.currentConfig.qualityLevel > 2,
      geometryDetail: Math.max(1, this.currentConfig.geometryDetail - 1)
    };
  }

  private improveQuality(): void {
    this.currentConfig = {
      ...this.currentConfig,
      qualityLevel: Math.min(5, this.currentConfig.qualityLevel + 1),
      particleCount: Math.min(1000, this.currentConfig.particleCount * 1.2),
      effectsEnabled: true,
      geometryDetail: Math.min(4, this.currentConfig.geometryDetail + 1)
    };
  }

  getCurrentConfig(): AdaptiveConfig {
    return { ...this.currentConfig };
  }
}

export const adaptiveRenderer = AdaptiveRenderer.getInstance();
