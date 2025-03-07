
/**
 * Detect the performance category based on device capabilities
 * @returns 'low', 'medium', or 'high'
 */
export function getPerformanceCategory(): 'low' | 'medium' | 'high' {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return 'medium';
    
    // Check for navigator.deviceMemory (only available in some browsers)
    const memory = (navigator as any).deviceMemory || 4;
    
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    
    // Low-end devices
    if (memory <= 2 || cores <= 2) {
      return 'low';
    }
    
    // High-end devices
    if (memory >= 8 && cores >= 6) {
      return 'high';
    }
    
    // Medium devices (default)
    return 'medium';
  } catch (error) {
    console.warn('Error determining performance category:', error);
    return 'medium'; // Fallback to medium
  }
}

/**
 * Calculate optimal element count based on device performance
 * @param baseCount The baseline count for medium devices
 * @param category Optional performance category override
 * @returns Adjusted count for the current device
 */
export function getOptimalElementCount(
  baseCount: number,
  category?: 'low' | 'medium' | 'high'
): number {
  const performanceCategory = category || getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return Math.max(1, Math.floor(baseCount * 0.5));
    case 'medium':
      return baseCount;
    case 'high':
      return Math.ceil(baseCount * 1.5);
    default:
      return baseCount;
  }
}

/**
 * Get comprehensive device capabilities for optimization decisions
 * @returns Object with device capability metrics
 */
export function getDeviceCapabilities(): {
  memory: number;
  cores: number;
  isMobile: boolean;
  pixelRatio: number;
  connectionType: string;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
} {
  const capabilities = {
    memory: 4, // Default assumption
    cores: 4,  // Default assumption
    isMobile: false,
    pixelRatio: 1,
    connectionType: 'unknown',
    batteryLevel: undefined,
    isLowPowerMode: undefined
  };
  
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return capabilities;
    
    // Memory
    if ((navigator as any).deviceMemory) {
      capabilities.memory = (navigator as any).deviceMemory;
    }
    
    // CPU cores
    if (navigator.hardwareConcurrency) {
      capabilities.cores = navigator.hardwareConcurrency;
    }
    
    // Mobile detection
    capabilities.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Screen density
    if (window.devicePixelRatio) {
      capabilities.pixelRatio = window.devicePixelRatio;
    }
    
    // Network information
    if ((navigator as any).connection) {
      capabilities.connectionType = (navigator as any).connection.effectiveType || 'unknown';
    }
    
    // Battery information
    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        capabilities.batteryLevel = battery.level;
        capabilities.isLowPowerMode = battery.level <= 0.2;
      }).catch(() => {
        // Ignore errors with battery API
      });
    }
    
    return capabilities;
  } catch (error) {
    console.warn('Error detecting device capabilities:', error);
    return capabilities;
  }
}

/**
 * Calculate optimal animation settings based on device performance
 * @returns Animation configuration
 */
export function getOptimalAnimationSettings(): {
  shouldAnimate: boolean;
  complexity: 'low' | 'medium' | 'high';
  frameRate: number;
} {
  const category = getPerformanceCategory();
  const capabilities = getDeviceCapabilities();
  
  // Default values
  const settings = {
    shouldAnimate: true,
    complexity: 'medium' as 'low' | 'medium' | 'high',
    frameRate: 60
  };
  
  // Low-end devices or low battery
  if (category === 'low' || capabilities.isLowPowerMode) {
    settings.complexity = 'low';
    settings.frameRate = 30;
  } 
  // High-end devices with good connection
  else if (
    category === 'high' && 
    ['4g', 'wifi'].includes(capabilities.connectionType)
  ) {
    settings.complexity = 'high';
    settings.frameRate = 60;
  } 
  // Default medium settings
  else {
    settings.complexity = 'medium';
    settings.frameRate = 45;
  }
  
  return settings;
}
