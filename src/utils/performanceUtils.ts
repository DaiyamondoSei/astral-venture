
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

/**
 * Determine the appropriate animation quality level for the current device
 * @returns Animation quality level: 'low', 'medium', or 'high'
 */
export function getAnimationQualityLevel(): 'low' | 'medium' | 'high' {
  const category = getPerformanceCategory();
  const capabilities = getDeviceCapabilities();
  
  // For low-end devices or devices in low power mode, use low quality
  if (category === 'low' || capabilities.isLowPowerMode) {
    return 'low';
  }
  
  // For high-end devices with good connection, use high quality
  if (category === 'high' && ['4g', 'wifi'].includes(capabilities.connectionType)) {
    return 'high';
  }
  
  // Default to medium quality
  return 'medium';
}

/**
 * Monitor memory usage to detect potential memory leaks or high usage
 * @param warningThreshold Percentage (0-1) of total memory at which to warn
 * @param criticalThreshold Percentage (0-1) of total memory at which to alert
 * @returns Object with memory metrics and status
 */
export function monitorMemoryUsage(
  warningThreshold = 0.7,
  criticalThreshold = 0.9
): {
  status: 'normal' | 'warning' | 'critical';
  usedMemoryMB?: number;
  totalMemoryMB?: number;
  usagePercentage?: number;
  isSupported: boolean;
} {
  // Default response for unsupported browsers
  const defaultResponse = {
    status: 'normal' as 'normal' | 'warning' | 'critical',
    isSupported: false
  };
  
  try {
    // Check if performance.memory is available (Chrome/Edge)
    if (typeof window === 'undefined' || 
        !window.performance || 
        !(window.performance as any).memory) {
      return defaultResponse;
    }
    
    const { 
      usedJSHeapSize, 
      totalJSHeapSize 
    } = (window.performance as any).memory;
    
    // Convert to MB for readability
    const usedMemoryMB = Math.round(usedJSHeapSize / (1024 * 1024));
    const totalMemoryMB = Math.round(totalJSHeapSize / (1024 * 1024));
    const usagePercentage = usedJSHeapSize / totalJSHeapSize;
    
    // Determine status based on thresholds
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    
    if (usagePercentage >= criticalThreshold) {
      status = 'critical';
      console.warn(`Memory usage critical: ${usedMemoryMB}MB / ${totalMemoryMB}MB (${Math.round(usagePercentage * 100)}%)`);
    } else if (usagePercentage >= warningThreshold) {
      status = 'warning';
      console.info(`Memory usage high: ${usedMemoryMB}MB / ${totalMemoryMB}MB (${Math.round(usagePercentage * 100)}%)`);
    }
    
    return {
      status,
      usedMemoryMB,
      totalMemoryMB,
      usagePercentage,
      isSupported: true
    };
  } catch (error) {
    console.warn('Error monitoring memory usage:', error);
    return defaultResponse;
  }
}

/**
 * Check if the device supports modern graphics rendering features
 * @returns Object with graphics capability information
 */
export function getGraphicsCapabilities(): {
  webGL2Support: boolean;
  maxTextureSize: number;
  antialiasing: boolean;
  hardwareAcceleration: boolean;
  isMobile: boolean;
} {
  const defaultCapabilities = {
    webGL2Support: false,
    maxTextureSize: 2048, // Conservative default
    antialiasing: false,
    hardwareAcceleration: false,
    isMobile: false
  };
  
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return defaultCapabilities;
    
    // Check for WebGL2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || 
               canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl');
    
    if (!gl) return defaultCapabilities;
    
    // Determine if this is WebGL2
    const webGL2Support = gl.getParameter(gl.VERSION).indexOf('WebGL 2.0') !== -1;
    
    // Get max texture size
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    
    // Check for antialiasing
    const antialiasing = gl.getContextAttributes()?.antialias || false;
    
    // Check for hardware acceleration (indirect check)
    const hardwareAcceleration = !!(gl.getExtension('WEBGL_lose_context'));
    
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      webGL2Support,
      maxTextureSize,
      antialiasing,
      hardwareAcceleration,
      isMobile
    };
  } catch (error) {
    console.warn('Error detecting graphics capabilities:', error);
    return defaultCapabilities;
  }
}

/**
 * Determine the optimal image quality to use based on device capabilities
 * @param srcSet Object containing image paths for different quality levels
 * @returns The most appropriate image source for the current device
 */
export function getOptimalImageSource(
  srcSet: { low: string; medium: string; high: string }
): string {
  const performanceCategory = getPerformanceCategory();
  const capabilities = getDeviceCapabilities();
  const connection = (navigator as any).connection?.effectiveType || 'unknown';
  
  // Use low quality images for:
  // - Low-end devices
  // - Slow connections (2g, 3g)
  // - Low power mode
  if (
    performanceCategory === 'low' || 
    capabilities.isLowPowerMode || 
    ['slow-2g', '2g', '3g'].includes(connection)
  ) {
    return srcSet.low;
  }
  
  // Use high quality images for:
  // - High-end devices
  // - Good connections (4g, wifi)
  // - Not in low power mode
  if (
    performanceCategory === 'high' && 
    ['4g', 'wifi'].includes(connection) && 
    !capabilities.isLowPowerMode
  ) {
    return srcSet.high;
  }
  
  // Default to medium quality
  return srcSet.medium;
}
