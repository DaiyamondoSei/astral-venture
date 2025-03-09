
/**
 * Memory management utility to help prevent memory leaks
 * and optimize memory usage for the application
 */

// Flag indicating if memory management is active
let memoryManagementEnabled = false;

// Store references that need cleanup to prevent memory leaks
const cleanupCallbacks = new Map<string, () => void>();

// Track resource usage to optimize AI processing
const resourceUsage = {
  aiRequestsProcessed: 0,
  memoryPressureDetected: false,
  lastMemoryCheck: 0,
  memoryCheckInterval: 30000, // Check every 30 seconds
  memoryThreshold: 0.7 // 70% memory usage threshold
};

// Initialize memory management
export function initMemoryManagement(): void {
  if (typeof window === 'undefined') return;
  
  memoryManagementEnabled = true;
  
  // Listen for page visibility changes to clean up resources when tab is hidden
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Clean up unnecessary resources after a period of inactivity
  let inactivityTimer: number;
  
  const resetInactivityTimer = () => {
    window.clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        cleanupUnusedResources(false); // Partial cleanup when inactive but visible
      }
    }, 60000); // 1 minute
  };
  
  // Reset inactivity timer on user interaction
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(eventType => {
    window.addEventListener(eventType, resetInactivityTimer, { passive: true });
  });
  
  resetInactivityTimer();
  
  // Monitor for memory warnings in supported browsers
  if ('performance' in window && 'memory' in (performance as any)) {
    setInterval(checkMemoryUsage, resourceUsage.memoryCheckInterval);
  }
  
  console.log('Memory management initialized');
}

// Check current memory usage
function checkMemoryUsage(): void {
  if (!('performance' in window && 'memory' in (performance as any))) return;
  
  const now = Date.now();
  resourceUsage.lastMemoryCheck = now;
  
  const memory = (performance as any).memory;
  const usedHeapPercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  
  // Update memory pressure flag
  const previousState = resourceUsage.memoryPressureDetected;
  resourceUsage.memoryPressureDetected = usedHeapPercentage > resourceUsage.memoryThreshold;
  
  // Log if state changed
  if (previousState !== resourceUsage.memoryPressureDetected) {
    console.log(`Memory pressure changed: ${usedHeapPercentage.toFixed(2)}% used, pressure: ${resourceUsage.memoryPressureDetected}`);
  }
  
  // Cleanup if memory pressure is high
  if (resourceUsage.memoryPressureDetected) {
    console.warn(`Memory usage high (${Math.round(usedHeapPercentage * 100)}%)`);
    cleanupUnusedResources(true); // Aggressive cleanup when memory is high
  }
}

// Handle visibility changes to free resources when tab is hidden
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    cleanupUnusedResources(true);
  }
}

// Register a cleanup callback for a component or resource
export function registerCleanupCallback(id: string, callback: () => void): void {
  cleanupCallbacks.set(id, callback);
}

// Unregister a cleanup callback
export function unregisterCleanupCallback(id: string): void {
  cleanupCallbacks.delete(id);
}

// Track AI request to manage memory usage
export function trackAIRequest(): void {
  resourceUsage.aiRequestsProcessed++;
  
  // Check memory more frequently during heavy AI usage
  if (resourceUsage.aiRequestsProcessed % 5 === 0) {
    const now = Date.now();
    if (now - resourceUsage.lastMemoryCheck > 5000) { // At least 5 seconds since last check
      checkMemoryUsage();
    }
  }
  
  // Reset counter occasionally to prevent overflow
  if (resourceUsage.aiRequestsProcessed > 1000) {
    resourceUsage.aiRequestsProcessed = 1;
  }
}

// Get current memory pressure state
export function isMemoryPressureHigh(): boolean {
  return resourceUsage.memoryPressureDetected;
}

// Cleanup unused resources based on current state
export function cleanupUnusedResources(aggressive: boolean): void {
  if (!memoryManagementEnabled) return;
  
  // Run garbage collection if supported in current environment (Dev tools)
  if (aggressive && (window as any).gc) {
    (window as any).gc();
  }
  
  if (aggressive) {
    // Execute all cleanup callbacks when aggressively cleaning
    cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('Error in cleanup callback:', e);
      }
    });
  }
  
  // Clear image cache for offscreen images
  if (aggressive) {
    purgeOffscreenImageCache();
  }
  
  // Clear object URL references
  cleanupObjectURLs();
  
  // Clear AI processing caches if memory pressure is high
  if (aggressive && resourceUsage.memoryPressureDetected) {
    // This will be handled by the specific services
    // that implement their own cache clearing logic
    const event = new CustomEvent('memory-pressure', { 
      detail: { level: 'high' } 
    });
    window.dispatchEvent(event);
  }
  
  console.log(`Memory cleanup completed (${aggressive ? 'aggressive' : 'partial'})`);
}

// Clear cached object URLs
let objectURLsCreated: string[] = [];

export function registerObjectURL(url: string): string {
  objectURLsCreated.push(url);
  return url;
}

function cleanupObjectURLs(): void {
  objectURLsCreated.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error revoking object URL:', e);
    }
  });
  objectURLsCreated = [];
}

// Purge offscreen image cache
function purgeOffscreenImageCache(): void {
  if (!('requestIdleCallback' in window)) return;
  
  (window as any).requestIdleCallback(() => {
    const images = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    
    images.forEach(img => {
      // Check if image is far offscreen
      const rect = img.getBoundingClientRect();
      const isOffscreen = 
        rect.bottom < -2000 || 
        rect.top > window.innerHeight + 2000 || 
        rect.right < -2000 || 
        rect.left > window.innerWidth + 2000;
      
      // Clear src of far offscreen images to release memory
      // Store original src in data attribute for restoration
      if (isOffscreen && img.src && !img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
        img.src = '';
      }
      
      // Restore src when image might become visible again
      if (!isOffscreen && !img.src && img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
    });
  });
}

// Create a utility for optimized image loading
export function optimizedImageLoad(
  imageUrl: string, 
  onLoad?: () => void,
  quality: 'low' | 'medium' | 'high' = 'medium'
): HTMLImageElement {
  const img = new Image();
  
  // Add query param for dynamic image optimization 
  // (assuming server supports image optimization)
  const qualityMap = {
    low: 50,
    medium: 75,
    high: 100
  };
  
  // Track memory pressure to adjust image quality
  if (resourceUsage.memoryPressureDetected && quality !== 'low') {
    quality = 'low';
  }
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  img.src = `${imageUrl}${separator}q=${qualityMap[quality]}`;
  
  if (onLoad) {
    img.onload = onLoad;
  }
  
  return img;
}

// Optimize memory for AI processing
export function optimizeForAIProcessing(enable: boolean): void {
  if (enable) {
    // When AI processing is active, be more aggressive with memory
    resourceUsage.memoryThreshold = 0.6; // Lower threshold during AI operations
    
    // Run a partial cleanup to free resources for AI processing
    cleanupUnusedResources(false);
  } else {
    // Reset to normal threshold
    resourceUsage.memoryThreshold = 0.7;
  }
}
