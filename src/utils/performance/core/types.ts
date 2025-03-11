
/**
 * Core Performance Monitoring Types
 * 
 * Foundational type definitions for the performance monitoring infrastructure.
 * These types are used across the performance monitoring system.
 */

// Re-export the base types from the central types.ts file
import {
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  MetricType,
  WebVitalName,
  WebVitalCategory,
  PerformanceMetric,
  ComponentMetrics,
  PerformanceMonitorConfig,
  QualityLevel,
  PerformanceSettings,
  PerformanceBoundaries,
  AdaptiveSettings
} from '../types';

export {
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  MetricType,
  WebVitalName,
  WebVitalCategory,
  PerformanceMetric,
  ComponentMetrics,
  PerformanceMonitorConfig,
  QualityLevel,
  PerformanceSettings,
  PerformanceBoundaries,
  AdaptiveSettings
};

// Base metric interface
export interface BaseMetric<T> {
  name: string;
  value: T;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Web vital metric structure
export interface WebVitalMetric extends BaseMetric<number> {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  rating?: 'good' | 'needs-improvement' | 'poor';
  attribution?: {
    element?: string;
    largestShiftTarget?: string;
    largestShiftTime?: number;
    loadState?: string;
    navigationEntry?: string;
    eventEntry?: string;
  };
}

// Device information for metrics reporting
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  viewport?: {
    width: number;
    height: number;
  };
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  memory?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
}

// Performance report payload
export interface PerformanceReportPayload {
  timestamp: string;
  session?: string;
  metrics: PerformanceMetric[];
  device?: DeviceInfo;
}
