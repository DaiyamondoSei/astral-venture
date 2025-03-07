
/**
 * Application initializer that properly sequences performance optimizations
 * in a way that doesn't block the initial render
 */

import { getPerformanceCategory, DeviceCapability } from './performanceUtils';
import { initRoutePreloading } from './assetPreloader';

interface InitOptions {
  route?: string;
  enableMonitoring?: boolean;
  prioritizeLCP?: boolean;
}

/**
 * Initializes the application with performance optimizations
 * in the correct sequence
 */
export const initializeApp = async (options: InitOptions = {}): Promise<void> => {
  const { 
    route = 'index', 
    enableMonitoring = process.env.NODE_ENV !== 'production',
    prioritizeLCP = true
  } = options;
  
  // Step 1: Set performance category in the window object ASAP
  const deviceCapability = getPerformanceCategory();
  if (typeof window !== 'undefined') {
    (window as any).__deviceCapability = deviceCapability;
    (window as any).__appInitialized = false;
  }
  
  // Step 2: Initialize performance monitoring if enabled
  if (enableMonitoring) {
    // Defer monitoring initialization to not block rendering
    setTimeout(() => {
      import('./performanceUtils').then(({ monitorPerformance }) => {
        monitorPerformance();
      });
    }, 1000);
  }
  
  // Step 3: Set up basic resource hints immediately
  addResourceHints(deviceCapability);
  
  // Step 4: Handle LCP optimizations if prioritizing LCP
  if (prioritizeLCP) {
    // For index route, preload hero images first
    if (route === 'index' || route === '/') {
      const heroImage = new Image();
      heroImage.src = '/cosmic-human.svg';
      heroImage.fetchPriority = 'high';
    }
  }
  
  // Step 5: Queue up asset preloading for after the initial render
  setTimeout(() => {
    initRoutePreloading(route);
    
    // Mark app as initialized
    if (typeof window !== 'undefined') {
      (window as any).__appInitialized = true;
    }
  }, 500);
};

/**
 * Add critical resource hints directly in the head
 */
function addResourceHints(deviceCapability: DeviceCapability): void {
  if (typeof document === 'undefined') return;
  
  // Add preconnect for critical domains
  const preconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  preconnects.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // On high/medium capability devices, also add DNS prefetch for non-critical resources
  if (deviceCapability !== 'low') {
    const dnsPrefetch = [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];
    
    dnsPrefetch.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

/**
 * Function to be called when a route change occurs
 * to preload assets for the new route
 */
export const onRouteChange = (newRoute: string): void => {
  initRoutePreloading(newRoute);
};
