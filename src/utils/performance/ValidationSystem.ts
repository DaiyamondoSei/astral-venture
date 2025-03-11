
import { z } from 'zod';
import { DeviceCapability } from '../performanceUtils';

// Performance Schema
export const performanceSchema = z.object({
  deviceCapability: z.enum(['low', 'medium', 'high'] as const),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    timestamp: z.number(),
    type: z.string()
  })),
  config: z.object({
    enabled: z.boolean(),
    sampling: z.number().min(0).max(1),
    threshold: z.number().positive()
  })
});

// Runtime validation functions
export const validateDeviceCapability = (value: unknown): DeviceCapability => {
  const result = z.enum(['low', 'medium', 'high'] as const).safeParse(value);
  if (!result.success) {
    throw new Error('Invalid device capability');
  }
  return result.data;
};

export const validatePerformanceMetric = (metric: unknown) => {
  const result = z.object({
    name: z.string(),
    value: z.number(),
    timestamp: z.number(),
    type: z.string()
  }).safeParse(metric);

  if (!result.success) {
    throw new Error('Invalid performance metric');
  }
  return result.data;
};

export const validateConfiguration = (config: unknown) => {
  const result = performanceSchema.shape.config.safeParse(config);
  if (!result.success) {
    throw new Error('Invalid performance configuration');
  }
  return result.data;
};
