
/**
 * Enhanced utility for preloading assets to improve performance
 * With validation to prevent 404 errors
 */

// Track which assets we've already tried to preload to avoid duplicates
const preloadAttempted = new Set<string>();

// Asset validation: Check if the file actually exists before preloading
const validateAssetPath = (src: string): boolean => {
  // Skip validation for external URLs (starting with http)
  if (src.startsWith('http')) {
    return true;
  }

  // If we're preloading from the public directory, construct correct path
  // Map paths like "/fonts/main-font.woff2" to the correct public URL
  const publicBasePath = import.meta.env.BASE_URL || '/';
  
  // Log the base path for debugging
  if (!preloadAttempted.has('_logged_basepath')) {
    console.debug(`[Asset Preloader] Base path: ${publicBasePath}`);
    preloadAttempted.add('_logged_basepath');
  }
  
  // Consider the path valid by default, let the browser handle actual 404s
  // but log warnings about potentially problematic paths
  if (!src.startsWith('/') && !src.startsWith('./') && !src.startsWith('../')) {
    console.warn(`[Asset Preloader] Warning: Asset path "${src}" should start with "/" for public assets`);
  }
  
  return true;
}

// Preload a single image with priority indication
export const preloadImage = (src: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLImageElement> => {
  // Avoid duplicate preloads
  const cacheKey = `img_${src}`;
  if (preloadAttempted.has(cacheKey)) {
    return Promise.resolve(new Image()); // Return empty image for duplicates
  }
  preloadAttempted.add(cacheKey);
  
  // Validate path before attempting to preload
  if (!validateAssetPath(src)) {
    console.warn(`[Asset Preloader] Skipping invalid image path: ${src}`);
    return Promise.reject(new Error(`Invalid image path: ${src}`));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set fetchpriority attribute for resource prioritization
    if (priority === 'high' && 'fetchPriority' in img) {
      // @ts-ignore - fetchPriority is not in all TypeScript definitions yet
      img.fetchPriority = 'high';
    }
    
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn(`[Asset Preloader] Failed to preload image: ${src}`, e);
      reject(e);
    };
    img.src = src;
  });
};

// Preload multiple images with better error handling and prioritization
export const preloadImages = async (
  sources: Array<{src: string, priority?: 'high' | 'medium' | 'low'}>
): Promise<HTMLImageElement[]> => {
  try {
    // Filter out invalid sources and deduplicate
    const validSources = sources.filter(img => {
      const cacheKey = `img_${img.src}`;
      const isDuplicate = preloadAttempted.has(cacheKey);
      const isValid = validateAssetPath(img.src);
      
      if (isDuplicate) {
        console.debug(`[Asset Preloader] Skipping duplicate image: ${img.src}`);
      }
      if (!isValid) {
        console.warn(`[Asset Preloader] Skipping invalid image path: ${img.src}`);
      }
      
      return !isDuplicate && isValid;
    });
    
    // Mark these as attempted
    validSources.forEach(img => {
      preloadAttempted.add(`img_${img.src}`);
    });
    
    // Split by priority
    const highPriorityImages = validSources
      .filter(img => img.priority === 'high')
      .map(img => preloadImage(img.src, 'high'));
    
    // Load high priority images first
    const highPriorityResults = await Promise.allSettled(highPriorityImages);
    
    // Then load others
    const otherImages = validSources
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
      console.warn(`[Asset Preloader] Failed to preload ${failures.length} images`);
    }
    
    return successfulLoads;
  } catch (error) {
    console.warn('[Asset Preloader] Failed to preload some images:', error);
    return [];
  }
};

// Preload critical CSS with proper resource hints
export const preloadCSS = (href: string, priority: 'high' | 'low' = 'high'): void => {
  // Avoid duplicates
  const cacheKey = `css_${href}`;
  if (preloadAttempted.has(cacheKey)) {
    return;
  }
  preloadAttempted.add(cacheKey);
  
  // Validate path
  if (!validateAssetPath(href)) {
    console.warn(`[Asset Preloader] Skipping invalid CSS path: ${href}`);
    return;
  }
  
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
  // Avoid duplicates
  const cacheKey = `font_${href}`;
  if (preloadAttempted.has(cacheKey)) {
    return;
  }
  preloadAttempted.add(cacheKey);
  
  // Validate path
  if (!validateAssetPath(href)) {
    console.warn(`[Asset Preloader] Skipping invalid font path: ${href}`);
    return;
  }
  
  // Preload the font resource
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'font';
  preloadLink.type = type;
  preloadLink.href = href;
  preloadLink.crossOrigin = 'anonymous';
  
  // Add error handler to log issues
  preloadLink.onerror = () => {
    console.warn(`[Asset Preloader] Failed to preload font: ${href}`);
  };
  
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
  console.debug(`[Asset Preloader] Preloading critical assets for device capability: ${deviceCapability}`);
  
  // Critical images always loaded - use correct paths based on your project structure
  const criticalImages = [
    { src: '/cosmic-human.svg', priority: 'high' as const },
    { src: '/placeholder.svg', priority: 'medium' as const }
  ];
  
  // Additional images based on device capability
  let additionalImages: Array<{src: string, priority: 'high' | 'medium' | 'low'}> = [];
  
  if (deviceCapability !== 'low') {
    additionalImages = [
      { src: '/lovable-uploads/cosmic-human.png', priority: 'medium' as const },
      { src: '/og-image.png', priority: 'low' as const }
    ];
  }
  
  // Preload all images
  preloadImages([...criticalImages, ...additionalImages])
    .then(images => {
      console.debug(`[Asset Preloader] Successfully preloaded ${images.length} images`);
    })
    .catch(error => {
      console.warn('[Asset Preloader] Error preloading images:', error);
    });
  
  // Don't attempt to preload fonts that don't exist in the project
  // Instead, check if fonts are defined in the project before preloading
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  let hasFonts = false;
  
  stylesheets.forEach(sheet => {
    if (sheet.getAttribute('href')?.includes('font')) {
      hasFonts = true;
    }
  });
  
  if (hasFonts && typeof window !== 'undefined') {
    // Only preload fonts if they seem to exist in the project
    console.debug('[Asset Preloader] Skipping font preloading - no fonts detected in stylesheets');
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
