/**
 * Utility functions for performance optimization
 */

// Device capability categories
export type DeviceCapability = 'low' | 'medium' | 'high';

// Animation frame scheduling priority
export type AnimationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Detects device capabilities based on navigator and hardware concurrency
 */
export function detectDeviceCapabilities(): DeviceCapability {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'medium'; // Default for SSR
  }

  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check memory and CPU capabilities
  const memoryLimit = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
  const cpuCores = navigator.hardwareConcurrency || 4; // Default to 4 cores if not available

  if (isMobile && (memoryLimit <= 2 || cpuCores <= 4)) {
    return 'low';
  } else if ((isMobile && memoryLimit >= 4) || (!isMobile && cpuCores >= 4)) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Evaluates and returns device performance category
 */
export function getPerformanceCategory(): DeviceCapability {
  // Cache the result to avoid recalculating
  if (typeof window !== 'undefined' && !(window as any).__deviceCapability) {
    (window as any).__deviceCapability = detectDeviceCapabilities();
    
    // Log performance category for debugging
    console.log(`Device Performance Category: ${(window as any).__deviceCapability}`);
  }
  
  return typeof window !== 'undefined' 
    ? (window as any).__deviceCapability || 'medium' 
    : 'medium';
}

/**
 * Calculates optimal element count based on device capabilities
 * @param baseCount Base count for medium devices
 * @param category Device capability category (optional)
 * @returns Adjusted count based on device capability
 */
export function getOptimalElementCount(
  baseCount: number,
  category?: DeviceCapability
): number {
  const deviceCategory = category || getPerformanceCategory();
  
  switch (deviceCategory) {
    case 'low':
      return Math.max(1, Math.ceil(baseCount * 0.5));
    case 'high':
      return Math.ceil(baseCount * 1.5);
    case 'medium':
    default:
      return baseCount;
  }
}

/**
 * Adjusts animation complexity based on device capabilities
 * @param baseComplexity The standard complexity value for animations
 * @returns Adjusted complexity value
 */
export function getOptimalAnimationComplexity(baseComplexity: number): number {
  const deviceCategory = getPerformanceCategory();
  
  switch (deviceCategory) {
    case 'low':
      return Math.max(1, Math.ceil(baseComplexity * 0.4));
    case 'high':
      return Math.ceil(baseComplexity * 1.2);
    case 'medium':
    default:
      return baseComplexity;
  }
}

/**
 * Shared animation frame manager to prevent duplicate animation frames
 */
class AnimationFrameManager {
  private static instance: AnimationFrameManager;
  private animationCallbacks: Map<string, { 
    callback: (time: number) => void, 
    priority: AnimationPriority 
  }> = new Map();
  private frameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameSkipCount: number = 0;

