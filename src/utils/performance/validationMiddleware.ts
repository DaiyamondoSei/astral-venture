
import { PerformanceMetric, ComponentMetrics } from './types';
import { validateDeviceCapability, validatePerformanceMetric, validateConfiguration } from './ValidationSystem';

export const validateMetricsCollectorInput = (
  metric: Partial<PerformanceMetric>
): PerformanceMetric => {
  try {
    return validatePerformanceMetric(metric);
  } catch (error) {
    console.error('Invalid performance metric:', error);
    throw error;
  }
};

export const validateComponentMetrics = (
  metrics: Partial<ComponentMetrics>
): ComponentMetrics => {
  const { componentName, renderCount, totalRenderTime, averageRenderTime, lastRenderTime } = metrics;

  if (!componentName || typeof renderCount !== 'number' || typeof totalRenderTime !== 'number' ||
      typeof averageRenderTime !== 'number' || typeof lastRenderTime !== 'number') {
    throw new Error('Invalid component metrics');
  }

  return metrics as ComponentMetrics;
};

export const createValidationMiddleware = () => {
  return {
    validateMetric: validateMetricsCollectorInput,
    validateComponent: validateComponentMetrics,
    validateCapability: validateDeviceCapability,
    validateConfig: validateConfiguration
  };
};
