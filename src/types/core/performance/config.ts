
/**
 * Performance configuration types
 * 
 * This module provides types for performance configuration
 * and default values.
 */

import { PerfConfig } from './constants';
import { DEFAULT_PERF_CONFIG } from './runtime-constants';

/**
 * Extended performance configuration with validation methods
 */
export interface PerformanceConfiguration extends PerfConfig {
  /**
   * Validate the configuration
   */
  validate(): { valid: boolean; issues?: string[] };
  
  /**
   * Reset to default values
   */
  reset(): void;
  
  /**
   * Create a configuration optimized for the given device capability
   */
  optimizeFor(deviceCapability: 'low' | 'medium' | 'high'): PerformanceConfiguration;
}

/**
 * Create a new performance configuration with the given overrides
 */
export function createPerfConfig(
  overrides?: Partial<PerfConfig>
): PerformanceConfiguration {
  const config = {
    ...DEFAULT_PERF_CONFIG,
    ...overrides,
    
    validate() {
      const issues: string[] = [];
      
      // Validate sampling rate is between 0 and 1
      if (this.samplingRate < 0 || this.samplingRate > 1) {
        issues.push('Sampling rate must be between 0 and 1');
      }
      
      // Validate throttle interval is positive
      if (this.throttleInterval < 0) {
        issues.push('Throttle interval must be positive');
      }
      
      // Validate max tracked components is positive
      if (this.maxTrackedComponents <= 0) {
        issues.push('Max tracked components must be positive');
      }
      
      return {
        valid: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
      };
    },
    
    reset() {
      Object.assign(this, DEFAULT_PERF_CONFIG);
    },
    
    optimizeFor(deviceCapability: 'low' | 'medium' | 'high'): PerformanceConfiguration {
      switch (deviceCapability) {
        case 'low':
          return createPerfConfig({
            ...this,
            enablePerformanceTracking: true,
            enableRenderTracking: false,
            enableValidation: false,
            enablePropTracking: false,
            enableDebugLogging: false,
            intelligentProfiling: true,
            inactiveTabThrottling: true,
            batchUpdates: true,
            samplingRate: 0.2,
            throttleInterval: 200,
            maxTrackedComponents: 20
          });
        
        case 'medium':
          return createPerfConfig({
            ...this,
            enablePerformanceTracking: true,
            enableRenderTracking: true,
            enableValidation: false,
            enablePropTracking: false,
            enableDebugLogging: false,
            intelligentProfiling: true,
            inactiveTabThrottling: true,
            batchUpdates: true,
            samplingRate: 0.5,
            throttleInterval: 100,
            maxTrackedComponents: 50
          });
        
        case 'high':
          return createPerfConfig({
            ...this,
            enablePerformanceTracking: true,
            enableRenderTracking: true,
            enableValidation: true,
            enablePropTracking: true,
            enableDebugLogging: true,
            intelligentProfiling: true,
            inactiveTabThrottling: false,
            batchUpdates: false,
            samplingRate: 1.0,
            throttleInterval: 0,
            maxTrackedComponents: 100
          });
      }
    }
  };
  
  return config as PerformanceConfiguration;
}
