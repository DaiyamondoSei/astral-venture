
/**
 * Animation Scheduler
 * 
 * Optimizes animation frame requests by batching and prioritizing animations
 * to improve performance and reduce CPU/GPU load.
 */

type AnimationCallback = (time: number) => void;
type AnimationPriority = 'high' | 'medium' | 'low';

interface AnimationEntry {
  id: string;
  callback: AnimationCallback;
  priority: AnimationPriority;
  lastRun: number;
  interval: number; // 0 means run every frame
  isActive: boolean;
}

/**
 * Animation Scheduler class
 * Manages multiple animation callbacks with different priorities
 * and optimizes frame requests for better performance
 */
class AnimationScheduler {
  private static instance: AnimationScheduler;
  private animations: Map<string, AnimationEntry> = new Map();
  private isRunning: boolean = false;
  private frameId: number | null = null;
  private priorityIntervals: Record<AnimationPriority, number> = {
    high: 0,    // Run every frame
    medium: 2,  // Run every 2-3 frames at 60fps
    low: 5      // Run every 5-6 frames at 60fps
  };
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private frameDeltaHistory: number[] = [];
  private adaptivePriorities: boolean = true;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }

  /**
   * Register an animation callback
   * 
   * @param id Unique identifier for this animation
   * @param callback Function to call on animation frames
   * @param priority Priority level for this animation
   * @param interval Optional interval in ms (0 means every frame)
   * @returns The animation ID
   */
  public register(
    id: string, 
    callback: AnimationCallback, 
    priority: AnimationPriority = 'medium',
    interval: number = 0
  ): string {
    this.animations.set(id, {
      id,
      callback,
      priority,
      lastRun: 0,
      interval,
      isActive: true
    });
    
    // Start the animation loop if it's not running
    if (!this.isRunning) {
      this.start();
    }
    
    return id;
  }

  /**
   * Unregister an animation callback
   * 
   * @param id The animation ID to remove
   */
  public unregister(id: string): void {
    this.animations.delete(id);
    
    // Stop the animation loop if there are no animations left
    if (this.animations.size === 0 && this.isRunning) {
      this.stop();
    }
  }

  /**
   * Pause a specific animation
   * 
   * @param id The animation ID to pause
   */
  public pause(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isActive = false;
      this.animations.set(id, animation);
    }
  }

  /**
   * Resume a specific animation
   * 
   * @param id The animation ID to resume
   */
  public resume(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isActive = true;
      animation.lastRun = 0; // Reset to ensure it runs next frame
      this.animations.set(id, animation);
    }
  }

  /**
   * Update the priority for an animation
   * 
   * @param id The animation ID
   * @param priority The new priority
   */
  public updatePriority(id: string, priority: AnimationPriority): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.priority = priority;
      this.animations.set(id, animation);
    }
  }

  /**
   * Enable or disable adaptive priority adjustments
   * 
   * @param enabled Whether to enable adaptive priorities
   */
  public setAdaptivePriorities(enabled: boolean): void {
    this.adaptivePriorities = enabled;
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.frameDeltaHistory = [];
    
    // Start the animation frame loop
    this.tick(performance.now());
  }

  /**
   * Stop the animation loop
   */
  private stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * The main animation tick function
   * 
   * @param time Current timestamp
   */
  private tick(time: number): void {
    this.frameId = requestAnimationFrame(this.tick.bind(this));
    
    // Calculate delta time and update frame count
    this.frameCount++;
    const delta = this.lastFrameTime ? time - this.lastFrameTime : 16.67;
    this.lastFrameTime = time;
    
    // Update frame delta history for adaptive scheduling
    this.frameDeltaHistory.push(delta);
    if (this.frameDeltaHistory.length > 60) {
      this.frameDeltaHistory.shift();
    }
    
    // Adjust priority intervals based on frame rate if adaptive
    if (this.adaptivePriorities && this.frameCount % 60 === 0) {
      this.adjustPriorityIntervals();
    }
    
    // Process animations based on priority and interval
    for (const [id, animation] of this.animations.entries()) {
      if (!animation.isActive) continue;
      
      const shouldRunByInterval = animation.interval === 0 || 
        (time - animation.lastRun >= animation.interval);
      
      const shouldRunByPriority = this.shouldRunAnimationByPriority(
        animation.priority, 
        this.frameCount
      );
      
      if (shouldRunByInterval && shouldRunByPriority) {
        try {
          animation.callback(time);
          animation.lastRun = time;
        } catch (error) {
          console.error(`Error in animation ${id}:`, error);
        }
      }
    }
  }

  /**
   * Determine if an animation should run based on its priority
   * 
   * @param priority The animation priority
   * @param frameCount The current frame count
   * @returns Whether the animation should run this frame
   */
  private shouldRunAnimationByPriority(
    priority: AnimationPriority, 
    frameCount: number
  ): boolean {
    const interval = this.priorityIntervals[priority];
    
    // Always run high priority animations
    if (priority === 'high') return true;
    
    // Run medium priority animations every few frames
    if (priority === 'medium') {
      return frameCount % (interval + 1) === 0;
    }
    
    // Run low priority animations even less frequently
    if (priority === 'low') {
      return frameCount % (interval + 1) === 0;
    }
    
    return true;
  }

  /**
   * Adjust priority intervals based on performance
   */
  private adjustPriorityIntervals(): void {
    // Calculate average frame time
    const avgFrameTime = this.frameDeltaHistory.reduce((sum, time) => sum + time, 0) / 
      this.frameDeltaHistory.length;
    
    // Target for 60fps is ~16.67ms per frame
    // If frame time is higher, increase intervals to reduce work
    if (avgFrameTime > 20) { // Significantly below 60fps
      this.priorityIntervals.medium = Math.min(4, this.priorityIntervals.medium + 1);
      this.priorityIntervals.low = Math.min(10, this.priorityIntervals.low + 2);
    } 
    // If frame time is good, gradually decrease intervals for smoother animation
    else if (avgFrameTime < 16.67 && this.frameCount > 300) { // After initial settling
      this.priorityIntervals.medium = Math.max(1, this.priorityIntervals.medium - 1);
      this.priorityIntervals.low = Math.max(3, this.priorityIntervals.low - 1);
    }
  }

  /**
   * Get the current scheduler statistics
   */
  public getStats(): {
    animationCount: number,
    averageFrameTime: number,
    estimatedFps: number,
    priorityLevels: Record<AnimationPriority, number>
  } {
    const avgFrameTime = this.frameDeltaHistory.length > 0 
      ? this.frameDeltaHistory.reduce((sum, time) => sum + time, 0) / this.frameDeltaHistory.length
      : 0;
      
    const highPriorityCount = Array.from(this.animations.values())
      .filter(a => a.isActive && a.priority === 'high').length;
      
    const mediumPriorityCount = Array.from(this.animations.values())
      .filter(a => a.isActive && a.priority === 'medium').length;
      
    const lowPriorityCount = Array.from(this.animations.values())
      .filter(a => a.isActive && a.priority === 'low').length;
    
    return {
      animationCount: this.animations.size,
      averageFrameTime: avgFrameTime,
      estimatedFps: avgFrameTime > 0 ? Math.min(60, Math.round(1000 / avgFrameTime)) : 60,
      priorityLevels: {
        high: highPriorityCount,
        medium: mediumPriorityCount,
        low: lowPriorityCount
      }
    };
  }
}

// Export singleton instance
export const animationScheduler = AnimationScheduler.getInstance();
export default animationScheduler;
