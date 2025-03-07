/**
 * Performance monitoring utility
 * Helps track and identify performance bottlenecks in the application
 */

// Interface for tracking render timings
interface RenderTiming {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowestRenderTime: number;
}

// Interface for tracking event timings
interface EventTiming {
  eventName: string;
  occurrences: number;
  totalDuration: number;
  averageDuration: number;
  lastDuration: number;
  longestDuration: number;
}

// Component render timings map
const componentRenderTimings: Map<string, RenderTiming> = new Map();

// Event timings map
const eventTimings: Map<string, EventTiming> = new Map();

// Track event start times
const eventStartTimes: Map<string, number> = new Map();

// Track frames per second
let fpsHistory: number[] = [];
let lastFrameTime = 0;
let frameCount = 0;
let isMonitoring = false;

/**
 * Start tracking component render time
 */
export const startRenderTimer = (componentName: string): () => void => {
  if (!isMonitoring) return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Get or create component timing data
    const existing = componentRenderTimings.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      slowestRenderTime: 0
    };
    
    // Update timing data
    const updated: RenderTiming = {
      ...existing,
      renderCount: existing.renderCount + 1,
      totalRenderTime: existing.totalRenderTime + duration,
      lastRenderTime: duration,
      slowestRenderTime: Math.max(existing.slowestRenderTime, duration)
    };
    
    // Calculate average
    updated.averageRenderTime = updated.totalRenderTime / updated.renderCount;
    
    // Store updated data
    componentRenderTimings.set(componentName, updated);
    
    // Flag potential performance issues
    if (duration > 16 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
};

/**
 * Start tracking an event's duration
 */
export const startEventTimer = (eventName: string): void => {
  if (!isMonitoring) return;
  eventStartTimes.set(eventName, performance.now());
};

/**
 * End tracking an event's duration
 */
export const endEventTimer = (eventName: string): number => {
  if (!isMonitoring) return 0;
  
  const startTime = eventStartTimes.get(eventName);
  if (!startTime) {
    console.warn(`No start time found for event: ${eventName}`);
    return 0;
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Get or create event timing data
  const existing = eventTimings.get(eventName) || {
    eventName,
    occurrences: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
    longestDuration: 0
  };
  
  // Update timing data
  const updated: EventTiming = {
    ...existing,
    occurrences: existing.occurrences + 1,
    totalDuration: existing.totalDuration + duration,
    lastDuration: duration,
    longestDuration: Math.max(existing.longestDuration, duration)
  };
  
  // Calculate average
  updated.averageDuration = updated.totalDuration / updated.occurrences;
  
  // Store updated data
  eventTimings.set(eventName, updated);
  
  // Flag potential performance issues
  if (duration > 100 && process.env.NODE_ENV === 'development') {
    console.warn(`Slow event detected: ${eventName} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

/**
 * Start monitoring FPS
 */
export const startFPSMonitoring = (): void => {
  isMonitoring = true;
  lastFrameTime = performance.now();
  frameCount = 0;
  fpsHistory = [];
  
  const trackFrame = () => {
    if (!isMonitoring) return;
    
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFrameTime;
    
    // Calculate FPS every second
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      fpsHistory.push(fps);
      
      // Keep history at a reasonable size
      if (fpsHistory.length > 60) {
        fpsHistory.shift();
      }
      
      // Log FPS issues in development
      if (process.env.NODE_ENV === 'development' && fps < 30) {
        console.warn(`Low FPS detected: ${fps}`);
      }
      
      frameCount = 0;
      lastFrameTime = now;
    }
    
    requestAnimationFrame(trackFrame);
  };
  
  requestAnimationFrame(trackFrame);
};

/**
 * Stop performance monitoring
 */
export const stopMonitoring = (): void => {
  isMonitoring = false;
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = () => {
  // Calculate average FPS
  const avgFps = fpsHistory.length > 0
    ? fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length
    : 0;
    
  // Get slow components (taking more than 16ms on average)
  const slowComponents = Array.from(componentRenderTimings.values())
    .filter(timing => timing.averageRenderTime > 16)
    .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  
  // Get slow events (taking more than 100ms on average)
  const slowEvents = Array.from(eventTimings.values())
    .filter(timing => timing.averageDuration > 100)
    .sort((a, b) => b.averageDuration - a.averageDuration);
  
  // Components with excessive re-renders
  const excessiveRenders = Array.from(componentRenderTimings.values())
    .filter(timing => timing.renderCount > 30)
    .sort((a, b) => b.renderCount - a.renderCount);
  
  return {
    fps: {
      current: fpsHistory.length > 0 ? fpsHistory[fpsHistory.length - 1] : 0,
      average: avgFps,
      history: fpsHistory
    },
    components: {
      all: Array.from(componentRenderTimings.values()),
      slow: slowComponents,
      excessiveRenders
    },
    events: {
      all: Array.from(eventTimings.values()),
      slow: slowEvents
    }
  };
};

/**
 * Reset all performance metrics
 */
export const resetMetrics = (): void => {
  componentRenderTimings.clear();
  eventTimings.clear();
  eventStartTimes.clear();
  fpsHistory = [];
  frameCount = 0;
  lastFrameTime = performance.now();
};

// Initialize monitoring in development mode automatically
if (process.env.NODE_ENV === 'development') {
  startFPSMonitoring();
}
