
/**
 * Core performance monitoring types
 */

// Component metrics tracking
export interface ComponentMetric {
  componentName: string;
  averageRenderTime: number;
  totalRenderTime: number;
  renderCount: number;
  lastRenderTime: number;
  slowRenderCount: number;
  maxRenderTime?: number;
  firstRenderTime?: number;
}

// Map structure for component metrics
export interface ComponentMetrics extends Map<string, ComponentMetric> {}

// Performance data structure
export interface PerformanceData {
  fps: number;
  memoryUsage: number; // MB
  renderTime: number; // ms
  domSize: number; // Number of nodes
  interactionLatency: number; // ms
  lastUpdated: number; // timestamp
}

// Performance monitor options
export interface PerformanceMonitorOptions {
  sampleRate?: number;
  slowThreshold?: number;
  enabled?: boolean;
  trackRenders?: boolean;
  trackInteractions?: boolean;
  trackMemory?: boolean;
}

// Render frequency categorization
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Device capability categorization
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance tracking options
export interface PerformanceTrackingOptions {
  componentName?: string;
  trackRenders?: boolean;
  trackEffects?: boolean;
  trackProps?: boolean;
  trackMounts?: boolean;
  throttleInterval?: number;
  debugMode?: boolean;
}

// Code quality related types
export type CodeQualityIssueType = 'performance' | 'pattern' | 'security' | 'complexity';

export interface CodeQualityIssue {
  id: string;
  component: string;
  type: CodeQualityIssueType;
  message: string;
  severity: 'high' | 'medium' | 'low';
  suggestions: string[];
  codeSnippet?: string;
  autoFixable?: boolean;
}

export interface CodeQualityStats {
  issueCount: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  byType: Record<CodeQualityIssueType, number>;
  componentsAnalyzed: number;
  highPriorityIssues: CodeQualityIssue[];
  lastUpdated: Date;
}
