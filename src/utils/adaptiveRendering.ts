
// Detect device capability based on available resources
export const detectDeviceCapability = (): 'low' | 'medium' | 'high' => {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return 'medium'; // Default for SSR
  }
  
  // Check for hardware concurrency (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 0;
  
  // Check for device memory
  const deviceMemory = (navigator as any).deviceMemory || 0;
  
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for battery status if available
  const hasBatteryAPI = 'getBattery' in navigator;
  let isBatteryConstrained = false;
  
  if (hasBatteryAPI) {
    // We'll check battery status in a non-blocking way
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.charging === false && battery.level < 0.2) {
        isBatteryConstrained = true;
        // We could trigger an update to the performance config here
        console.log('Battery is low and not charging, reducing performance settings');
      }
    }).catch(() => {
      // Ignore errors with battery API
    });
  }
  
  // Determine device capability
  if (
    (cpuCores <= 2) || 
    (deviceMemory > 0 && deviceMemory <= 2) || 
    (isMobile && (cpuCores <= 4 || deviceMemory <= 4))
  ) {
    return 'low';
  } else if (
    (cpuCores > 2 && cpuCores <= 4) || 
    (deviceMemory > 2 && deviceMemory <= 6) || 
    isMobile
  ) {
    return 'medium';
  } else {
    return 'high';
  }
};

// Utility function to determine if a feature should be enabled based on device capability
export const getAdaptiveSetting = <T>(
  lowOption: T,
  mediumOption: T,
  highOption: T,
  deviceCapability: 'low' | 'medium' | 'high'
): T => {
  switch (deviceCapability) {
    case 'low':
      return lowOption;
    case 'medium':
      return mediumOption;
    case 'high':
      return highOption;
    default:
      return mediumOption;
  }
};

// Utility function to check if a feature should be enabled based on device capability
export const isFeatureEnabled = (
  featureName: string,
  deviceCapability: 'low' | 'medium' | 'high'
): boolean => {
  const featureSettings: Record<string, Record<'low' | 'medium' | 'high', boolean>> = {
    'animations': {
      low: false,
      medium: true,
      high: true
    },
    'particleEffects': {
      low: false,
      medium: true,
      high: true
    },
    'glowEffects': {
      low: false,
      medium: true,
      high: true
    },
    'complexGradients': {
      low: false,
      medium: false,
      high: true
    },
    'advancedShaders': {
      low: false,
      medium: false,
      high: true
    },
    'realTimeInformation': {
      low: false,
      medium: true,
      high: true
    }
  };
  
  if (featureName in featureSettings) {
    return featureSettings[featureName][deviceCapability];
  }
  
  // Default to true for medium and high, false for low
  return deviceCapability !== 'low';
};

export default {
  detectDeviceCapability,
  getAdaptiveSetting,
  isFeatureEnabled
};
