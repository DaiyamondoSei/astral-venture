
/**
 * Performance Configuration Types
 * 
 * This module provides types for performance configuration.
 */

import { PerfConfig } from './types';
import { DEFAULT_PERF_CONFIGS } from './constants';

/**
 * Creates a performance configuration based on device capability
 */
export function createPerfConfig(deviceCapability: 'low' | 'medium' | 'high'): PerfConfig {
  return { ...DEFAULT_PERF_CONFIGS[deviceCapability] };
}

/**
 * Performance context options
 */
export interface PerformanceContextOptions {
  initialDeviceCapability?: 'low' | 'medium' | 'high';
  enableMetricsCollection?: boolean;
  enableAutoDeviceDetection?: boolean;
  enableAdaptiveRendering?: boolean;
  enablePerformanceMonitoring?: boolean;
  samplingRate?: number;
  errorReportingPath?: string;
}

/**
 * Additional utilities types
 */
export interface PerformanceDataSnapshot {
  timestamp: number;
  metrics: Record<string, number>;
  componentMetrics: Array<{
    name: string;
    renderTime: number;
    renderCount: number;
  }>;
  configState: Partial<PerfConfig>;
}

// Context initialization data
export type PerformanceContextData = {
  config: PerfConfig;
  isInitialized: boolean;
  autoDetectedCapability?: 'low' | 'medium' | 'high';
};
