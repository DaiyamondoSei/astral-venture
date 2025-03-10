
/**
 * Performance Metrics Reporter
 * 
 * Handles reporting performance metrics to the Supabase backend.
 */

import { PerformanceMetric } from './types';
import { supabase } from '@/lib/supabaseClient';
import { ensurePerformanceMetricsTable } from '@/lib/supabaseClient';

// Interface for user data
interface UserResponse {
  id: string;
}

/**
 * Handles the reporting of performance metrics to the server
 */
class MetricsReporter {
  private isReporting = false;
  private reportingEnabled = true;
  private reportingInterval = 60000; // 1 minute
  private reportingTimer: number | null = null;
  private metricsQueue: PerformanceMetric[] = [];
  private queueLimit = 50;
  private initialized = false;
  private user: UserResponse | null = null;
  
  /**
   * Initialize the metrics reporter
   */
  public async init(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Initialize the table if it doesn't exist
      const tableCreated = await ensurePerformanceMetricsTable();
      
      if (!tableCreated) {
        console.warn('Failed to ensure performance metrics table exists');
        return false;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      
      // Start reporting timer
      this.startReportingTimer();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing metrics reporter:', error);
      return false;
    }
  }
  
  /**
   * Start the reporting timer
   */
  private startReportingTimer(): void {
    if (this.reportingTimer !== null || typeof window === 'undefined') {
      return;
    }
    
    this.reportingTimer = window.setInterval(() => {
      this.reportMetrics();
    }, this.reportingInterval);
  }
  
  /**
   * Stop the reporting timer
   */
  private stopReportingTimer(): void {
    if (this.reportingTimer === null || typeof window === 'undefined') {
      return;
    }
    
    window.clearInterval(this.reportingTimer);
    this.reportingTimer = null;
  }
  
  /**
   * Queue metrics for reporting
   */
  public queueMetrics(metrics: PerformanceMetric | PerformanceMetric[]): void {
    if (!this.reportingEnabled) {
      return;
    }
    
    const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
    
    // Add user ID if available
    const metricsWithUser = metricsArray.map(metric => ({
      ...metric,
      user_id: this.user?.id || null
    }));
    
    // Add to queue
    this.metricsQueue.push(...metricsWithUser);
    
    // Trim queue if it gets too large
    if (this.metricsQueue.length > this.queueLimit) {
      this.metricsQueue = this.metricsQueue.slice(-this.queueLimit);
    }
    
    // Auto-report if queue is getting full
    if (this.metricsQueue.length >= this.queueLimit / 2) {
      this.reportMetrics();
    }
  }
  
  /**
   * Report metrics to the server
   */
  public async reportMetrics(): Promise<boolean> {
    // Skip if already reporting or no metrics
    if (this.isReporting || this.metricsQueue.length === 0 || !this.reportingEnabled) {
      return false;
    }
    
    try {
      this.isReporting = true;
      
      // Make sure table exists
      if (!this.initialized) {
        await this.init();
      }
      
      // Get metrics to report
      const metricsToReport = [...this.metricsQueue];
      this.metricsQueue = [];
      
      // Insert metrics
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToReport);
      
      if (error) {
        console.error('Error reporting metrics:', error);
        
        // Put metrics back in queue to try again later
        this.metricsQueue = [...metricsToReport, ...this.metricsQueue].slice(0, this.queueLimit);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error reporting metrics:', error);
      return false;
    } finally {
      this.isReporting = false;
    }
  }
  
  /**
   * Enable or disable reporting
   */
  public setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
    
    if (enabled) {
      this.startReportingTimer();
    } else {
      this.stopReportingTimer();
    }
  }
  
  /**
   * Dispose of the reporter
   */
  public dispose(): void {
    this.stopReportingTimer();
    
    // Report any remaining metrics
    if (this.metricsQueue.length > 0) {
      this.reportMetrics().catch(error => {
        console.error('Error reporting metrics during disposal:', error);
      });
    }
  }
}

// Create singleton instance
const metricsReporter = new MetricsReporter();

// Export singleton
export default metricsReporter;
