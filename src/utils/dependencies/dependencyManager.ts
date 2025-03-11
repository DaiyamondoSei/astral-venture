
/**
 * Dependency Manager
 * 
 * Provides utilities for managing third-party dependencies,
 * including loading, initialization, and feature detection.
 */

export interface DependencyStatus {
  loaded: boolean;
  initialized: boolean;
  error?: Error;
  features: Record<string, boolean>;
}

export interface DependencyOptions {
  /**
   * Whether to load the dependency asynchronously
   */
  async?: boolean;
  
  /**
   * Features to check after loading
   */
  requiredFeatures?: string[];
  
  /**
   * Function to check if the dependency is available
   */
  checkAvailable?: () => boolean;
  
  /**
   * Function to initialize the dependency
   */
  initialize?: () => Promise<void>;
  
  /**
   * Timeout for loading in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to retry loading if it fails
   */
  retry?: boolean;
  
  /**
   * Number of retry attempts
   */
  retryCount?: number;
  
  /**
   * Delay between retries in milliseconds
   */
  retryDelay?: number;
}

/**
 * Map of dependencies and their status
 */
const dependencyStatus = new Map<string, DependencyStatus>();

/**
 * Checks if a specific dependency is loaded
 * 
 * @param name Dependency name
 * @returns Whether the dependency is loaded
 */
export function isDependencyLoaded(name: string): boolean {
  return dependencyStatus.get(name)?.loaded ?? false;
}

/**
 * Checks if a specific dependency feature is available
 * 
 * @param name Dependency name
 * @param feature Feature name
 * @returns Whether the feature is available
 */
export function isDependencyFeatureAvailable(name: string, feature: string): boolean {
  return dependencyStatus.get(name)?.features?.[feature] ?? false;
}

/**
 * Loads a script dependency
 * 
 * @param name Dependency name
 * @param url Script URL
 * @param options Loading options
 * @returns Promise that resolves when the script is loaded
 */
