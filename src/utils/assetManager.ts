/**
 * Asset Management System
 * 
 * This module provides a centralized system for managing asset loading,
 * error handling, and fallbacks for various asset types.
 */

import { toast } from 'sonner';

// Types for asset management
export type AssetType = 'image' | 'font' | 'script' | 'json' | 'styles';

export interface AssetDefinition {
  url: string;
  type: AssetType;
  key: string;
  fallbackUrl?: string;
  required?: boolean;
  preload?: boolean;
}

export interface AssetLoadResult {
  success: boolean;
  key: string;
  url: string;
  error?: string;
  metadata?: Record<string, any>;
}

// AssetRegistry keeps track of available assets and their loading status
class AssetRegistry {
  private assets: Map<string, AssetDefinition> = new Map();
  private loadStatus: Map<string, boolean> = new Map();
  private loadErrors: Map<string, string> = new Map();
  private fallbacksUsed: Map<string, boolean> = new Map();
  
  // Register a new asset
  registerAsset(asset: AssetDefinition): void {
    this.assets.set(asset.key, asset);
    
    // If the asset should be preloaded, do it immediately
    if (asset.preload) {
      this.preloadAsset(asset.key);
    }
  }
  
  // Register multiple assets at once
  registerAssets(assets: AssetDefinition[]): void {
    assets.forEach(asset => this.registerAsset(asset));
  }
  
  // Get an asset by key
  getAsset(key: string): AssetDefinition | undefined {
    return this.assets.get(key);
  }
  
  // Check if an asset is loaded
  isAssetLoaded(key: string): boolean {
    return this.loadStatus.get(key) || false;
  }
  
  // Get asset URL, falling back if needed
  getAssetUrl(key: string): string | undefined {
    const asset = this.assets.get(key);
    if (!asset) return undefined;
    
    const hasFailed = this.loadErrors.has(key);
    const hasFallback = !!asset.fallbackUrl;
    
    // Use fallback if primary URL failed and fallback is available
    if (hasFailed && hasFallback && !this.fallbacksUsed.get(key)) {
      this.fallbacksUsed.set(key, true);
      return asset.fallbackUrl;
    }
    
    return asset.url;
  }
  
  // Preload an asset
  async preloadAsset(key: string): Promise<AssetLoadResult> {
    const asset = this.assets.get(key);
    if (!asset) {
      return { 
        success: false, 
        key, 
        url: '', 
        error: `Asset with key "${key}" not found in registry` 
      };
    }
    
    try {
      let success = false;
      
      switch (asset.type) {
        case 'image':
          success = await this.preloadImage(asset.url);
          break;
        case 'font':
          success = await this.preloadFont(asset.url);
          break;
        case 'script':
          success = await this.preloadScript(asset.url);
          break;
        case 'styles':
          success = await this.preloadStyles(asset.url);
          break;
        case 'json':
          success = await this.preloadJson(asset.url);
          break;
      }
      
      if (success) {
        this.loadStatus.set(key, true);
        this.loadErrors.delete(key);
        return { success: true, key, url: asset.url };
      } else {
        throw new Error(`Failed to load asset: ${asset.url}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.loadErrors.set(key, errorMessage);
      
      // If there's a fallback and it hasn't been tried yet, try it
      if (asset.fallbackUrl && !this.fallbacksUsed.get(key)) {
        this.fallbacksUsed.set(key, true);
        console.warn(`Using fallback for asset "${key}": ${asset.fallbackUrl}`);
        
        // Try the fallback
        try {
          let success = false;
          
          switch (asset.type) {
            case 'image':
              success = await this.preloadImage(asset.fallbackUrl);
              break;
            case 'font':
              success = await this.preloadFont(asset.fallbackUrl);
              break;
            case 'script':
              success = await this.preloadScript(asset.fallbackUrl);
              break;
            case 'styles':
              success = await this.preloadStyles(asset.fallbackUrl);
              break;
            case 'json':
              success = await this.preloadJson(asset.fallbackUrl);
              break;
          }
          
          if (success) {
            this.loadStatus.set(key, true);
            this.loadErrors.delete(key);
            return { 
              success: true, 
              key, 
              url: asset.fallbackUrl,
              metadata: { usedFallback: true } 
            };
          }
        } catch (fallbackError) {
          const fallbackErrorMessage = fallbackError instanceof Error ? 
            fallbackError.message : String(fallbackError);
          
          this.loadErrors.set(key, `Main: ${errorMessage}, Fallback: ${fallbackErrorMessage}`);
        }
      }
      
      // If asset is required, show a toast message
      if (asset.required) {
        toast.error(`Failed to load required asset: ${asset.key}`, {
          description: 'Some features may not work correctly',
          duration: 5000,
        });
      }
      
      return { 
        success: false, 
        key, 
        url: asset.url, 
        error: errorMessage 
      };
    }
  }
  
  // Preload methods for different asset types
  private preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  
  private preloadFont(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'font';
      link.type = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
      link.crossOrigin = 'anonymous';
      
      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);
      
      document.head.appendChild(link);
    });
  }
  
  private preloadScript(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'script';
      
      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);
      
      document.head.appendChild(link);
    });
  }
  
  private preloadStyles(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'style';
      
      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);
      
      document.head.appendChild(link);
    });
  }
  
  private preloadJson(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      fetch(url)
        .then(response => {
          if (response.ok) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
  }
  
  // Get loading stats
  getLoadingStats(): { 
    total: number; 
    loaded: number; 
    failed: number;
    pending: number;
  } {
    const total = this.assets.size;
    const loaded = Array.from(this.loadStatus.values()).filter(status => status).length;
    const failed = this.loadErrors.size;
    const pending = total - loaded - failed;
    
    return { total, loaded, failed, pending };
  }
}

// Create a singleton instance
export const assetRegistry = new AssetRegistry();

// Initialize global assets
export function initializeGlobalAssets(): void {
  // Register common assets with fallbacks
  assetRegistry.registerAssets([
    {
      key: 'main-font',
      url: '/fonts/main-font.woff2',
      fallbackUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      type: 'font',
      preload: true
    },
    {
      key: 'chakra-colors',
      url: '/images/chakra-colors.svg',
      fallbackUrl: '/assets/fallbacks/chakra-colors-fallback.svg',
      type: 'image',
      preload: true
    },
    {
      key: 'cosmic-human',
      url: '/cosmic-human.svg',
      fallbackUrl: '/assets/fallbacks/cosmic-human-fallback.svg',
      type: 'image',
      preload: true
    }
  ]);
  
  // Start preloading
  console.log('Initializing global assets');
}

// Export functions for component use
export function useAsset(key: string): string | undefined {
  return assetRegistry.getAssetUrl(key);
}

export function preloadAssetByKey(key: string): Promise<AssetLoadResult> {
  return assetRegistry.preloadAsset(key);
}

export function registerAsset(asset: AssetDefinition): void {
  assetRegistry.registerAsset(asset);
}

// Initialize assets when this file is imported
if (typeof window !== 'undefined') {
  initializeGlobalAssets();
}

// Default export for convenience
export default assetRegistry;
