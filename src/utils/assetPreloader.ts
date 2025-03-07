
/**
 * Asset preloading utility
 * Used to strategically preload and cache images, fonts, and other assets
 */

// Define asset categories for better organization
type AssetType = 'image' | 'font' | 'script' | 'json' | 'styles';

// Asset with metadata for advanced preloading
interface Asset {
  url: string;
  type: AssetType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  loadAfter?: string; // URL of another asset that must be loaded first
  mediaQuery?: string; // Only load if media query matches
  loadCondition?: () => boolean; // Function to determine if asset should be loaded
}

// Define assets to preload for each route
const routeAssets: Record<string, Asset[]> = {
  'index': [
    { url: '/cosmic-human.svg', type: 'image', priority: 'critical' },
    { url: '/fonts/main-font.woff2', type: 'font', priority: 'high' },
    { url: '/images/chakra-colors.svg', type: 'image', priority: 'medium' },
  ],
  'dream-capture': [
    { url: '/images/dream-bg.jpg', type: 'image', priority: 'critical' },
    { url: '/fonts/main-font.woff2', type: 'font', priority: 'high' },
  ],
  'profile': [
    { url: '/images/profile-bg.jpg', type: 'image', priority: 'high' },
    { url: '/fonts/main-font.woff2', type: 'font', priority: 'high' },
  ],
  // Add more routes as needed
};

// Global cache to track loaded assets
const loadedAssets = new Set<string>();

// Preload critical assets for a specific route
export const initRoutePreloading = (route: string): void => {
  const assets = routeAssets[route] || [];
  
  if (assets.length === 0) {
    console.debug(`No predefined assets to preload for route: ${route}`);
    return;
  }
  
  // Group assets by priority
  const criticalAssets = assets.filter(a => a.priority === 'critical');
  const highPriorityAssets = assets.filter(a => a.priority === 'high');
  const mediumPriorityAssets = assets.filter(a => a.priority === 'medium');
  const lowPriorityAssets = assets.filter(a => a.priority === 'low');
  
  // Load critical assets immediately
  criticalAssets.forEach(asset => preloadAsset(asset));
  
  // Load high priority assets with a small delay
  if (highPriorityAssets.length > 0) {
    setTimeout(() => {
      highPriorityAssets.forEach(asset => preloadAsset(asset));
    }, 100);
  }
  
  // Load medium priority assets after initial render
  if (mediumPriorityAssets.length > 0) {
    setTimeout(() => {
      mediumPriorityAssets.forEach(asset => preloadAsset(asset));
    }, 1000);
  }
  
  // Load low priority assets during idle time
  if (lowPriorityAssets.length > 0 && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      lowPriorityAssets.forEach(asset => preloadAsset(asset));
    });
  } else if (lowPriorityAssets.length > 0) {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      lowPriorityAssets.forEach(asset => preloadAsset(asset));
    }, 2000);
  }
};

// Preload a single asset with appropriate technique based on type
const preloadAsset = (asset: Asset): void => {
  // Skip if already loaded
  if (loadedAssets.has(asset.url)) {
    return;
  }
  
  // Check load conditions if specified
  if (asset.loadCondition && !asset.loadCondition()) {
    return;
  }
  
  // Check media query if specified
  if (asset.mediaQuery && !window.matchMedia(asset.mediaQuery).matches) {
    return;
  }
  
  // Preload based on asset type
  switch (asset.type) {
    case 'image':
      preloadImage(asset.url);
      break;
    case 'font':
      preloadFont(asset.url);
      break;
    case 'script':
      preloadScript(asset.url);
      break;
    case 'styles':
      preloadStylesheet(asset.url);
      break;
    case 'json':
      preloadData(asset.url);
      break;
  }
  
  // Mark as loaded
  loadedAssets.add(asset.url);
};

// Preload an image
const preloadImage = (url: string): void => {
  const img = new Image();
  img.src = url;
};

// Preload a font
const preloadFont = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = url;
  link.type = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Preload a script
const preloadScript = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = url;
  document.head.appendChild(link);
};

// Preload a stylesheet
const preloadStylesheet = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = url;
  document.head.appendChild(link);
};

// Preload JSON data
const preloadData = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'fetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Function to check if an asset is already loaded
export const isAssetLoaded = (url: string): boolean => {
  return loadedAssets.has(url);
};

// Manually preload a specific asset
export const preload = (url: string, type: AssetType): void => {
  preloadAsset({ url, type, priority: 'high' });
};

// Preload assets for the next route in anticipation of navigation
export const preloadNextRoute = (route: string): void => {
  if (routeAssets[route]) {
    // Only preload critical and high priority assets from the next route
    const assetsToPreload = routeAssets[route].filter(
      asset => asset.priority === 'critical' || asset.priority === 'high'
    );
    
    assetsToPreload.forEach(asset => preloadAsset(asset));
  }
};
