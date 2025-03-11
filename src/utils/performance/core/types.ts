
import { ComponentMetrics, PerformanceMetric } from './metrics';

export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';
export type RenderFrequency = 'low' | 'medium' | 'high';

export interface PerformanceConfig {
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  slowRenderThreshold: number;
  enableValidation: boolean;
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
}

export interface PerformanceContext {
  config: PerformanceConfig;
  metrics: ComponentMetrics[];
  status: {
    fps: number;
    memory: number;
    isThrottled: boolean;
  };
  updateConfig: (updates: Partial<PerformanceConfig>) => void;
  trackMetric: (metric: PerformanceMetric) => void;
  getDeviceCapability: () => DeviceCapability;
}

export interface ValidationConfig {
  enabled: boolean;
  validateProps: boolean;
  validateState: boolean;
  validateEffects: boolean;
  validateRenders: boolean;
  strictMode: boolean;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type ValidationFunction<T> = (value: unknown) => T;

export interface ValidationSchema<T> {
  validate: ValidationFunction<T>;
  validateAsync?: (value: unknown) => Promise<T>;
}
