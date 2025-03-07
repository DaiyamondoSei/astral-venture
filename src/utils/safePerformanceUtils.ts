
/**
 * Safe performance utilities that won't crash the app
 * if browser APIs are unavailable
 */

// Safely determine if the browser is in a low-power mode or has reduced performance
export function isLowPowerMode(): boolean {
  try {
    // Check if battery API is available
    if ('getBattery' in navigator) {
      // @ts-ignore - Some browsers support this non-standard API
      return navigator.getBattery?.()
        .then((battery) => {
          return battery?.saving || false;
        })
        .catch(() => false);
    }
    
    // Check if device is likely low-powered based on user agent
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.includes('mobile') || 
      userAgent.includes('android') || 
      userAgent.includes('iphone')
    );
  } catch (e) {
    return false;
  }
}

// Get a safe estimate of device memory
export function getDeviceMemory(): number {
  try {
    // @ts-ignore - Non-standard API
    if (navigator.deviceMemory) {
      // @ts-ignore
      return navigator.deviceMemory;
    }
    
    // Fallback to reasonable default
    return 4; // Assume 4GB as middle-ground
  } catch (e) {
    return 4;
  }
}

// Safely get the device pixel ratio
export function getDevicePixelRatio(): number {
  try {
    return window.devicePixelRatio || 1;
  } catch (e) {
    return 1;
  }
}

// Determine if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}

// Calculate a safe rendering budget based on device capabilities
export function getAnimationBudget(): { fps: number, complexity: number } {
  const memory = getDeviceMemory();
  const pixelRatio = getDevicePixelRatio();
  const reducedMotion = prefersReducedMotion();
  const lowPower = isLowPowerMode();
  
  // Calculate target FPS
  let fps = 60;
  if (reducedMotion || lowPower) {
    fps = 30;
  } else if (memory < 2 || pixelRatio < 1) {
    fps = 30;
  } else if (memory < 4) {
    fps = 45;
  }
  
  // Calculate animation complexity (1-10 scale)
  let complexity = 5;
  if (reducedMotion) {
    complexity = 1;
  } else if (lowPower) {
    complexity = 2;
  } else if (memory < 2) {
    complexity = 3;
  } else if (memory < 4) {
    complexity = 4;
  } else if (memory >= 8 && pixelRatio >= 2) {
    complexity = 8;
  }
  
  return { fps, complexity };
}

// Safe requestAnimationFrame with fallback
export function safeRequestAnimationFrame(callback: FrameRequestCallback): number {
  try {
    return window.requestAnimationFrame(callback);
  } catch (e) {
    // Fallback to setTimeout for environments without rAF
    return window.setTimeout(callback, 16) as unknown as number;
  }
}

// Safe cancelAnimationFrame with fallback
export function safeCancelAnimationFrame(id: number): void {
  try {
    window.cancelAnimationFrame(id);
  } catch (e) {
    // Fallback to clearTimeout
    window.clearTimeout(id);
  }
}
