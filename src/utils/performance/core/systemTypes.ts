
/**
 * Core System Types
 */
export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

export interface SystemMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage?: number;
  networkLatency?: number;
}

export interface AdaptiveConfig {
  qualityLevel: number;
  particleCount: number;
  effectsEnabled: boolean;
  geometryDetail: number;
}

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
  value?: T;
}

export interface MonitoringConfig {
  enabled: boolean;
  samplingRate: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled: boolean;
}
