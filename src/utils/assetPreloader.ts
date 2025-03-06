
/**
 * Utility for preloading assets (images, fonts, etc.) to improve application performance
 */

/**
 * Preload an image to ensure it's cached when needed
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = async (sources: string[]): Promise<void> => {
  // Use Promise.allSettled to continue even if some images fail to load
  await Promise.allSettled(sources.map(src => preloadImage(src)));
};

/**
 * Preload a font to ensure it's available when needed
 */
export const preloadFont = (fontFamily: string, options: { weight?: string; style?: string } = {}): Promise<void> => {
  return new Promise((resolve) => {
    // Use Font Loading API if available
    if ('fonts' in document) {
      const { weight = 'normal', style = 'normal' } = options;
      document.fonts.load(`${weight} ${style} 12px "${fontFamily}"`).then(() => {
        resolve();
      }).catch(() => {
        // Fallback - consider it loaded even if there was an error
        resolve();
      });
    } else {
      // Fallback for browsers without Font Loading API
      resolve();
    }
  });
};

/**
 * Preload critical application assets
 */
export const preloadCriticalAssets = async (): Promise<void> => {
  try {
    // Start preloading in parallel
    await Promise.allSettled([
      // Preload critical fonts
      preloadFont('Inter', { weight: '400' }),
      preloadFont('Inter', { weight: '500' }),
      preloadFont('Inter', { weight: '700' }),
      
      // Add any critical images that should be available immediately
      // preloadImages(['/path/to/critical/image1.png', '/path/to/critical/image2.png']),
    ]);
    
    console.log('Critical assets preloaded successfully');
  } catch (error) {
    console.error('Error preloading critical assets:', error);
  }
};

/**
 * Preload non-critical assets during idle time
 */
export const preloadNonCriticalAssets = (): void => {
  // Use requestIdleCallback if available, or setTimeout as fallback
  const scheduleIdleTask = window.requestIdleCallback || 
    ((cb) => setTimeout(cb, 1000));
  
  scheduleIdleTask(() => {
    // Preload additional images, fonts, etc. during idle time
    preloadImages([
      // Add paths to background images, icons, etc.
    ]).catch(err => console.warn('Non-critical asset preloading error:', err));
  });
};
