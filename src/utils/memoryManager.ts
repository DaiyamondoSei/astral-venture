
/**
 * Simplified memory management utility to help prevent memory leaks
 */

// Store references that need cleanup to prevent memory leaks
const cleanupCallbacks = new Map<string, () => void>();

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
  
  console.log('Memory cleanup completed');
}

/**
 * Optimized image loading with quality options
 */
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
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  img.src = `${imageUrl}${separator}q=${qualityMap[quality]}`;
  
  if (onLoad) {
    img.onload = onLoad;
  }
  
  return img;
}
