
/**
 * Performance metric types
 */

import type { Timestamp, UUID } from '../base/primitives';

export enum MetricType {
  RENDER = 'render',
  INTERACTION = 'interaction',
  NETWORK = 'network',
  MEMORY = 'memory',
  COMPUTATION = 'computation'
}

export interface PerformanceMetric {
  readonly id: UUID;
  readonly type: MetricType;
  readonly value: number;
  readonly timestamp: Timestamp;
  readonly component?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface MetricThresholds {
  readonly warning: number;
  readonly error: number;
  readonly critical: number;
}

export type MetricSubscriber = (metric: PerformanceMetric) => void;
