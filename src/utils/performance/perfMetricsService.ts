
/**
 * Performance Metrics Service
 * 
 * Handles the collection and submission of performance metrics to the server.
 */
import { PerformanceMetric, PerformanceReportPayload } from './types';
import { invokeEdgeFunction } from '../edgeFunctionHelper';
import { Result, success, failure } from '../result/Result';
import { perfMetricsCollector } from './perfMetricsCollector';

/**
 * Service for tracking and reporting performance metrics
 */
class PerfMetricsService {
  private isEnabled: boolean = true;
  private pendingMetrics: PerformanceMetric[] = [];
  private isReporting: boolean = false;
  
  constructor() {
    // Register callback for automatic metric reporting
    perfMetricsCollector.onFlush(this.handleMetricsBatch.bind(this));
    
    // Register document visibility handler for flushing on page hide
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }
  
  /**
   * Handle metrics batch from collector
   */
  private handleMetricsBatch(metrics: PerformanceMetric[]): void {
    if (!this.isEnabled || metrics.length === 0) return;
    
    // Add to pending metrics
    this.pendingMetrics.push(...metrics);
    
    // Submit if we're not already in the process of reporting
    if (!this.isReporting) {
      void this.submitPendingMetrics();
    }
  }
  
  /**
   * Handle document visibility change
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      // Flush perfMetricsCollector to ensure all metrics are added to pendingMetrics
      void perfMetricsCollector.flush();
      
      // Force submission of pending metrics when page is hidden
      if (this.pendingMetrics.length > 0) {
        void this.submitPendingMetricsSync();
      }
    }
  }
  
  /**
   * Submit metrics to the server
   */
  public async sendMetrics(metrics: PerformanceMetric[]): Promise<Result<void, Error>> {
    if (!this.isEnabled || metrics.length === 0) {
      return success(undefined);
    }
    
    try {
      // Add to pending metrics
      this.pendingMetrics.push(...metrics);
      
      // Submit if we're not already in the process of reporting
      if (!this.isReporting) {
        return await this.submitPendingMetrics();
      }
      
      return success(undefined);
    } catch (error) {
      console.error('Error sending performance metrics:', error);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Get device information for metrics reporting
   */
  private getDeviceInfo(): Record<string, any> {
    const deviceInfo: Record<string, any> = {
      userAgent: navigator.userAgent
    };
    
    // Add screen info if available
    if (window.screen) {
      deviceInfo.screenWidth = window.screen.width;
      deviceInfo.screenHeight = window.screen.height;
      deviceInfo.devicePixelRatio = window.devicePixelRatio;
    }
    
    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        deviceInfo.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    
    return deviceInfo;
  }
  
  /**
   * Submit pending metrics to the server
   */
  private async submitPendingMetrics(): Promise<Result<void, Error>> {
    if (this.pendingMetrics.length === 0) {
      return success(undefined);
    }
    
    this.isReporting = true;
    
    try {
      const metrics = [...this.pendingMetrics];
      this.pendingMetrics = [];
      
      const payload: PerformanceReportPayload = {
        timestamp: new Date().toISOString(),
        metrics,
        device: this.getDeviceInfo()
      };
      
      await invokeEdgeFunction('track-performance', payload);
      
      this.isReporting = false;
      
      // If more metrics accumulated while we were submitting, submit those too
      if (this.pendingMetrics.length > 0) {
        return this.submitPendingMetrics();
      }
      
      return success(undefined);
    } catch (error) {
      this.isReporting = false;
      console.error('Failed to send performance metrics:', error);
      
      // Put the metrics back in the queue for retry
      this.pendingMetrics.push(...this.pendingMetrics);
      
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Submit pending metrics synchronously using sendBeacon
   * This is used when the page is being unloaded
   */
  private submitPendingMetricsSync(): Result<void, Error> {
    if (this.pendingMetrics.length === 0 || !navigator.sendBeacon) {
      return success(undefined);
    }
    
    try {
      const metrics = [...this.pendingMetrics];
      this.pendingMetrics = [];
      
      const payload: PerformanceReportPayload = {
        timestamp: new Date().toISOString(),
        metrics,
        device: this.getDeviceInfo()
      };
      
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json'
      });
      
      navigator.sendBeacon('/api/track-performance', blob);
      
      return success(undefined);
    } catch (error) {
      console.error('Failed to send performance metrics synchronously:', error);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Enable or disable metrics reporting
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Create a singleton instance
const perfMetricsService = new PerfMetricsService();

// Export the instance
export default perfMetricsService;
