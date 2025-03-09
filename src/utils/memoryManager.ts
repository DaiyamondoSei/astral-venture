
/**
 * Optimized memory management utility to help prevent memory leaks
 * and manage resource loading priorities
 */

// Store references that need cleanup to prevent memory leaks
const cleanupCallbacks = new Map<string, () => void>();

// Track resource loading priorities
const resourcePriorities: Record<string, number> = {
  critical: 10,
  high: 7,
  medium: 5,
  low: 3
};

// Queue for prioritized resource loading
type ResourceItem = {
  id: string;
  load: () => Promise<any>;
  priority: keyof typeof resourcePriorities;
  onComplete?: (resource: any) => void;
};

let resourceQueue: ResourceItem[] = [];
let isProcessingQueue = false;

/**
 * Register a cleanup callback for a component or resource
 */
export function registerCleanupCallback(id: string, callback: () => void): void {
  cleanupCallbacks.set(id, callback);
}

/**
 * Unregister a cleanup callback
 */
export function unregisterCleanupCallback(id: string): void {
  cleanupCallbacks.delete(id);
}

/**
 * Clear cached object URLs
 */
let objectURLsCreated: string[] = [];

export function registerObjectURL(url: string): string {
  objectURLsCreated.push(url);
  return url;
}

/**
 * Cleanup object URLs to prevent memory leaks
 */
export function cleanupObjectURLs(): void {
  objectURLsCreated.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error revoking object URL:', e);
    }
  });
  objectURLsCreated = [];
}

/**
 * Execute all cleanup callbacks
 */
export function cleanupResources(): void {
  // Execute all cleanup callbacks
  cleanupCallbacks.forEach(callback => {
    try {
      callback();
    } catch (e) {
      console.error('Error in cleanup callback:', e);
    }
  });
  
  // Clear object URLs
  cleanupObjectURLs();
}

/**
 * Add a resource to the loading queue with priority
 */
export function queueResourceLoad<T>(
  id: string,
  loadFn: () => Promise<T>,
  priority: keyof typeof resourcePriorities = 'medium',
  onComplete?: (resource: T) => void
): void {
  resourceQueue.push({
    id,
    load: loadFn,
    priority,
    onComplete
  });
  
  // Sort queue by priority (higher numbers first)
  resourceQueue.sort((a, b) => 
    resourcePriorities[b.priority] - resourcePriorities[a.priority]
  );
  
  // Start processing the queue if not already running
  if (!isProcessingQueue) {
    processResourceQueue();
  }
}

/**
 * Process the resource loading queue
 */
async function processResourceQueue(): Promise<void> {
  if (resourceQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  
  // Process up to 3 resources at a time, starting with highest priority
  const batch = resourceQueue.splice(0, 3);
  
  await Promise.all(batch.map(async (item) => {
    try {
      const result = await item.load();
      if (item.onComplete) {
        item.onComplete(result);
      }
    } catch (error) {
      console.error(`Error loading resource ${item.id}:`, error);
    }
  }));
  
  // Continue processing queue
  processResourceQueue();
}

/**
 * Preload critical app assets
 */
export function preloadCriticalAssets(assetUrls: string[]): Promise<void>[] {
  return assetUrls.map(url => {
    return new Promise<void>((resolve) => {
      if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.svg')) {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve();
        };
        img.src = url;
      } else if (url.endsWith('.glb') || url.endsWith('.gltf')) {
        // For 3D models, just resolve immediately
        // Actual loading will be handled by the 3D library
        resolve();
      } else {
        // For other asset types
        fetch(url)
          .then(() => resolve())
          .catch(() => {
            console.warn(`Failed to preload asset: ${url}`);
            resolve();
          });
      }
    });
  });
}

/**
 * Optimized image loading with quality options and priority
 */
export function optimizedImageLoad(
  imageUrl: string, 
  onLoad?: () => void,
  quality: 'low' | 'medium' | 'high' = 'medium',
  priority: keyof typeof resourcePriorities = 'medium'
): HTMLImageElement {
  const img = new Image();
  
  // Add query param for dynamic image optimization 
  // (assuming server supports image optimization)
  const qualityMap = {
    low: 50,
    medium: 75,
    high: 100
  };
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  const optimizedUrl = `${imageUrl}${separator}q=${qualityMap[quality]}`;
  
  // Add to loading queue with appropriate priority
  queueResourceLoad(
    `image-${imageUrl}`,
    () => new Promise<HTMLImageElement>((resolve) => {
      img.onload = () => {
        if (onLoad) onLoad();
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${imageUrl}`);
        resolve(img); // Resolve anyway to prevent blocking
      };
      img.src = optimizedUrl;
    }),
    priority
  );
  
  return img;
}

/**
 * Initialize memory management
 */
export function initMemoryManagement(): void {
  // Setup periodic memory cleanup
  const cleanupInterval = setInterval(() => {
    if (document.hidden) {
      // Clean up resources when tab is not visible
      cleanupResources();
    }
  }, 60000); // Check every minute
  
  // Clean up when page is unloaded
  window.addEventListener('beforeunload', cleanupResources);
  
  // Register interval cleanup
  registerCleanupCallback('memoryManagerInterval', () => {
    clearInterval(cleanupInterval);
  });
  
  console.log('Memory management initialized');
}

// Export a default function for easier imports
export default {
  init: initMemoryManagement,
  cleanup: cleanupResources,
  preloadCriticalAssets,
  queueResourceLoad,
  optimizedImageLoad,
  registerCleanupCallback,
  unregisterCleanupCallback
};