export function loadScriptDependency(
  name: string,
  url: string,
  options: DependencyOptions = {}
): Promise<void> {
  // Set default status
  if (!dependencyStatus.has(name)) {
    dependencyStatus.set(name, {
      loaded: false,
      initialized: false,
      features: {}
    });
  }
  
  const status = dependencyStatus.get(name)!;
  
  // If already loaded, return immediately
  if (status.loaded) {
    return Promise.resolve();
  }
  
  // If already loading, return existing promise
  if (status.loadPromise) {
    return status.loadPromise;
  }
  
  const {
    async = true,
    timeout = 30000,
    retry = true,
    retryCount = 3,
    retryDelay = 1000,
    requiredFeatures = [],
    checkAvailable,
    initialize
  } = options;
  
  // Creating a loading promise to ensure we don't load the same script multiple times
  const loadPromise = new Promise<void>((resolve, reject) => {
    let attempt = 0;
    let timeoutId: number;
    
    const createScript = () => {
      attempt++;
      
      // Check if already available in the global scope
      if (checkAvailable && checkAvailable()) {
        status.loaded = true;
        checkFeatures();
        resolve();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = url;
      script.async = async;
      
      // Set up timeout
      if (timeout > 0) {
        timeoutId = window.setTimeout(() => {
          status.error = new Error(`Loading ${name} timed out after ${timeout}ms`);
          
          // Retry if not exceeded retry count
          if (retry && attempt <= retryCount) {
            console.warn(`Retrying ${name} load (attempt ${attempt}/${retryCount})...`);
            window.setTimeout(createScript, retryDelay);
          } else {
            reject(status.error);
          }
        }, timeout);
      }
      
      // Handle load event
      script.onload = async () => {
        window.clearTimeout(timeoutId);
        
        try {
          status.loaded = true;
          
          // Initialize if needed
          if (initialize) {
            await initialize();
            status.initialized = true;
          }
          
          // Check features
          checkFeatures();
          
          resolve();
        } catch (error) {
          status.error = error instanceof Error ? error : new Error(String(error));
          reject(status.error);
        }
      };
      
      // Handle error event
      script.onerror = event => {
        window.clearTimeout(timeoutId);
        
        const error = new Error(`Failed to load ${name} script`);
        status.error = error;
        
        // Retry if not exceeded retry count
        if (retry && attempt <= retryCount) {
          console.warn(`Retrying ${name} load after error (attempt ${attempt}/${retryCount})...`);
          window.setTimeout(createScript, retryDelay);
        } else {
          reject(error);
        }
      };
      
      // Add to document
      document.head.appendChild(script);
    };
    
    // Check required features
    const checkFeatures = () => {
      for (const feature of requiredFeatures) {
        try {
          // This uses eval to safely check for global objects and features
          // Wrap in a function to avoid global scope pollution
          const checkFeatureCode = `
            (function() {
              try {
                return typeof ${feature} !== 'undefined';
              } catch (e) {
                return false;
              }
            })()
          `;
          
          status.features[feature] = eval(checkFeatureCode);
        } catch (e) {
          status.features[feature] = false;
        }
      }
    };
    
    // Start loading
    createScript();
  });
  
  // Store the promise in the status
  status.loadPromise = loadPromise;
  
  return loadPromise;
}

/**
 * Loads a CSS dependency
 * 
 * @param name Dependency name
 * @param url CSS URL
 * @param options Loading options
 * @returns Promise that resolves when the CSS is loaded
 */
export function loadCssDependency(
  name: string,
  url: string,
  options: DependencyOptions = {}
): Promise<void> {
  // Set default status
  if (!dependencyStatus.has(name)) {
    dependencyStatus.set(name, {
      loaded: false,
      initialized: false,
      features: {}
    });
  }
  
  const status = dependencyStatus.get(name)!;
  
  // If already loaded, return immediately
  if (status.loaded) {
    return Promise.resolve();
  }
  
  // If already loading, return existing promise
  if (status.loadPromise) {
    return status.loadPromise;
  }
  
  const {
    timeout = 10000,
    retry = true,
    retryCount = 2,
    retryDelay = 1000
  } = options;
  
  // Creating a loading promise to ensure we don't load the same CSS multiple times
  const loadPromise = new Promise<void>((resolve, reject) => {
    let attempt = 0;
    let timeoutId: number;
    
    const createLink = () => {
      attempt++;
      
      // Create link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      // Set up timeout
      if (timeout > 0) {
        timeoutId = window.setTimeout(() => {
          status.error = new Error(`Loading ${name} CSS timed out after ${timeout}ms`);
          
          // Retry if not exceeded retry count
          if (retry && attempt <= retryCount) {
            console.warn(`Retrying ${name} CSS load (attempt ${attempt}/${retryCount})...`);
            window.setTimeout(createLink, retryDelay);
          } else {
            reject(status.error);
          }
        }, timeout);
      }
      
      // Handle load event
      link.onload = () => {
        window.clearTimeout(timeoutId);
        status.loaded = true;
        resolve();
      };
      
      // Handle error event
      link.onerror = event => {
        window.clearTimeout(timeoutId);
        
        const error = new Error(`Failed to load ${name} CSS`);
        status.error = error;
        
        // Retry if not exceeded retry count
        if (retry && attempt <= retryCount) {
          console.warn(`Retrying ${name} CSS load after error (attempt ${attempt}/${retryCount})...`);
          window.setTimeout(createLink, retryDelay);
        } else {
          reject(error);
        }
      };
      
      // Add to document
      document.head.appendChild(link);
    };
    
    // Start loading
    createLink();
  });
  
  // Store the promise in the status
  status.loadPromise = loadPromise;
  
  return loadPromise;
}

/**
 * Preloads dependencies in the background
 * 
 * @param dependencies Dependencies to preload
 */
export function preloadDependencies(
  dependencies: Array<{
    name: string;
    url: string;
    type: 'script' | 'css';
    options?: DependencyOptions;
  }>
): void {
  // Queue preloading to not block the main thread
  setTimeout(() => {
    for (const dep of dependencies) {
      try {
        if (dep.type === 'script') {
          loadScriptDependency(dep.name, dep.url, { ...dep.options, async: true });
        } else if (dep.type === 'css') {
          loadCssDependency(dep.name, dep.url, dep.options);
        }
      } catch (error) {
        console.warn(`Failed to preload ${dep.name}:`, error);
      }
    }
  }, 1000);
}

/**
 * Safely executes code that depends on external libraries
 * 
 * @param dependencyName Dependency name
 * @param callback Function to execute
 * @param fallback Fallback function if dependency not available
 * @returns Promise that resolves with the result of the callback
 */
export async function withDependency<T>(
  dependencyName: string,
  callback: () => T | Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> {
  const status = dependencyStatus.get(dependencyName);
  
  if (!status || !status.loaded) {
    if (fallback) {
      return await fallback();
    }
    
    throw new Error(`Dependency ${dependencyName} is not loaded`);
  }
  
  return await callback();
}

/**
 * Manages browser feature detection and compatibility
 */
export const BrowserFeatures = {
  /**
   * Checks if a specific browser feature is supported
   * 
   * @param feature Feature to check
   * @returns Whether the feature is supported
   */
  isSupported(feature: string): boolean {
    switch (feature) {
      case 'serviceWorker':
        return 'serviceWorker' in navigator;
      case 'webGL':
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
          return false;
        }
      case 'webGL2':
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
          return false;
        }
      case 'localStorage':
        try {
          return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
          return false;
        }
      case 'indexedDB':
        return 'indexedDB' in window;
      case 'webWorker':
        return 'Worker' in window;
      case 'webSocket':
        return 'WebSocket' in window;
      case 'fetch':
        return 'fetch' in window;
      case 'Promise':
        return 'Promise' in window;
      case 'customElements':
        return 'customElements' in window;
      case 'IntersectionObserver':
        return 'IntersectionObserver' in window;
      case 'ResizeObserver':
        return 'ResizeObserver' in window;
      case 'abortController':
        return 'AbortController' in window;
      case 'permissions':
        return 'permissions' in navigator;
      default:
        console.warn(`Unknown feature check: ${feature}`);
        return false;
    }
  },
  
  /**
   * Checks if multiple browser features are supported
   * 
   * @param features Features to check
   * @returns Object with feature support status
   */
  checkFeatures(features: string[]): Record<string, boolean> {
    return features.reduce((result, feature) => {
      result[feature] = this.isSupported(feature);
      return result;
    }, {} as Record<string, boolean>);
  },
  
  /**
   * Checks for common performance capabilities
   */
  getPerformanceCapabilities(): Record<string, boolean | number> {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 4,
      serviceWorker: this.isSupported('serviceWorker'),
      webGL: this.isSupported('webGL'),
      webGL2: this.isSupported('webGL2'),
      touchScreen: 'ontouchstart' in window,
      batteryAPI: 'getBattery' in navigator
    };
  }
};
