/**
 * Performance Optimizer
 * 
 * Utility for optimizing application performance based on device capabilities.
 * It provides adaptive rendering strategies and performance recommendations.
 */

import { AdaptiveSettings } from './types';

// Default adaptive settings based on performance tiers
const DEFAULT_SETTINGS: Record<'low' | 'medium' | 'high', AdaptiveSettings> = {
  low: {
    virtualization: true,
    lazyLoading: true,
    imageOptimization: true,
    enableParticles: false,
    enableComplexAnimations: false,
    enableBlur: false,
    enableShadows: false,
    enableWebWorkers: false,
    enableHighResImages: false
  },
  medium: {
    virtualization: true,
    lazyLoading: true,
    imageOptimization: true,
    enableParticles: true,
    enableComplexAnimations: false,
    enableBlur: true,
    enableShadows: true,
    enableWebWorkers: true,
    enableHighResImages: false
  },
  high: {
    virtualization: false,
    lazyLoading: false,
    imageOptimization: false,
    enableParticles: true,
    enableComplexAnimations: true,
    enableBlur: true,
    enableShadows: true,
    enableWebWorkers: true,
    enableHighResImages: true
  }
};

/**
 * Interface for a performance optimization decision
 */
export interface OptimizationDecision {
  useFeature: boolean;
  reason: string;
}

/**
 * Interface for device capability detection result
 */
export interface DeviceCapabilityResult {
  capability: 'low' | 'medium' | 'high';
  reasons: string[];
  scores: {
    cpu: number;
    memory: number;
    gpu: number;
    network: number;
    overall: number;
  };
}

