/**
 * Animation Scheduler
 * Centralizes and optimizes all animations across the application
 * to prevent excessive redraws and improve performance
 */

type Priority = 'high' | 'medium' | 'low';
type AnimationCallback = (time: number) => void;

interface AnimationTask {
  id: string;
  callback: AnimationCallback;
  priority: Priority;
  interval: number; // 0 means every frame, otherwise in ms
  lastRun: number;
  active: boolean;
}

class AnimationScheduler {
  private tasks: Map<string, AnimationTask> = new Map();
  private frameId: number | null = null;
  private frameTimes: number[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lowPriorityFrameSkip: number = 0;
  private mediumPriorityFrameSkip: number = 0;
  private lastTime: number = 0;
  private fps: number = 60;
  private loadFactor: number = 0;
  
  constructor() {
    // Start the animation loop
    this.start();
    
    // Adjust scheduling based on visibility
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.pause();
        } else {
          this.resume();
        }
      });
    }
    
    // Monitor for janky frames and adjust accordingly
    this.monitorPerformance();
  }
  
  /**
   * Register an animation task with the scheduler
   */
  public register(
    id: string, 
    callback: AnimationCallback, 
    priority: Priority = 'medium',
    interval: number = 0
  ): void {
    this.tasks.set(id, {
      id,
      callback,
      priority,
      interval,
      lastRun: 0,
      active: true
    });
    
    if (!this.isRunning && this.tasks.size > 0) {
      this.start();
    }
  }
  
  /**
   * Unregister an animation task from the scheduler
   */
  public unregister(id: string): void {
    this.tasks.delete(id);
    
    if (this.isRunning && this.tasks.size === 0) {
      this.stop();
    }
  }
  
  /**
   * Pause a specific animation task
   */
  public pauseTask(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.active = false;
    }
  }
  
  /**
   * Resume a specific animation task
   */
  public resumeTask(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.active = true;
      task.lastRun = performance.now();
    }
  }
  
  /**
   * Start the animation scheduler
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }
  
  /**
   * Stop the animation scheduler
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
  
  /**
   * Pause all animations
   */
  public pause(): void {
    this.isPaused = true;
  }
  
  /**
   * Resume all animations
   */
  public resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }
  
  /**
   * The main animation loop
   */
  private animate = (time: number): void => {
    this.frameId = requestAnimationFrame(this.animate);
    
    // Don't run if paused
    if (this.isPaused) return;
    
    // Calculate time delta
    const delta = time - this.lastTime;
    this.lastTime = time;
    
    // Update FPS tracking
    this.updateFps(delta);
    
    // Update frame skipping based on current FPS
    this.updateFrameSkipping();
    
    // Track start time for load factor calculation
    const frameStartTime = performance.now();
    
    // Process all tasks
    let highPriorityTasksRun = 0;
    let mediumPriorityTasksRun = 0;
    let lowPriorityTasksRun = 0;
    
    for (const task of this.tasks.values()) {
      if (!task.active) continue;
      
      // Skip frames for lower priority tasks based on current performance
      if (task.priority === 'low' && this.lowPriorityFrameSkip > 0) {
        this.lowPriorityFrameSkip--;
        continue;
      }
      
      if (task.priority === 'medium' && this.mediumPriorityFrameSkip > 0) {
        this.mediumPriorityFrameSkip--;
        continue;
      }
      
      // Handle interval-based tasks
      if (task.interval > 0) {
        if (time - task.lastRun >= task.interval) {
          task.callback(time);
          task.lastRun = time;
          
          // Count tasks run
          if (task.priority === 'high') highPriorityTasksRun++;
          else if (task.priority === 'medium') mediumPriorityTasksRun++;
          else lowPriorityTasksRun++;
        }
      } else {
        // Run every-frame tasks
        task.callback(time);
        task.lastRun = time;
        
        // Count tasks run
        if (task.priority === 'high') highPriorityTasksRun++;
        else if (task.priority === 'medium') mediumPriorityTasksRun++;
        else lowPriorityTasksRun++;
      }
    }
    
    // Calculate load factor (processing time / frame time)
    const processingTime = performance.now() - frameStartTime;
    const targetFrameTime = 1000 / 60; // 16.67ms for 60fps
    this.loadFactor = processingTime / targetFrameTime;
    
    // Log detailed performance metrics in development
    if (process.env.NODE_ENV === 'development' && time % 3000 < 16.67) {
      console.debug('Animation Scheduler Metrics:', {
        fps: Math.round(this.fps),
        loadFactor: this.loadFactor.toFixed(2),
        tasks: this.tasks.size,
        tasksRun: {
          high: highPriorityTasksRun,
          medium: mediumPriorityTasksRun,
          low: lowPriorityTasksRun
        },
        frameSkipping: {
          medium: this.mediumPriorityFrameSkip > 0,
          low: this.lowPriorityFrameSkip > 0
        }
      });
    }
  };
  
  /**
   * Update FPS calculation based on recent frames
   */
  private updateFps(deltaTime: number): void {
    // Keep last 60 frame times for averaging
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    // Calculate average FPS from frame times
    if (this.frameTimes.length > 0) {
      const averageDelta = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
      this.fps = 1000 / averageDelta;
    }
  }
  
  /**
   * Update frame skipping settings based on current performance
   */
  private updateFrameSkipping(): void {
    // If frames are dropping (low FPS) or high load factor, increase frame skipping
    if (this.fps < 30 || this.loadFactor > 0.8) {
      this.lowPriorityFrameSkip = 3; // Skip 3 frames for low priority tasks
      this.mediumPriorityFrameSkip = 1; // Skip 1 frame for medium priority tasks
    } 
    // If frames are moderately dropping
    else if (this.fps < 45 || this.loadFactor > 0.5) {
      this.lowPriorityFrameSkip = 2; // Skip 2 frames for low priority
      this.mediumPriorityFrameSkip = 0; // Don't skip medium priority
    }
    // Performance is good
    else {
      this.lowPriorityFrameSkip = 0;
      this.mediumPriorityFrameSkip = 0;
    }
  }
  
  /**
   * Monitor overall animation performance
   */
  private monitorPerformance(): void {
    if (typeof window === 'undefined') return;
    
    // Set up a slow interval to avoid performance impact
    setInterval(() => {
      // If we're consistently below 30fps or high load factor, reduce animations
      if ((this.fps < 30 && this.loadFactor > 0.9) || this.loadFactor > 1.2) {
        this.throttleAllAnimations();
      }
    }, 5000);
  }
  
  /**
   * Throttle all animations when performance is poor
   */
  private throttleAllAnimations(): void {
    // Increase intervals for all non-critical animations
    for (const task of this.tasks.values()) {
      if (task.priority !== 'high') {
        // Double the interval of non-high priority tasks
        if (task.interval > 0) {
          task.interval = Math.min(task.interval * 2, 500); // Cap at 500ms
        } else {
          task.interval = 32; // ~30fps
        }
      }
    }
    
    console.warn('Performance issues detected - throttling animations');
  }
  
  /**
   * Get current performance metrics
   */
  public getMetrics() {
    return {
      fps: this.fps,
      loadFactor: this.loadFactor,
      taskCount: this.tasks.size,
      isThrottled: this.lowPriorityFrameSkip > 0
    };
  }
}

// Create a singleton instance
export const animationScheduler = new AnimationScheduler();

// Export a convenience function for one-off animations
export function animateTimed(
  callback: (progress: number, elapsed: number) => void,
  duration: number = 1000,
  easing: (t: number) => number = t => t
): { cancel: () => void } {
  const id = `timed-${Math.random().toString(36).substring(2, 9)}`;
  const startTime = performance.now();
  let isCancelled = false;
  
  animationScheduler.register(id, (time) => {
    const elapsed = time - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const progress = easing(rawProgress);
    
    callback(progress, elapsed);
    
    if (rawProgress >= 1 || isCancelled) {
      animationScheduler.unregister(id);
    }
  }, 'medium');
  
  return {
    cancel: () => {
      isCancelled = true;
      animationScheduler.unregister(id);
    }
  };
}
