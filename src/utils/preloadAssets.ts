
/**
 * Enhanced utility for preloading assets to improve performance
 */

// Preload a single image with priority indication
export const preloadImage = (src: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set fetchpriority attribute for resource prioritization
    if (priority === 'high' && 'fetchPriority' in img) {
      // @ts-ignore - fetchPriority is not in all TypeScript definitions yet
      img.fetchPriority = 'high';
    }
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images with better error handling and prioritization
export const preloadImages = async (
  sources: Array<{src: string, priority?: 'high' | 'medium' | 'low'}>
): Promise<HTMLImageElement[]> => {
  try {
    const highPriorityImages = sources
      .filter(img => img.priority === 'high')
      .map(img => preloadImage(img.src, 'high'));
    
    // Load high priority images first
    const highPriorityResults = await Promise.allSettled(highPriorityImages);
    
    // Then load others
    const otherImages = sources
      .filter(img => img.priority !== 'high')
      .map(img => preloadImage(img.src, img.priority));
    
    const otherResults = await Promise.allSettled(otherImages);
    
    // Combine results and filter out rejected promises
    const allResults = [...highPriorityResults, ...otherResults];
    const successfulLoads = allResults
      .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Log failures but don't block the app
    const failures = allResults.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`Failed to preload ${failures.length} images`);
    }
    
    return successfulLoads;
  } catch (error) {
    console.warn('Failed to preload some images:', error);
    return [];
  }
};

// Preload critical CSS with proper resource hints
export const preloadCSS = (href: string, priority: 'high' | 'low' = 'high'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }
  
  document.head.appendChild(link);
};

// Enhanced font preloading with better browser support
export const preloadFont = (
  href: string, 
  type: string = 'font/woff2', 
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap'
): void => {
  // Preload the font resource
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'font';
  preloadLink.type = type;
  preloadLink.href = href;
  preloadLink.crossOrigin = 'anonymous';
  document.head.appendChild(preloadLink);
  
  // Also add a font-face declaration with font-display strategy
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'PreloadedFont';
      src: url('${href}') format('${type.split('/')[1]}');
      font-display: ${display};
    }
  `;
  document.head.appendChild(style);
};

// Priority preloading for critical assets with improved device capability awareness
export const preloadCriticalAssets = (deviceCapability: 'low' | 'medium' | 'high'): void => {
  // Critical images always loaded
  const criticalImages = [
    { src: '/cosmic-human.svg', priority: 'high' as const },
    { src: '/placeholder.svg', priority: 'medium' as const }
  ];
  
  // Additional images based on device capability
  let additionalImages: Array<{src: string, priority: 'high' | 'medium' | 'low'}> = [];
  
  if (deviceCapability !== 'low') {
    additionalImages = [
      // Add medium/high priority images
      { src: '/lovable-uploads/cosmic-human.png', priority: 'medium' as const },
      { src: '/og-image.png', priority: 'low' as const }
    ];
  }
  
  // Preload all images
  preloadImages([...criticalImages, ...additionalImages]);
  
  // Preload critical fonts with proper font-display strategy
  // This would be replaced with actual font paths if available
  if (typeof window !== 'undefined') {
    // Check if fonts are already loaded to avoid duplicate preloading
    if (!document.querySelector('link[rel="preload"][as="font"]')) {
      // Add font preloading here when fonts are available
    }
  }
};

// Initialize preloading based on device capability
export const initAssetPreloading = (): void => {
  if (typeof window === 'undefined') return;
  
  // Determine device capability from window object if available
  const deviceCapability = (window as any).__deviceCapability || 'medium';
  
  // Start preloading critical assets
  preloadCriticalAssets(deviceCapability);
};