/**
 * Performance optimizer utility class
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private deviceCapability: 'low' | 'medium' | 'high' = 'medium';
  private adaptiveSettings: AdaptiveSettings;
  private optimizationCache: Map<string, OptimizationDecision> = new Map();
  private frameTimeTracker: number[] = [];
  private isDetectionComplete = false;
  private frameTimeLimitMs = 16.67; // Targeting 60fps

  /**
   * Get the performance optimizer instance
   */
  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private constructor() {
    this.adaptiveSettings = { ...DEFAULT_SETTINGS.medium };
    // Start detection process
    this.detectDeviceCapability();
  }

  /**
   * Get the current adaptive settings
   */
  getAdaptiveSettings(): AdaptiveSettings {
    return { ...this.adaptiveSettings };
  }

  /**
   * Update adaptive settings
   */
  updateAdaptiveSettings(settings: Partial<AdaptiveSettings>): void {
    this.adaptiveSettings = { ...this.adaptiveSettings, ...settings };
    this.optimizationCache.clear(); // Clear cache when settings change
  }

  /**
   * Get the detected device capability
   */
  getDeviceCapability(): 'low' | 'medium' | 'high' {
    return this.deviceCapability;
  }

  /**
   * Set the device capability explicitly
   */
  setDeviceCapability(capability: 'low' | 'medium' | 'high'): void {
    this.deviceCapability = capability;
    this.adaptiveSettings = { ...DEFAULT_SETTINGS[capability] };
    this.optimizationCache.clear();
  }

  /**
   * Determine if a feature should be enabled based on current settings
   */
  shouldEnableFeature(featureName: keyof AdaptiveSettings, featureId?: string): OptimizationDecision {
    const cacheKey = featureId ? `${featureName}_${featureId}` : featureName;
    
    // Check cache first
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }
    
    // Get feature setting
    const featureSetting = this.adaptiveSettings[featureName];
    const useFeature = Boolean(featureSetting);
    
    // Generate reason
    let reason = useFeature
      ? `${featureName} is enabled for ${this.deviceCapability} capability devices`
      : `${featureName} is disabled for ${this.deviceCapability} capability devices`;
    
    // Check if we're experiencing frame rate issues
    if (this.hasPerformanceIssues() && useFeature) {
      reason = `${featureName} would normally be enabled, but is being disabled due to detected performance issues`;
      
      // Cache the decision
      const decision: OptimizationDecision = { useFeature: false, reason };
      this.optimizationCache.set(cacheKey, decision);
      return decision;
    }
    
    // Cache the decision
    const decision: OptimizationDecision = { useFeature, reason };
    this.optimizationCache.set(cacheKey, decision);
    return decision;
  }

  /**
   * Check if we're having performance issues based on frame times
   */
  private hasPerformanceIssues(): boolean {
    // Not enough data yet
    if (this.frameTimeTracker.length < 10) {
      return false;
    }
    
    // Calculate average frame time
    const avgFrameTime = this.frameTimeTracker.reduce((sum, time) => sum + time, 0) / this.frameTimeTracker.length;
    
    // If average frame time is higher than our target, we have performance issues
    return avgFrameTime > this.frameTimeLimitMs;
  }

  /**
   * Track frame time for performance monitoring
   */
  trackFrameTime(frameTimeMs: number): void {
    // Keep only the last 60 frame times
    if (this.frameTimeTracker.length >= 60) {
      this.frameTimeTracker.shift();
    }
    
    this.frameTimeTracker.push(frameTimeMs);
    
    // Clear optimization cache if performance profile has changed
    if (this.hasPerformanceIssues() && this.optimizationCache.size > 0) {
      this.optimizationCache.clear();
    }
  }

  /**
   * Detect device capability based on hardware and browser features
   */
  private async detectDeviceCapability(): Promise<void> {
    if (this.isDetectionComplete) {
      return;
    }
    
    const result = this.analyzeDeviceCapabilities();
    this.deviceCapability = result.capability;
    this.adaptiveSettings = { ...DEFAULT_SETTINGS[result.capability] };
    this.isDetectionComplete = true;
    
    console.log('Device capability detected:', {
      capability: result.capability,
      reasons: result.reasons,
      scores: result.scores
    });
  }

  /**
   * Analyze device capabilities to determine performance tier
   */
  private analyzeDeviceCapabilities(): DeviceCapabilityResult {
    const reasons: string[] = [];
    let cpuScore = 50;
    let memoryScore = 50;
    let gpuScore = 50;
    let networkScore = 50;
    
    // CPU detection
    if (navigator.hardwareConcurrency) {
      const cores = navigator.hardwareConcurrency;
      if (cores <= 2) {
        cpuScore = 25;
        reasons.push(`Low CPU score: only ${cores} cores available`);
      } else if (cores <= 4) {
        cpuScore = 50;
        reasons.push(`Medium CPU score: ${cores} cores available`);
      } else if (cores >= 8) {
        cpuScore = 100;
        reasons.push(`High CPU score: ${cores} cores available`);
      } else {
        cpuScore = 75;
        reasons.push(`Good CPU score: ${cores} cores available`);
      }
    }
    
    // Memory detection
    if ((navigator as any).deviceMemory) {
      const memory = (navigator as any).deviceMemory;
      if (memory <= 2) {
        memoryScore = 25;
        reasons.push(`Low memory score: only ${memory}GB available`);
      } else if (memory <= 4) {
        memoryScore = 50;
        reasons.push(`Medium memory score: ${memory}GB available`);
      } else if (memory >= 8) {
        memoryScore = 100;
        reasons.push(`High memory score: ${memory}GB available`);
      } else {
        memoryScore = 75;
        reasons.push(`Good memory score: ${memory}GB available`);
      }
    }
    
    // Network detection
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      if (connection.saveData) {
        networkScore = 25;
        reasons.push('Low network score: Save-Data is enabled');
      } else if (connection.effectiveType === '4g') {
        networkScore = 100;
        reasons.push('High network score: 4G connection available');
      } else if (connection.effectiveType === '3g') {
        networkScore = 50;
        reasons.push('Medium network score: 3G connection available');
      } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        networkScore = 25;
        reasons.push(`Low network score: ${connection.effectiveType} connection`);
      }
    }
    
    // Mobile detection for GPU estimation
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      gpuScore = 40;
      reasons.push('Reduced GPU score: mobile device detected');
    }
    
    // Overall score calculation (weighted)
    const overallScore = (cpuScore * 0.4) + (memoryScore * 0.3) + (gpuScore * 0.2) + (networkScore * 0.1);
    
    // Determine capability based on overall score
    let capability: 'low' | 'medium' | 'high';
    if (overallScore < 40) {
      capability = 'low';
    } else if (overallScore > 70) {
      capability = 'high';
    } else {
      capability = 'medium';
    }
    
    return {
      capability,
      reasons,
      scores: {
        cpu: cpuScore,
        memory: memoryScore,
        gpu: gpuScore,
        network: networkScore,
        overall: overallScore
      }
    };
  }
}

// Export a singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

export default performanceOptimizer;
