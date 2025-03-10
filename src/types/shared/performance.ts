
export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'low' | 'medium' | 'high';
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface PerformancePayload {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  metrics: PerformanceMetric[];
  webVitals: WebVitalMetric[];
  timestamp: number;
}
