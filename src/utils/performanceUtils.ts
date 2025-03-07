
import { useState, useEffect } from 'react';

// Performance categories
export type PerformanceCategory = 'high' | 'medium' | 'low';

// Device capability detection
interface DeviceCapabilities {
  processorCores: number;
  gpu: {
    renderer: string;
    vendor: string;
    supported: boolean;
    versionNumber: number;
    maxTextureSize: number;
    antialiasing: boolean;
    extensions: string[];
  };
  memory: {
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    touchscreen: boolean;
  };
  connection: {
    type?: string;
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
  };
  highEndFeatures: {
    webGL2: boolean;
    webGPU: boolean;
    webAssembly: boolean;
    sharedArrayBuffer: boolean;
  };
}

// Initialize with default values
const defaultCapabilities: DeviceCapabilities = {
  processorCores: 1,
  gpu: {
    renderer: 'unknown',
    vendor: 'unknown',
    supported: false,
    versionNumber: 0,
    maxTextureSize: 0,
    antialiasing: false,
    extensions: []
  },
  memory: {},
  screen: {
    width: 0,
    height: 0,
    pixelRatio: 1,
    touchscreen: false
  },
  connection: {},
  highEndFeatures: {
    webGL2: false,
    webGPU: false,
    webAssembly: false,
    sharedArrayBuffer: false
  }
};

/**
 * Get device capabilities
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  const capabilities = { ...defaultCapabilities };
  
  if (typeof window === 'undefined') {
    return capabilities;
  }

  try {
    // CPU cores
    capabilities.processorCores = navigator.hardwareConcurrency || 1;
    
    // Screen properties
    capabilities.screen = {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      touchscreen: 'ontouchstart' in window
    };
    
    // Network connection
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      capabilities.connection = {
        type: conn?.type,
        downlink: conn?.downlink,
        rtt: conn?.rtt,
        effectiveType: conn?.effectiveType
      };
    }
    
    // Memory information
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      capabilities.memory = {
        totalJSHeapSize: memory?.totalJSHeapSize,
        usedJSHeapSize: memory?.usedJSHeapSize,
        jsHeapSizeLimit: memory?.jsHeapSizeLimit
      };
    }
    
    // GPU capabilities via WebGL
    const canvas = document.createElement('canvas');
    
    // Try WebGL2 first
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
      if (gl) {
        capabilities.highEndFeatures.webGL2 = true;
      }
    } catch (e) {
      console.warn('WebGL2 not supported');
    }
    
    // Fall back to WebGL1
    if (!gl) {
      try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      } catch (e) {
        console.warn('WebGL not supported');
      }
    }
    
    if (gl) {
      capabilities.gpu.supported = true;
      
      // GPU renderer information
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      
      if (debugInfo) {
        capabilities.gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
        capabilities.gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
      }
      
      // GL version
      const version = gl.getParameter(gl.VERSION);
      const versionMatch = version?.match(/(\d+(\.\d+)?)/);
      if (versionMatch) {
        capabilities.gpu.versionNumber = parseFloat(versionMatch[1]);
      }
      
      // Texture size
      capabilities.gpu.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      
      // Antialiasing
      const attributes = gl.getContextAttributes();
      capabilities.gpu.antialiasing = attributes?.antialias || false;
      
      // Extensions
      const extensionsList = gl.getSupportedExtensions();
      capabilities.gpu.extensions = extensionsList || [];
    }
    
    // Check for WebGPU
    capabilities.highEndFeatures.webGPU = 'gpu' in navigator;
    
    // WebAssembly support
    capabilities.highEndFeatures.webAssembly = typeof WebAssembly === 'object';
    
    // SharedArrayBuffer support (for multi-threading)
    try {
      capabilities.highEndFeatures.sharedArrayBuffer = typeof SharedArrayBuffer === 'function';
    } catch (e) {
      capabilities.highEndFeatures.sharedArrayBuffer = false;
    }
    
  } catch (error) {
    console.error('Error detecting device capabilities:', error);
  }
  
  return capabilities;
}

/**
 * Determine performance category based on device capabilities
 */
