
/**
 * Hook for accessing and updating performance configuration
 */
import { useContext } from 'react';
import PerformanceContext from '../contexts/PerformanceContext';

export interface PerfConfig {
  // Core configuration
  enableMetricsCollection: boolean;
  enablePerformanceTracking: boolean;
  enableAdaptiveRendering: boolean;
  
  // Thresholds and limits
  slowRenderThreshold: number;
  samplingRate: number;
  
  // Device capability
  deviceCapability?: 'low' | 'medium' | 'high';
  
  // Debug settings
  debugMode: boolean;
}

export const DEFAULT_PERF_CONFIG: PerfConfig = {
  enableMetricsCollection: true,
  enablePerformanceTracking: true,
  enableAdaptiveRendering: true,
  slowRenderThreshold: 16, // 60fps threshold
  samplingRate: 0.1, // Sample 10% of metrics
  debugMode: false
};

export function usePerfConfig() {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerfConfig must be used within a PerformanceProvider');
  }
  
  return {
    config: context.config,
    updateConfig: context.updateConfig,
    deviceCapability: context.deviceCapability,
    isLowPerformance: context.isLowPerformance,
    isMediumPerformance: context.isMediumPerformance,
    isHighPerformance: context.isHighPerformance,
    shouldUseSimplifiedUI: context.shouldUseSimplifiedUI
  };
}
