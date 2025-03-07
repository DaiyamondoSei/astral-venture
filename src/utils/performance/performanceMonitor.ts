/**
 * Performance monitoring utilities for tracking and optimizing application performance
 */

// Performance thresholds for different metrics
const THRESHOLDS = {
  FPS: {
    LOW: 30,
    MEDIUM: 45,
    HIGH: 55
  },
  MEMORY: {
    LOW: 50 * 1024 * 1024, // 50MB
    MEDIUM: 150 * 1024 * 1024, // 150MB
    HIGH: 300 * 1024 * 1024 // 300MB
  },
  LOAD_TIME: {
    FAST: 1000, // 1s
    MEDIUM: 2500, // 2.5s
    SLOW: 5000 // 5s
  },
  INTERACTION: {
    FAST: 100, // 100ms
    MEDIUM: 300, // 300ms
    SLOW: 500 // 500ms
  }
};

// Store for performance metrics
const performanceStore = {
  fps: {
    current: 60,
    average: 60,
    samples: [] as number[],
    lowFpsEvents: 0
  },
  memory: {
    current: 0,
    peak: 0,
    snapshots: [] as number[]
  },
  loadTime: {
    navigationStart: 0,
    firstContentfulPaint: 0,
    domInteractive: 0,
    domComplete: 0
  },
  interactions: {
    events: [] as InteractionEvent[],
    longEvents: 0
  },
  errors: {
    count: 0,
    messages: [] as string[]
  }
};

// Interface for interaction events
interface InteractionEvent {
  type: string;
  timestamp: number;
  duration: number;
  target?: string;
}

/**
 * Initializes the performance monitoring system
 */
export function initPerformanceMonitoring(options: {
  enableFpsMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableInteractionMonitoring?: boolean;
  enableLoadTimeMonitoring?: boolean;
  reportingInterval?: number;
} = {}) {
  const {
    enableFpsMonitoring = true,
    enableMemoryMonitoring = true,
    enableInteractionMonitoring = true,
    enableLoadTimeMonitoring = true,
    reportingInterval = 10000 // 10s
  } = options;
  
  // Track navigation timing metrics
  if (enableLoadTimeMonitoring && performance && performance.timing) {
    trackLoadTimeMetrics();
  }
  
  // Start FPS monitoring
  if (enableFpsMonitoring) {
    startFpsMonitoring();
  }
  
  // Start memory monitoring if available
  if (enableMemoryMonitoring && (performance as any).memory) {
    startMemoryMonitoring();
  }
  
  // Track interaction events
  if (enableInteractionMonitoring) {
    startInteractionMonitoring();
  }
  
  // Periodically report performance metrics
  setInterval(() => {
    reportPerformanceMetrics();
  }, reportingInterval);
  
  // Log initial setup
  console.log('Performance monitoring initialized', options);
}

/**
 * Tracks page load time metrics
 */
function trackLoadTimeMetrics() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (performance.timing) {
        const timing = performance.timing;
        
        performanceStore.loadTime = {
          navigationStart: timing.navigationStart,
          firstContentfulPaint: 0, // Needs PerformanceObserver
          domInteractive: timing.domInteractive - timing.navigationStart,
          domComplete: timing.domComplete - timing.navigationStart
        };
        
        // Get First Contentful Paint if available
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          performanceStore.loadTime.firstContentfulPaint = fcpEntry.startTime;
        }
        
        // Log load time metrics
        console.log('Load time metrics:', performanceStore.loadTime);
        
        // Check if load time is concerning
        if (performanceStore.loadTime.domComplete > THRESHOLDS.LOAD_TIME.SLOW) {
          console.warn(`Slow page load: ${performanceStore.loadTime.domComplete}ms`);
        }
      }
    }, 0);
  });
}

/**
 * Starts monitoring frames per second (FPS)
 */
function startFpsMonitoring() {
  let lastTime = performance.now();
  let frames = 0;
  const sampleSize = 60; // Number of samples to keep for average
  
  function measureFps(timestamp: number) {
    frames++;
    
    const elapsed = timestamp - lastTime;
    
    // Calculate FPS approximately every second
    if (elapsed >= 1000) {
      const currentFps = Math.round((frames * 1000) / elapsed);
      
      // Store current FPS
      performanceStore.fps.current = currentFps;
      
      // Add to samples for calculating average
      performanceStore.fps.samples.push(currentFps);
      
      // Keep only the last N samples
      if (performanceStore.fps.samples.length > sampleSize) {
        performanceStore.fps.samples.shift();
      }
      
      // Calculate average FPS
      const sum = performanceStore.fps.samples.reduce((a, b) => a + b, 0);
      performanceStore.fps.average = Math.round(sum / performanceStore.fps.samples.length);
      
      // Check if FPS is low
      if (currentFps < THRESHOLDS.FPS.LOW) {
        performanceStore.fps.lowFpsEvents++;
        console.warn(`Low FPS detected: ${currentFps.toFixed(1)} FPS`);
      }
      
      // Reset for next measurement
      frames = 0;
      lastTime = timestamp;
    }
    
    // Continue measuring
    requestAnimationFrame(measureFps);
  }
  
  // Start the measurement loop
  requestAnimationFrame(measureFps);
}