  // Singleton pattern
  public static getInstance(): AnimationFrameManager {
    if (!AnimationFrameManager.instance) {
      AnimationFrameManager.instance = new AnimationFrameManager();
    }
    return AnimationFrameManager.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Register an animation callback
   * @param id Unique identifier for the callback
   * @param callback Animation callback function
   * @param priority Animation priority (determines frame skipping)
   */
  public registerAnimation(
    id: string,
    callback: (time: number) => void,
    priority: AnimationPriority = 'medium'
  ): void {
    this.animationCallbacks.set(id, { callback, priority });
    
    // Start animation loop if not already running
    if (this.frameId === null) {
      this.startAnimationLoop();
    }
  }

  /**
   * Unregister an animation callback
   * @param id Unique identifier for the callback
   */
  public unregisterAnimation(id: string): void {
    this.animationCallbacks.delete(id);
    
    // Stop animation loop if no more callbacks
    if (this.animationCallbacks.size === 0 && this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private startAnimationLoop(): void {
    const animate = (time: number) => {
      // Calculate delta time
      const delta = this.lastFrameTime ? time - this.lastFrameTime : 16.67;
      this.lastFrameTime = time;

      // Get device performance category
      const performanceCategory = getPerformanceCategory();

      // Increment frame skip counter
      this.frameSkipCount++;
      
      // Run callbacks based on priority and frame skipping
      this.animationCallbacks.forEach(({ callback, priority }, id) => {
        // Determine if we should run this callback on this frame
        let shouldRunCallback = true;
        
        if (performanceCategory === 'low') {
          // Low-performance devices: Only run critical on every frame
          if (priority === 'low') {
            shouldRunCallback = this.frameSkipCount % 6 === 0;
          } else if (priority === 'medium') {
            shouldRunCallback = this.frameSkipCount % 4 === 0;
          } else if (priority === 'high') {
            shouldRunCallback = this.frameSkipCount % 2 === 0;
          }
        } else if (performanceCategory === 'medium') {
          // Medium-performance devices: Skip some low and medium priority frames
          if (priority === 'low') {
            shouldRunCallback = this.frameSkipCount % 3 === 0;
          } else if (priority === 'medium') {
            shouldRunCallback = this.frameSkipCount % 2 === 0;
          }
        }
        
        // Run callback if conditions met
        if (shouldRunCallback) {
          try {
            callback(time);
          } catch (error) {
            console.error(`Error in animation callback ${id}:`, error);
            // Remove problematic callback to prevent further errors
            this.animationCallbacks.delete(id);
          }
        }
      });
      
      // Reset frame skip counter after 60 frames
      if (this.frameSkipCount >= 60) {
        this.frameSkipCount = 0;
      }
      
      // Continue animation loop if we have callbacks
      if (this.animationCallbacks.size > 0) {
        this.frameId = requestAnimationFrame(animate);
      } else {
        this.frameId = null;
      }
    };
    
    this.frameId = requestAnimationFrame(animate);
  }
}

// Export the animation frame manager
export const animationFrameManager = AnimationFrameManager.getInstance();

/**
 * Creates a throttled function that limits how often a function can be called
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func(...args);
    }
  };
}

/**
 * Should feature be enabled based on device capabilities
 * @param feature The feature to check
 * @returns Boolean indicating if feature should be enabled
 */
export function shouldEnableFeature(
  feature: 'particles' | 'animations' | 'filters' | 'shadows' | 'blurs' | 'gradients'
): boolean {
  const deviceCategory = getPerformanceCategory();
  
  switch (feature) {
    case 'particles':
      return deviceCategory !== 'low';
    case 'animations':
      return true; // All devices support basic animations
    case 'filters':
      return deviceCategory !== 'low';
    case 'shadows':
      return deviceCategory !== 'low';
    case 'blurs':
      return deviceCategory !== 'low';
    case 'gradients':
      return true; // All devices support basic gradients
    default:
      return true;
  }
}

/**
 * A simple performance monitoring function to detect frame drops
 * @returns A cleanup function
 */
export function monitorPerformance(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  let frameCount = 0;
  let lastTime = performance.now();
  let frameTimes: number[] = [];
  const intervalId = setInterval(() => {
    const now = performance.now();
    const elapsed = now - lastTime;
    const fps = frameCount / (elapsed / 1000);
    
    // Keep last 10 FPS readings
    frameTimes.push(fps);
    if (frameTimes.length > 10) {
      frameTimes.shift();
    }
    
    // Average FPS over the last 10 readings
    const avgFps = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    
    // Log warning if FPS is low
    if (avgFps < 30) {
      console.warn(`Low FPS detected: ${avgFps.toFixed(1)} FPS`);
    }
    
    // Reset counters
    frameCount = 0;
    lastTime = now;
  }, 1000);
  
  // Count frames
  const countFrame = () => {
    frameCount++;
    requestAnimationFrame(countFrame);
  };
  
  // Start counting frames
  const frameId = requestAnimationFrame(countFrame);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    cancelAnimationFrame(frameId);
  };
}
