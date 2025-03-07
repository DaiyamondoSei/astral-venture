
/**
 * Types for animation benchmark results
 */
export interface FrameInfo {
  timestamp: number;
  duration: number;
}

export interface BenchmarkResult {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  jank: number; // Represents % of frames that took too long
  frames: FrameInfo[];
  totalDuration: number;
  gpuMemory?: number;
  cpuUsage?: number;
}

/**
 * Benchmark animation performance
 * @param animationFn Function to animate
 * @param durationMs How long to run the benchmark (ms)
 * @returns Benchmark results
 */
export function benchmarkAnimation(
  animationFn: (timestamp: number) => void | boolean,
  durationMs: number = 3000
): Promise<BenchmarkResult> {
  return new Promise((resolve) => {
    let startTime: number | null = null;
    let frames: FrameInfo[] = [];
    let lastFrameTime: number | null = null;
    
    // Frame callback for requestAnimationFrame
    const frameCallback = (timestamp: number) => {
      // Initialize on first frame
      if (startTime === null) {
        startTime = timestamp;
        lastFrameTime = timestamp;
        requestAnimationFrame(frameCallback);
        return;
      }
      
      // Calculate frame duration
      const frameDuration = timestamp - (lastFrameTime || timestamp);
      lastFrameTime = timestamp;
      
      // Record frame info
      frames.push({
        timestamp: timestamp - startTime,
        duration: frameDuration
      });
      
      // Run the animation function
      const shouldStop = animationFn(timestamp);
      
      // Check if we should continue
      if (shouldStop === true || timestamp - startTime >= durationMs) {
        // Calculate benchmark results
        const result = calculateResults(frames, timestamp - startTime);
        resolve(result);
        return;
      }
      
      // Continue the animation loop
      requestAnimationFrame(frameCallback);
    };
    
    // Start the animation loop
    requestAnimationFrame(frameCallback);
  });
}

/**
 * Calculate results from frame data
 */
function calculateResults(frames: FrameInfo[], totalDuration: number): BenchmarkResult {
  // Skip first few frames as they may be outliers
  const usableFrames = frames.slice(Math.min(3, frames.length));
  
  // If we don't have enough frames, return default values
  if (usableFrames.length < 2) {
    return {
      averageFPS: 0,
      minFPS: 0,
      maxFPS: 0,
      jank: 0,
      frames: [],
      totalDuration
    };
  }
  
  // Calculate frame durations
  const durations = usableFrames.map(f => f.duration);
  
  // Calculate FPS values
  const fpsValues = durations.map(d => 1000 / d);
  
  // Calculate statistics
  const averageFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
  const minFPS = Math.min(...fpsValues);
  const maxFPS = Math.max(...fpsValues);
  
  // Jank detection (frames that take more than 150% of the target frame time)
  const targetFrameTime = 1000 / 60; // 16.67ms for 60fps
  const jankFrames = durations.filter(d => d > targetFrameTime * 1.5);
  const jank = (jankFrames.length / durations.length) * 100;
  
  // Try to get GPU/CPU metrics if available
  let gpuMemory: number | undefined;
  let cpuUsage: number | undefined;
  
  try {
    // @ts-ignore - experimental API
    if (window.performance && (window.performance as any).memory) {
      // @ts-ignore
      gpuMemory = (window.performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    
    // Future-proofing for when browser CPU usage might be available
  } catch (e) {
    // Ignore errors with experimental APIs
  }
  
  return {
    averageFPS,
    minFPS,
    maxFPS,
    jank,
    frames: usableFrames,
    totalDuration,
    gpuMemory,
    cpuUsage
  };
}

/**
 * Log benchmark results to console in a readable format
 */
export function logBenchmarkResults(name: string, results: BenchmarkResult): void {
  console.group(`Animation Benchmark: ${name}`);
  console.log(`Average FPS: ${results.averageFPS.toFixed(2)}`);
  console.log(`FPS Range: ${results.minFPS.toFixed(1)} - ${results.maxFPS.toFixed(1)}`);
  console.log(`Jank: ${results.jank.toFixed(2)}%`);
  console.log(`Duration: ${results.totalDuration.toFixed(0)}ms`);
  
  if (results.gpuMemory) {
    console.log(`GPU Memory: ${results.gpuMemory.toFixed(2)} MB`);
  }
  
  if (results.cpuUsage) {
    console.log(`CPU Usage: ${results.cpuUsage.toFixed(2)}%`);
  }
  
  console.log(`Frames: ${results.frames.length}`);
  console.groupEnd();
}