/**
 * Starts monitoring memory usage if available
 */
function startMemoryMonitoring() {
  if (!(performance as any).memory) {
    console.warn('Memory monitoring not supported in this browser');
    return;
  }
  
  const memoryCheckInterval = 5000; // Check every 5 seconds
  
  function checkMemory() {
    try {
      const memoryInfo = (performance as any).memory;
      
      if (memoryInfo) {
        const memoryUsed = memoryInfo.usedJSHeapSize;
        
        // Update current and peak memory usage
        performanceStore.memory.current = memoryUsed;
        performanceStore.memory.peak = Math.max(performanceStore.memory.peak, memoryUsed);
        
        // Add to snapshots
        performanceStore.memory.snapshots.push(memoryUsed);
        
        // Keep only recent snapshots (last 100)
        if (performanceStore.memory.snapshots.length > 100) {
          performanceStore.memory.snapshots.shift();
        }
        
        // Log warning if memory usage is high
        if (memoryUsed > THRESHOLDS.MEMORY.HIGH) {
          console.warn(`High memory usage: ${(memoryUsed / (1024 * 1024)).toFixed(1)} MB`);
        }
      }
    } catch (e) {
      console.error('Error monitoring memory usage:', e);
    }
    
    setTimeout(checkMemory, memoryCheckInterval);
  }
  
  // Start checking memory
  checkMemory();
}

/**
 * Starts monitoring user interactions
 */
function startInteractionMonitoring() {
  const interactionEvents = [
    'click',
    'keydown',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend'
  ];
  
  interactionEvents.forEach(eventType => {
    document.addEventListener(eventType, (event) => {
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure when the browser responds
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          // Record the interaction
          const target = event.target as HTMLElement;
          const targetDescription = target ? 
            (target.id || target.tagName || 'unknown') : 
            'unknown';
          
          const interactionEvent: InteractionEvent = {
            type: eventType,
            timestamp: startTime,
            duration,
            target: targetDescription
          };
          
          performanceStore.interactions.events.push(interactionEvent);
          
          // Keep only recent events (last 50)
          if (performanceStore.interactions.events.length > 50) {
            performanceStore.interactions.events.shift();
          }
          
          // Check if interaction was slow
          if (duration > THRESHOLDS.INTERACTION.SLOW) {
            performanceStore.interactions.longEvents++;
            console.warn(`Slow interaction: ${eventType} took ${duration.toFixed(1)}ms`);
          }
        });
      });
    }, { passive: true });
  });
}

/**
 * Reports current performance metrics
 */
function reportPerformanceMetrics() {
  // In a real app, you might send these to an analytics service
  const metrics = {
    fps: {
      current: performanceStore.fps.current,
      average: performanceStore.fps.average,
      lowFpsEvents: performanceStore.fps.lowFpsEvents
    },
    memory: {
      current: performanceStore.memory.current / (1024 * 1024), // MB
      peak: performanceStore.memory.peak / (1024 * 1024) // MB
    },
    interactions: {
      longEvents: performanceStore.interactions.longEvents
    },
    errors: {
      count: performanceStore.errors.count
    }
  };
  
  console.debug('Performance metrics:', metrics);
  
  // Here you would typically send the metrics to your monitoring service
}

/**
 * Tracks the loading time for a specific resource
 */
export function trackResourceTiming(resourceUrl: string) {
  try {
    const entries = performance.getEntriesByType('resource');
    const resourceEntry = entries.find(entry => entry.name === resourceUrl);
    
    if (resourceEntry) {
      console.log(`Resource timing for ${resourceUrl}:`, {
        duration: resourceEntry.duration,
        transferSize: (resourceEntry as any).transferSize,
        decodedBodySize: (resourceEntry as any).decodedBodySize
      });
    }
  } catch (e) {
    console.error('Error tracking resource timing:', e);
  }
}

/**
 * Records an error for performance monitoring
 */
export function recordError(message: string) {
  performanceStore.errors.count++;
  performanceStore.errors.messages.push(message);
  
  // Keep error messages list manageable
  if (performanceStore.errors.messages.length > 50) {
    performanceStore.errors.messages.shift();
  }
}

/**
 * Gets the current performance metrics
 */
export function getPerformanceMetrics() {
  return { ...performanceStore };
}
