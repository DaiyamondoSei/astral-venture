
/**
 * Efficient animation scheduler that prioritizes animations based on visibility and importance
 */
export class AnimationScheduler {
  private static instance: AnimationScheduler;
  private animationFrameId: number | null = null;
  private animations: Map<string, {
    callback: (time: number) => void;
    priority: 'critical' | 'high' | 'medium' | 'low';
    lastExecuted: number;
    interval: number; // ms between executions for throttling
  }> = new Map();
  private isRunning = false;
  private lastFrameTime = 0;

  // Get singleton instance
  public static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }

  // Private constructor to enforce singleton
  private constructor() {}

  /**
   * Register an animation callback with priority and optional throttling
   */
  public register(
    id: string, 
    callback: (time: number) => void, 
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium',
    interval: number = 0 // 0 means run every frame
  ): void {
    this.animations.set(id, {
      callback,
      priority,
      lastExecuted: 0,
      interval
    });

    // Start the animation loop if it's not already running
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Unregister an animation callback
   */
  public unregister(id: string): void {
    this.animations.delete(id);
    
    // Stop the animation loop if there are no more animations
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animationLoop(performance.now());
  }

  /**
   * Stop the animation loop
   */
  private stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop that prioritizes and throttles animations
   */
  private animationLoop = (time: number): void => {
    // Calculate time since last frame
    const deltaTime = time - this.lastFrameTime;
    this.lastFrameTime = time;

    // Process animations by priority
    this.executeAnimationsByPriority('critical', time, deltaTime);
    this.executeAnimationsByPriority('high', time, deltaTime);
    this.executeAnimationsByPriority('medium', time, deltaTime);
    this.executeAnimationsByPriority('low', time, deltaTime);

    // Schedule next frame if still running
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    }
  };

  /**
   * Execute animations of a specific priority
   */
  private executeAnimationsByPriority(
    priority: 'critical' | 'high' | 'medium' | 'low', 
    time: number,
    deltaTime: number
  ): void {
    for (const [id, animation] of this.animations.entries()) {
      if (animation.priority !== priority) continue;
      
      // Check if the animation should be throttled
      if (animation.interval > 0) {
        if (time - animation.lastExecuted < animation.interval) {
          continue; // Skip this animation due to throttling
        }
      }
      
      try {
        animation.callback(time);
        animation.lastExecuted = time;
      } catch (error) {
        console.error(`Error in animation ${id}:`, error);
      }
    }
  }
}

// Create a simplified export for ease of use
export const animationScheduler = AnimationScheduler.getInstance();
