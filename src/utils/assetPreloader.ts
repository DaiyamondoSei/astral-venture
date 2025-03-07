
/**
 * Enhanced utility for preloading critical assets
 * With proper resource hints, priority signaling, and sequential loading
 */

import { getPerformanceCategory } from './performanceUtils';

// Asset types for better type safety
type AssetType = 'image' | 'font' | 'style' | 'script';

interface PreloadOptions {
  priority: 'high' | 'medium' | 'low';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  fetchPriority?: 'high' | 'low' | 'auto';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

/**
 * Preload an individual asset with enhanced options
 */
export const preloadAsset = (
  src: string, 
  assetType: AssetType,
  options: PreloadOptions
): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    // Create appropriate element based on asset type
    let element: HTMLElement;
    
    switch (assetType) {
      case 'image':
        const img = new Image();
        
        // Set fetchpriority attribute for resource prioritization
        if ('fetchPriority' in img && options.fetchPriority) {
          // @ts-ignore - fetchPriority is not in all TypeScript definitions yet
          img.fetchPriority = options.fetchPriority;
        }
        
        img.onload = () => resolve(img);
        img.onerror = reject;
        
        if (options.crossOrigin) {
          img.crossOrigin = options.crossOrigin;
        }
        
        img.src = src;
        element = img;
        break;
        
      case 'font':
      case 'style':
      case 'script':
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        
        if (assetType === 'font') {
          link.as = 'font';
          if (options.type) link.type = options.type;
          link.crossOrigin = options.crossOrigin || 'anonymous';
          
          // Also add a font-face declaration with font-display strategy
          if (options.display) {
            const style = document.createElement('style');
            style.textContent = `
              @font-face {
                font-family: 'PreloadedFont';
                src: url('${src}') format('${options.type?.split('/')[1] || 'woff2'}');
                font-display: ${options.display};
              }
            `;
            document.head.appendChild(style);
          }
        } else if (assetType === 'style') {
          link.as = 'style';
        } else {
          link.as = 'script';
        }
        
        // Set fetchpriority if high priority
        if (options.priority === 'high') {
          link.setAttribute('fetchpriority', 'high');
        }
        
        link.onload = () => resolve(link);
        link.onerror = reject;
        
        document.head.appendChild(link);
        element = link;
        break;
        
      default:
        reject(new Error(`Unsupported asset type: ${assetType}`));
        return;
    }
  });
};

/**
 * Sequentially preload assets in order of priority
 */
export const preloadAssetsSequentially = async (
  assets: Array<{
    src: string;
    type: AssetType;
    priority: 'high' | 'medium' | 'low';
    options?: Partial<PreloadOptions>;
  }>
): Promise<void> => {
  // Sort assets by priority
  const sortedAssets = [...assets].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // Load high priority assets first
  const highPriorityAssets = sortedAssets.filter(asset => asset.priority === 'high');
  
  try {
    // Load high priority assets in parallel
    await Promise.all(
      highPriorityAssets.map(asset => 
        preloadAsset(asset.src, asset.type, { 
          priority: asset.priority, 
          fetchPriority: 'high',
          ...asset.options 
        })
      )
    );
    
    // Then load medium and low priority assets
    const otherAssets = sortedAssets.filter(asset => asset.priority !== 'high');
    
    // Load in smaller batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < otherAssets.length; i += batchSize) {
      const batch = otherAssets.slice(i, i + batchSize);
      await Promise.all(
        batch.map(asset => 
          preloadAsset(asset.src, asset.type, { 
            priority: asset.priority,
            fetchPriority: asset.priority === 'medium' ? 'auto' : 'low',
            ...asset.options 
          })
        )
      );
    }
  } catch (error) {
    console.warn('Error preloading assets:', error);
  }
};

/**
 * Preload critical assets based on the current route and device capability
 */
export const preloadCriticalAssets = async (route: string): Promise<void> => {
  const deviceCapability = getPerformanceCategory();
  
  // Base critical assets always loaded
  const criticalAssets = [
    { 
      src: '/cosmic-human.svg', 
      type: 'image' as AssetType, 
      priority: 'high' as const,
      options: { crossOrigin: 'anonymous' } 
    },
    { 
      src: '/placeholder.svg', 
      type: 'image' as AssetType, 
      priority: 'medium' as const,
      options: { crossOrigin: 'anonymous' }
    }
  ];
  
  // Route-specific assets
  if (route === 'index' || route === '/') {
    criticalAssets.push(
      { 
        src: '/lovable-uploads/cosmic-human.png', 
        type: 'image' as AssetType, 
        priority: 'high' as const,
        options: { crossOrigin: 'anonymous' }
      }
    );
  }
  
  // Add more assets based on device capability
  if (deviceCapability !== 'low') {
    criticalAssets.push(
      { 
        src: '/og-image.png', 
        type: 'image' as AssetType, 
        priority: 'low' as const,
        options: { crossOrigin: 'anonymous' }
      }
    );
  }
  
  // Preload everything sequentially
  await preloadAssetsSequentially(criticalAssets);
};

// Initialize preloading for the current route
export const initRoutePreloading = (route: string): void => {
  if (typeof window === 'undefined') return;
  
  // Defer preloading slightly to prioritize initial render
  setTimeout(() => {
    preloadCriticalAssets(route).catch(err => {
      console.warn('Asset preloading error:', err);
    });
  }, 300);
};
