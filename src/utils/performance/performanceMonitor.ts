/**
 * Performance Monitor Utility - Backend-optimized Version
 * 
 * Tracks component render times with minimal overhead and sends data to backend
 */

// Basic performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTimes: number[];
  lastRenderTime: number;
  averageRenderTime: number;
  events: Array<{
    time: number;
    type: string;
    data?: any;
  }>;
  lastUpdated: number;
}

// Simplified render time metric for backend transmission
interface RenderTimeMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

// Interface for metrics to be sent to backend
interface BatchedMetrics {
  metrics: RenderTimeMetric[];
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
  };
}

class PerformanceMonitor {
  private metrics: Record<string, Partial<PerformanceMetrics>> = {};
  private listeners: Array<(metrics: Record<string, Partial<PerformanceMetrics>>) => void> = [];
  private pendingUpdates: boolean = false;
  private lastNotifyTime: number = 0;
  private notifyThrottle: number = 1000; // Increased from 100ms to 1000ms
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  private maxTrackedComponents: number = 10; // Reduced from 20 to 10
  private metricQueue: RenderTimeMetric[] = [];
  private flushInterval: number | null = null;
  private sessionId: string = '';
  private supabaseClient: any = null; // Will be initialized if available
  
  constructor() {
    // Only initialize in development mode
    if (this.isEnabled) {
      // Generate a session ID
      this.sessionId = this.generateSessionId();
      
      // Set up flush interval to send metrics to backend periodically
      this.flushInterval = window.setInterval(() => this.flushMetrics(), 30000); // Every 30 seconds
      
      // Clean up metrics every minute to prevent memory issues
      window.setInterval(() => this.cleanupOldMetrics(), 60000);
      
      // Set up unload handler to flush metrics before page unload
      window.addEventListener('beforeunload', () => this.flushMetrics(true));
      
      // Try to initialize Supabase client if available
      this.initializeSupabaseClient();
    }
  }
  
