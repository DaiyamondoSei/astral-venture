
import { preloadCriticalAssets, preloadNonCriticalAssets } from './assetPreloader';
import { getAnimationQualityLevel } from './performanceUtils';

/**
 * Initialize the application with performance optimizations
 */
export const initializeApp = async (): Promise<void> => {
  // Track initialization time
  const startTime = performance.now();
  
  try {
    // Detect device capabilities early
    const qualityLevel = getAnimationQualityLevel();
    console.log(`Device performance level detected: ${qualityLevel}`);
    
    // Store quality level in localStorage for persistence
    localStorage.setItem('app_quality_level', qualityLevel);
    
    // Preload critical assets before showing UI
    await preloadCriticalAssets();
    
    // Schedule non-critical assets to load during idle time
    preloadNonCriticalAssets();
    
    // Initialize performance monitoring in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Performance monitoring enabled');
    }
    
    // Log initialization complete
    const initTime = Math.round(performance.now() - startTime);
    console.log(`App initialized in ${initTime}ms`);
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
};

/**
 * Schedule expensive operations during idle time to avoid blocking the main thread
 */
export const scheduleIdleTask = (
  task: () => void, 
  options: { timeout?: number } = {}
): void => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(task, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(task, options.timeout || 50);
  }
};

/**
 * Defer non-critical initialization to improve startup performance
 */
export const deferInitialization = (): void => {
  // Wait until after first paint
  window.addEventListener('load', () => {
    // Schedule tasks after initial page load
    scheduleIdleTask(() => {
      // Initialize non-critical features
      console.log('Initializing deferred tasks...');
      
      // Additional initialization tasks here
    }, { timeout: 2000 });
  });
};
