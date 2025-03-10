
/**
 * Shared types for Edge Functions and Frontend
 * These types are designed to work in both Deno (Edge Functions) and TypeScript (Frontend)
 */

// Standard response format for all edge functions
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Performance metrics types
export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  renderType: 'initial' | 'update' | 'effect';
  timestamp: number;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

export interface PerformanceMetricPayload {
  sessionId: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  metrics: ComponentMetric[];
  webVitals: WebVitalMetric[];
  timestamp: number;
}

export interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  deviceMemory?: number | 'unknown';
  hardwareConcurrency?: number | 'unknown';
  connectionType?: string;
  viewport?: {
    width: number;
    height: number;
  };
  screenSize?: {
    width: number;
    height: number;
  };
  pixelRatio?: number;
}

// Database performance metrics
export interface PerformanceMetric {
  component_name: string;
  avg_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
}

// Error types
export enum EdgeFunctionErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}
