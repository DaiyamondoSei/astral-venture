/**
 * Performance monitoring utility
 * 
 * This module provides tools for tracking and analyzing performance metrics
 * across the application.
 */

import { supabase } from '@/lib/supabaseClient';

// Metric types
export enum MetricType {
  RENDER = 'render',
  LOAD = 'load',
  INTERACTION = 'interaction',
  NETWORK = 'network',
  BACKGROUND = 'background'
}

// Performance metric interface
export interface PerformanceMetric {
  id?: string;
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  first_render_time?: number;
  interaction_latency?: number;
  created_at?: string;
}

// Component-specific metrics
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  slowRenderCount: number;
  lastRenderTime: number;
  firstRenderTime: number;
  interactionLatency: number;
  renderTimes: number[];
}

// Web vital metrics
export interface WebVital {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

// Config options
export interface PerformanceMonitorConfig {
  enabled: boolean;
  slowThreshold: number;
  criticalThreshold: number;
  sampleRate: number;
  maxMetrics: number;
  reportInterval: number;
  logToConsole: boolean;
  logToServer: boolean;
  trackInteractions: boolean;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, ComponentMetrics> = new Map();
  private webVitals: WebVital[] = [];
  private config: PerformanceMonitorConfig;
  private reportTimer: number | null = null;
  private isReporting = false;
  
  private constructor() {
    // Default configuration
    this.config = {
      enabled: true,
      slowThreshold: 50, // ms
      criticalThreshold: 200, // ms
      sampleRate: 0.2, // 20% of renders
      maxMetrics: 100,
      reportInterval: 60000, // 1 minute
      logToConsole: false,
      logToServer: false,
      trackInteractions: true
    };
    
    // Start metrics reporting if enabled
    if (this.config.enabled && this.config.reportInterval > 0) {
      this.startReporting();
    }
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Update monitor configuration
   */
  public setConfig(config: Partial<PerformanceMonitorConfig>): void {
    const oldConfig = {...this.config};
    this.config = {...this.config, ...config};
    
    // Handle reporting interval changes
    if (this.config.reportInterval !== oldConfig.reportInterval ||
        this.config.enabled !== oldConfig.enabled) {
      this.stopReporting();
      if (this.config.enabled && this.config.reportInterval > 0) {
        this.startReporting();
      }
    }
  }
  
  /**
   * Add a component render metric
   */
  public addComponentMetric(
    componentName: string,
    renderTime: number,
    type: MetricType = MetricType.RENDER
  ): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) return;
    
    const existingMetrics = this.metrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      slowRenderCount: 0,
      lastRenderTime: 0,
      firstRenderTime: 0,
      interactionLatency: 0,
      renderTimes: []
    };
    
    const updatedMetrics = {
      ...existingMetrics,
      renderCount: existingMetrics.renderCount + 1,
      totalRenderTime: existingMetrics.totalRenderTime + renderTime,
      lastRenderTime: renderTime
    };
    
    // Track first render time
    if (existingMetrics.renderCount === 0 || !existingMetrics.firstRenderTime) {
      updatedMetrics.firstRenderTime = renderTime;
    }
    
    // Track interaction latency
    if (type === MetricType.INTERACTION) {
      updatedMetrics.interactionLatency = renderTime;
    }
    
    // Track slow renders
    if (renderTime > this.config.slowThreshold) {
      updatedMetrics.slowRenderCount++;
      
      // Log critical renders
      if (renderTime > this.config.criticalThreshold && this.config.logToConsole) {
        console.warn(
          `[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    }
    
    // Add render time to history (keep last 10)
    updatedMetrics.renderTimes = [
      ...existingMetrics.renderTimes.slice(-9),
      renderTime
    ];
    
    // Store updated metrics
    this.metrics.set(componentName, updatedMetrics);
    
    // Limit metrics storage
    if (this.metrics.size > this.config.maxMetrics) {
      // Remove the oldest entry
      const firstKey = this.metrics.keys().next().value;
      this.metrics.delete(firstKey);
    }
  }
  
  /**
   * Add a web vital metric
   */
  public addWebVital(
    name: string,
    value: number,
    category: 'loading' | 'interaction' | 'visual_stability'
  ): void {
    if (!this.config.enabled) return;
    
    this.webVitals.push({
      name,
      value,
      category,
      timestamp: Date.now()
    });
    
    // Limit storage to latest 50 vitals
    if (this.webVitals.length > 50) {
      this.webVitals = this.webVitals.slice(-50);
    }
    
    // Log to console if enabled
    if (this.config.logToConsole) {
      console.info(`[Web Vital] ${name}: ${value}`);
    }
  }
  
  /**
   * Get performance metrics for all components
   */
  public getMetrics(): ComponentMetrics[] {
    return Array.from(this.metrics.values());
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): ComponentMetrics | undefined {
    return this.metrics.get(componentName);
  }
  
  /**
   * Get all web vitals
   */
  public getWebVitals(): WebVital[] {
    return this.webVitals;
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics.clear();
    this.webVitals = [];
  }
  
  /**
   * Start reporting metrics at the configured interval
   */
  private startReporting(): void {
    if (this.reportTimer) return;
    
    this.reportTimer = window.setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }
  
  /**
   * Stop reporting metrics
   */
  private stopReporting(): void {
    if (this.reportTimer) {
      window.clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }
  
  /**
   * Report metrics to the server
   */
  public async reportMetrics(): Promise<boolean> {
    if (!this.config.enabled || !this.config.logToServer || this.isReporting) return false;
    if (this.metrics.size === 0) return false;
    
    this.isReporting = true;
    
    try {
      // Convert metrics to format for storage
      const metricsToReport = Array.from(this.metrics.values()).map(metric => ({
        component_name: metric.componentName,
        average_render_time: metric.renderCount > 0 ? 
          metric.totalRenderTime / metric.renderCount : 0,
        total_renders: metric.renderCount,
        slow_renders: metric.slowRenderCount,
        first_render_time: metric.firstRenderTime,
        interaction_latency: metric.interactionLatency,
        created_at: new Date().toISOString()
      }));
      
      // Send metrics to the server through Edge Function
      const response = await fetch('/api/track-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: metricsToReport,
          vitals: this.webVitals,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.error('[Performance] Failed to report metrics:', await response.text());
        return false;
      }
      
      // Clear metrics after reporting
      this.clearMetrics();
      return true;
    } catch (error) {
      console.error('[Performance] Error reporting metrics:', error);
      return false;
    } finally {
      this.isReporting = false;
    }
  }
}

// Export the singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

export default performanceMonitor;