export function getPerformanceCategory(): PerformanceCategory {
  const capabilities = getDeviceCapabilities();
  
  // Score system (max 100 points)
  let score = 0;
  
  // Hardware class
  const isPowerfulCPU = capabilities.processorCores >= 4;
  const isDecentCPU = capabilities.processorCores >= 2;
  score += isPowerfulCPU ? 20 : (isDecentCPU ? 10 : 0);
  
  // GPU capabilities
  if (capabilities.gpu.supported) {
    // GPU renderer name-based scoring
    const gpuName = capabilities.gpu.renderer.toLowerCase();
    const isHighEndGPU = /rtx|radeon rx|nvidia/i.test(gpuName);
    const isMidRangeGPU = /intel/i.test(gpuName) && !/hd 4000|hd 3000|hd 2000/i.test(gpuName);
    score += isHighEndGPU ? 30 : (isMidRangeGPU ? 15 : 5);
    
    // Texture size
    score += capabilities.gpu.maxTextureSize >= 8192 ? 10 : 
             (capabilities.gpu.maxTextureSize >= 4096 ? 5 : 0);
             
    // Antialiasing
    score += capabilities.gpu.antialiasing ? 5 : 0;
  }
  
  // Modern API support
  score += capabilities.highEndFeatures.webGL2 ? 10 : 0;
  score += capabilities.highEndFeatures.webGPU ? 10 : 0;
  
  // Memory
  if (capabilities.memory.jsHeapSizeLimit) {
    // Memory in GB
    const maxMemoryGB = capabilities.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
    score += maxMemoryGB >= 2 ? 10 : (maxMemoryGB >= 1 ? 5 : 0);
  }
  
  // Device pixel ratio
  score += capabilities.screen.pixelRatio >= 2 ? 5 : 0;
  
  // Determine category
  if (score >= 50) {
    return 'high';
  } else if (score >= 25) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Memory usage monitoring hook
export function useMemoryUsage(interval = 5000): {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
} {
  const [memoryStats, setMemoryStats] = useState({
    totalJSHeapSize: 0,
    usedJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    usagePercentage: 0
  });
  
  useEffect(() => {
    // Only run in browsers and if memory API is available
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return;
    }
    
    const updateMemoryStats = () => {
      try {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100;
        
        setMemoryStats({
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: usage
        });
      } catch (e) {
        console.warn('Error monitoring memory usage:', e);
      }
    };
    
    // Initial update
    updateMemoryStats();
    
    // Set up interval
    const timer = setInterval(updateMemoryStats, interval);
    
    return () => clearInterval(timer);
  }, [interval]);
  
  return memoryStats;
}

// Animation benchmark utility
export function benchmarkAnimation(
  renderFn: () => void, 
  durationMs = 1000
): Promise<{ fps: number; consistency: number }> {
  return new Promise((resolve) => {
    const frames: number[] = [];
    let lastTime = performance.now();
    let rafId: number;
    
    const measure = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      if (delta > 0) {
        frames.push(1000 / delta); // FPS for this frame
      }
      
      // Call render function
      renderFn();
      
      // Check duration
      if (time - frames[0] < durationMs) {
        rafId = requestAnimationFrame(measure);
      } else {
        // Calculate results
        const fps = frames.reduce((sum, fps) => sum + fps, 0) / frames.length;
        
        // Calculate consistency (standard deviation)
        const average = fps;
        const squareDiffs = frames.map(value => Math.pow(value - average, 2));
        const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);
        const consistency = 100 - (stdDev / average * 100);
        
        resolve({ 
          fps,
          consistency: Math.max(0, Math.min(100, consistency))
        });
      }
    };
    
    rafId = requestAnimationFrame(measure);
    
    // Cleanup function
    setTimeout(() => {
      cancelAnimationFrame(rafId);
      if (frames.length === 0) {
        resolve({ fps: 0, consistency: 0 });
      }
    }, durationMs + 500);
  });
}

// Get optimal image quality based on device capabilities
export function getOptimalImageQuality(): 'high' | 'medium' | 'low' {
  const performanceCategory = getPerformanceCategory();
  const capabilities = getDeviceCapabilities();
  
  // Connection check
  let connectionQuality: 'high' | 'medium' | 'low' = 'high';
  
  if (capabilities.connection.effectiveType) {
    switch (capabilities.connection.effectiveType) {
      case '4g':
        connectionQuality = 'high';
        break;
      case '3g':
        connectionQuality = 'medium';
        break;
      case '2g':
      case 'slow-2g':
        connectionQuality = 'low';
        break;
    }
  }
  
  // Device screen resolution check
  const isHighDpi = capabilities.screen.pixelRatio >= 2;
  
  // Return the lower of performance category and connection quality
  if (performanceCategory === 'low' || connectionQuality === 'low') {
    return 'low';
  }
  
  if (performanceCategory === 'medium' || connectionQuality === 'medium' || !isHighDpi) {
    return 'medium';
  }
  
  return 'high';
}
