
/**
 * Utility for preloading assets to improve performance
 */

// Preload a single image
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (sources: string[]): Promise<HTMLImageElement[]> => {
  try {
    return await Promise.all(sources.map(preloadImage));
  } catch (error) {
    console.warn('Failed to preload some images:', error);
    return [];
  }
};

// Preload critical CSS
export const preloadCSS = (href: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  document.head.appendChild(link);
};

// Preload font
export const preloadFont = (href: string, type: string = 'font/woff2'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = type;
  link.href = href;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Priority preloading for critical assets
export const preloadCriticalAssets = (): void => {
  // Preload critical images
  preloadImages([
    '/cosmic-human.svg', 
    '/placeholder.svg'
  ]);
  
  // Add other critical assets as needed
};