  /**
   * Try to initialize Supabase client if available in the global scope
   */
  private initializeSupabaseClient() {
    try {
      // Dynamic import to avoid dependencies in production
      import('@/lib/supabaseClient').then(module => {
        this.supabaseClient = module.supabase;
        console.log('Performance monitoring initialized with Supabase client');
      }).catch(err => {
        console.warn('Could not initialize Supabase client for performance monitoring:', err);
      });
    } catch (err) {
      console.warn('Could not initialize Supabase client for performance monitoring');
    }
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Record a component render
   */
  public recordRender(componentName: string, duration: number): void {
    if (!this.isEnabled) return;
    
    // Update local metrics for immediate feedback
    this.updateLocalMetrics(componentName, duration);
    
    // Queue metric for backend transmission
    this.queueMetricForBackend(componentName, duration);
  }
  
  /**
   * Record a batch of component renders efficiently
   */
  public recordRenderBatch(componentName: string, renders: Array<{time: number, duration: number}>): void {
    if (!this.isEnabled || !renders.length) return;
    
    // Update local metrics
    renders.forEach(render => {
      this.updateLocalMetrics(componentName, render.duration);
      this.queueMetricForBackend(componentName, render.duration, render.time);
    });
  }
  
  /**
   * Queue metric for backend transmission
   */
  private queueMetricForBackend(componentName: string, renderTime: number, timestamp: number = Date.now()): void {
    // Add to queue for batched transmission
    this.metricQueue.push({
      componentName,
      renderTime,
      timestamp
    });
    
    // If queue is getting large, flush immediately
    if (this.metricQueue.length >= 50) {
      this.flushMetrics();
    }
  }
  
  /**
   * Flush metrics to backend
   */
  private async flushMetrics(isUnload: boolean = false): Promise<void> {
    if (!this.isEnabled || this.metricQueue.length === 0) return;
    
    // Create a copy of the current queue and clear it
    const metricsToSend = [...this.metricQueue];
    this.metricQueue = [];
    
    // Prepare device info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
    
    // Prepare the payload
    const payload: BatchedMetrics = {
      metrics: metricsToSend,
      sessionId: this.sessionId,
      deviceInfo
    };
    
    try {
      // Use the Supabase client if available
      if (this.supabaseClient) {
        await this.supabaseClient.functions.invoke('track-performance', {
          body: payload
        });
        console.debug(`Sent ${metricsToSend.length} performance metrics to backend`);
      } else if (!isUnload) {
        // Use fetch for sending metrics if Supabase client is not available
        // Skip this on page unload as fetch may not complete
        fetch('/api/track-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          // Use keepalive for unload events
          keepalive: isUnload
        }).catch(err => {
          console.warn('Error sending performance metrics:', err);
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
      
      // If we failed to send, and it's not during unload, add back to queue
      if (!isUnload) {
        this.metricQueue = [...this.metricQueue, ...metricsToSend];
        
        // Limit queue size to prevent memory issues
        if (this.metricQueue.length > 200) {
          this.metricQueue = this.metricQueue.slice(-200);
        }
      }
    }
  }
  
  // Private method to handle local metric updates
  private updateLocalMetrics(componentName: string, duration: number): void {
    if (!this.isEnabled) return;
    
    if (!this.metrics[componentName]) {
      // Check if we've reached max components
      if (Object.keys(this.metrics).length >= this.maxTrackedComponents) {
        // Remove the least recently updated component
        const oldestComponent = Object.entries(this.metrics)
          .sort(([, a], [, b]) => (a.lastUpdated || 0) - (b.lastUpdated || 0))[0][0];
        delete this.metrics[oldestComponent];
      }
      
      this.metrics[componentName] = {
        componentName,
        renderTimes: [],
        events: [],
        averageRenderTime: 0,
        lastUpdated: Date.now()
      };
    }
    
    // Add render time
    const renderTimes = this.metrics[componentName].renderTimes || [];
    renderTimes.push(duration);
    
    // Only keep last 10 render times (reduced from 20)
    if (renderTimes.length > 10) {
      renderTimes.shift();
    }
    
    // Update average
    const averageRenderTime = 
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    
    // Update metrics
    this.metrics[componentName] = {
      ...this.metrics[componentName],
      renderTimes,
      lastRenderTime: duration,
      averageRenderTime,
      lastUpdated: Date.now()
    };
    
    // Throttled notification of listeners
    this.throttledNotify();
  }
  
  /**
   * Throttle UI updates to reduce performance impact
   */
  private throttledNotify(): void {
    if (!this.isEnabled) return;
    
    const now = Date.now();
    
    // If we already have a pending update, don't schedule another one
    if (this.pendingUpdates) return;
    
    // If we recently notified, schedule a delayed update
    if (now - this.lastNotifyTime < this.notifyThrottle) {
      this.pendingUpdates = true;
      
      setTimeout(() => {
        this.notifyListeners();
        this.pendingUpdates = false;
        this.lastNotifyTime = Date.now();
      }, this.notifyThrottle);
    } else {
      // Otherwise update immediately
      this.notifyListeners();
      this.lastNotifyTime = now;
    }
  }
  
  /**
   * Clean up old metrics to prevent memory issues
   */
  private cleanupOldMetrics(): void {
    if (!this.isEnabled) return;
    
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes (reduced from 10)
    
    // Remove components that haven't been updated in 5 minutes
    Object.keys(this.metrics).forEach(componentName => {
      const lastUpdated = this.metrics[componentName].lastUpdated || 0;
      if (now - lastUpdated > maxAge) {
        delete this.metrics[componentName];
      }
    });
    
    // If we still have too many components, keep only the most recently updated ones
    if (Object.keys(this.metrics).length > this.maxTrackedComponents) {
      const componentsToKeep = Object.entries(this.metrics)
        .sort(([, a], [, b]) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
        .slice(0, this.maxTrackedComponents)
        .map(([componentName]) => componentName);
      
      const newMetrics: Record<string, Partial<PerformanceMetrics>> = {};
      componentsToKeep.forEach(componentName => {
        newMetrics[componentName] = this.metrics[componentName];
      });
      
      this.metrics = newMetrics;
    }
    
    // Notify listeners of the cleanup
    this.throttledNotify();
  }
  
  /**
   * Record a component unmount
   */
  public recordUnmount(componentName: string): void {
    if (!this.isEnabled || !this.metrics[componentName]) return;
    
    // Just update the last update time
    this.metrics[componentName].lastUpdated = Date.now();
  }
  
  /**
   * Get metrics for a specific component
   */
  public getComponentMetrics(componentName: string): Partial<PerformanceMetrics> {
    if (!this.isEnabled) return { componentName };
    return this.metrics[componentName] || { componentName };
  }
  
  /**
   * Get all performance metrics
   */
  public getAllMetrics(): Record<string, Partial<PerformanceMetrics>> {
    if (!this.isEnabled) return {};
    return { ...this.metrics };
  }
  
  /**
   * Subscribe to metrics updates
   */
  public subscribe(callback: (metrics: Record<string, Partial<PerformanceMetrics>>) => void): () => void {
    if (!this.isEnabled) return () => {};
    
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Notify all listeners of metrics updates
   */
  private notifyListeners(): void {
    if (!this.isEnabled || this.listeners.length === 0) return;
    
    const metricsSnapshot = this.getAllMetrics();
    this.listeners.forEach(listener => listener(metricsSnapshot));
  }
  
  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
    this.metricQueue = [];
    if (this.isEnabled) {
      this.notifyListeners();
    }
  }
  
  /**
   * Get metrics formatted for visualization tools
   */
  public getMetrics() {
    if (!this.isEnabled) return {
      componentsCount: 0,
      totalRenderCount: 0,
      totalRenderTime: 0,
      lastUpdated: 0,
      queuedMetrics: 0
    };
    
    const componentsCount = Object.keys(this.metrics).length;
    const totalRenderCount = Object.values(this.metrics).reduce(
      (sum, metric) => sum + (metric.renderTimes?.length || 0), 0
    );
    
    // Calculate total render time
    const totalRenderTime = Object.values(this.metrics).reduce((sum, metric) => {
      const renderCount = metric.renderTimes?.length || 0;
      const avgTime = metric.averageRenderTime || 0;
      return sum + (renderCount * avgTime);
    }, 0);
    
    return {
      componentsCount,
      totalRenderCount,
      totalRenderTime,
      queuedMetrics: this.metricQueue.length,
      lastUpdated: Math.max(
        0,
        ...Object.values(this.metrics)
          .map(m => m.lastUpdated || 0)
          .filter(Boolean)
      )
    };
  }
  
  /**
   * Enable or disable the monitor
   */
  public setEnabled(enabled: boolean): void {
    const wasEnabled = this.isEnabled;
    this.isEnabled = enabled && process.env.NODE_ENV === 'development';
    
    // If disabling, clear all data
    if (wasEnabled && !this.isEnabled) {
      this.clearMetrics();
      
      // Clear the flush interval
      if (this.flushInterval !== null) {
        clearInterval(this.flushInterval);
        this.flushInterval = null;
      }
    } else if (!wasEnabled && this.isEnabled) {
      // If enabling, set up the flush interval
      this.flushInterval = window.setInterval(() => this.flushMetrics(), 30000);
    }
  }
  
  /**
   * Get total render time across all tracked components
   */
  public get totalRenderTime(): number {
    if (!this.isEnabled) return 0;
    
    return Object.values(this.metrics).reduce((sum, metric) => {
      const renderCount = metric.renderTimes?.length || 0;
      const avgTime = metric.averageRenderTime || 0;
      return sum + (renderCount * avgTime);
    }, 0);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// If in production, disable the monitor immediately
if (process.env.NODE_ENV !== 'development') {
  performanceMonitor.setEnabled(false);
}
