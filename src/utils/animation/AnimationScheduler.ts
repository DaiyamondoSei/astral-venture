
/**
 * Enhanced Animation Scheduler with dynamic frame skipping, 
 * priority-based execution, and performance monitoring
 */

import { getPerformanceCategory, DeviceCapability } from '../performanceUtils';

// Type for animation callback
type AnimationCallback = (time: number) => void;
export type AnimationPriority = 'high' | 'medium' | 'low';

interface AnimationTask {
  callback: AnimationCallback;
  priority: AnimationPriority;
  interval: number;  // 0 means every frame, > 0 means milliseconds between calls
  lastExecuted: number;
}

class AnimationScheduler {
  private static instance: AnimationScheduler;
  private tasks: Map<string, AnimationTask> = new Map();
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private isMonitoring: boolean = false;
  private deviceCapability: DeviceCapability;
  
  // Frame skip configuration based on priority and device capability
  private frameSkipConfig: Record<DeviceCapability, Record<AnimationPriority, number>> = {
    low: {
      low: 5,      // 1/6 frames (10fps at 60fps base)
      medium: 3,   // 1/4 frames (15fps at 60fps base)
      high: 1      // 1/2 frames (30fps at 60fps base)
    },
    medium: {
      low: 3,      // 1/4 frames (15fps at 60fps base) 
      medium: 1,   // 1/2 frames (30fps at 60fps base)
      high: 0      // Every frame (60fps)
    },
    high: {
      low: 1,      // 1/2 frames (30fps at 60fps base)
      medium: 0,   // Every frame (60fps)
      high: 0      // Every frame (60fps)
    }
  };
  
  // Private constructor for singleton pattern
  private constructor() {
    this.deviceCapability = getPerformanceCategory();
    
    // Setup performance monitoring if in development
    if (process.env.NODE_ENV === 'development') {
      this.startMonitoring();
    }
  }
  
  // Get the single instance
  public static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }
  
  /**
   * Register an animation task
   * @param id Unique identifier for the task
   * @param callback Function to be called on animation frames
   * @param priority Priority level for the task
   * @param interval Optional interval in ms (0 means every eligible frame)
   */
  public register(
    id: string, 
    callback: AnimationCallback, 
    priority: AnimationPriority = 'medium',
    interval: number = 0
  ): void {
    this.tasks.set(id, {
      callback,
      priority,
      interval,
      lastExecuted: 0
    });
    
    // Start animation loop if not already running
    if (this.rafId === null) {
      this.startAnimationLoop();
    }
  }
  
  /**
   * Unregister an animation task
   * @param id The task identifier to remove
   */
  public unregister(id: string): void {
    this.tasks.delete(id);
    
    // Stop animation loop if no more tasks
    if (this.tasks.size === 0 && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    const animate = (time: number) => {
      // Calculate delta and FPS
      const delta = this.lastFrameTime ? time - this.lastFrameTime : 16.67;
      this.lastFrameTime = time;
      
      // Update FPS tracking
      this.frameCount++;
      if (this.isMonitoring && time % 1000 < 20) {
        const fps = Math.round(1000 / delta);
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 10) {
          this.fpsHistory.shift();
        }
        
        // Log FPS every second in development
        if (this.frameCount % 60 === 0 && process.env.NODE_ENV === 'development') {
          const avgFps = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
          console.log(`Current FPS: ${avgFps.toFixed(1)}`);
          
          // Adjust device capability if performance is consistently poor
          if (avgFps < 30 && this.deviceCapability !== 'low') {
            console.warn('Performance issues detected, downgrading device capability');
            this.deviceCapability = avgFps < 20 ? 'low' : 'medium';
          }
        }
      }
      
      // Process animation tasks
      this.tasks.forEach((task, id) => {
        // Check if this task should run based on frame skipping and interval
        const skipFrames = this.frameSkipConfig[this.deviceCapability][task.priority];
        const shouldRunByFrameSkip = this.frameCount % (skipFrames + 1) === 0;
        
        // Check if enough time has passed since last execution (for interval-based tasks)
        const shouldRunByInterval = task.interval === 0 || 
          (time - task.lastExecuted >= task.interval);
        
        if (shouldRunByFrameSkip && shouldRunByInterval) {
          try {
            task.callback(time);
            task.lastExecuted = time;
          } catch (error) {
            console.error(`Error in animation task ${id}:`, error);
            // Remove problematic task to prevent further errors
            this.tasks.delete(id);
          }
        }
      });
      
      // Continue animation loop if we have tasks
      if (this.tasks.size > 0) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.rafId = null;
      }
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.fpsHistory = [];
  }
  
  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  /**
   * Get current FPS statistics
   */
  public getFpsStats(): { current: number, average: number } {
    if (this.fpsHistory.length === 0) {
      return { current: 60, average: 60 };
    }
    
    const current = this.fpsHistory[this.fpsHistory.length - 1];
    const average = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    return { current, average };
  }
  
  /**
   * Update device capability (used when manually changing performance mode)
   */
  public updateDeviceCapability(capability: DeviceCapability): void {
    this.deviceCapability = capability;
  }
}

// Export singleton instance
export const animationScheduler = AnimationScheduler.getInstance();
