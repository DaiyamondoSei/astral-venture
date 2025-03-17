/**
 * Visual Processing Service
 * 
 * This service handles AI-powered visual element generation and optimization.
 * It supports generating sacred geometry patterns, optimizing animations,
 * and adapting visuals in real-time based on user context.
 */

import { AI_CONFIG } from '@/config/aiConfig';
import { aiEdgeClient } from './AIEdgeFunctionClient';
import { generateLocalGeometry } from '@/utils/geometry/geometryUtils';

export interface VisualProcessingOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  cacheResults?: boolean;
  cacheTtlMs?: number;
  forceRefresh?: boolean;
  preferLocal?: boolean;
}

export interface GeometryPattern {
  svgPath: string;
  points: [number, number][];
  complexity: number;
  energyAlignment: string[];
  chakraAssociations: number[];
  animationProperties?: Record<string, any>;
}

export interface VisualProcessingResult<T> {
  result: T;
  generatedLocally: boolean;
  processingTime: number;
  metadata?: {
    modelUsed?: string;
    tokenUsage?: number;
    cached?: boolean;
    complexity?: number;
  };
}

/**
 * AI-powered Visual Processing Service
 */
class VisualProcessingService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  /**
   * Generate a sacred geometry pattern using AI or procedural generation
   */
  async generateGeometryPattern(
    seed: string,
    complexity: number = 3,
    chakraAssociations: number[] = [],
    options: VisualProcessingOptions = {}
  ): Promise<VisualProcessingResult<GeometryPattern>> {
    const startTime = performance.now();
    
    // Determine if we should use local generation
    const useLocal = options.preferLocal || 
      AI_CONFIG.features.preferLocalGeometry || 
      !aiEdgeClient.isAvailable();
    
    if (useLocal) {
      // Use local procedural generation (faster, no API cost)
      const pattern = generateLocalGeometry(seed, complexity, chakraAssociations);
      
      return {
        result: pattern,
        generatedLocally: true,
        processingTime: performance.now() - startTime,
        metadata: {
          complexity,
          cached: false
        }
      };
    }
    
    // Generate cache key
    const cacheKey = `geometry-${seed}-${complexity}-${chakraAssociations.join(',')}`;
    
    // Check cache if enabled
    if (options.cacheResults !== false && AI_CONFIG.features.enableCaching && !options.forceRefresh) {
      const cached = this.cache.get(cacheKey);
      const cacheTtl = options.cacheTtlMs || AI_CONFIG.analysisDefaults.visual.cacheTtlMs;
      
      if (cached && (Date.now() - cached.timestamp < cacheTtl)) {
        return {
          result: cached.data,
          generatedLocally: false,
          processingTime: 0,
          metadata: {
            cached: true,
            complexity
          }
        };
      }
    }
    
    try {
      // Call the edge function to generate the pattern
      const response = await aiEdgeClient.generateGeometryPattern({
        seed,
        complexity,
        chakraAssociations
      }, options);
      
      // Cache the result if caching is enabled
      if (options.cacheResults !== false && AI_CONFIG.features.enableCaching) {
        this.cache.set(cacheKey, {
          data: response.result,
          timestamp: Date.now()
        });
      }
      
      return {
        result: response.result,
        generatedLocally: false,
        processingTime: performance.now() - startTime,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('Error generating geometry pattern:', error);
      
      // Fallback to local generation on error
      const pattern = generateLocalGeometry(seed, complexity, chakraAssociations);
      
      return {
        result: pattern,
        generatedLocally: true,
        processingTime: performance.now() - startTime,
        metadata: {
          complexity,
          cached: false
        }
      };
    }
  }
  
  /**
   * Optimize animation parameters based on device capability and content
   */
  async optimizeAnimations(
    animationConfig: Record<string, any>,
    deviceCapability: string,
    options: VisualProcessingOptions = {}
  ): Promise<Record<string, any>> {
    // For simplicity and to avoid unnecessary API calls, 
    // we'll implement this as a local function rather than an AI call
    const optimized = { ...animationConfig };
    
    switch (deviceCapability) {
      case 'low':
        // Reduce complexity for low-end devices
        optimized.frameRate = Math.min(optimized.frameRate || 60, 30);
        optimized.particleCount = Math.floor((optimized.particleCount || 100) * 0.3);
        optimized.enableBlur = false;
        optimized.enableGlow = false;
        break;
      case 'medium':
        // Moderate complexity for mid-range devices
        optimized.frameRate = Math.min(optimized.frameRate || 60, 45);
        optimized.particleCount = Math.floor((optimized.particleCount || 100) * 0.6);
        optimized.enableBlur = optimized.enableBlur !== undefined ? optimized.enableBlur : false;
        optimized.enableGlow = optimized.enableGlow !== undefined ? optimized.enableGlow : true;
        break;
      case 'high':
        // Keep or enhance for high-end devices
        optimized.frameRate = optimized.frameRate || 60;
        optimized.particleCount = optimized.particleCount || 100;
        optimized.enableBlur = optimized.enableBlur !== undefined ? optimized.enableBlur : true;
        optimized.enableGlow = optimized.enableGlow !== undefined ? optimized.enableGlow : true;
        break;
    }
    
    return optimized;
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const visualProcessingService = new VisualProcessingService();
export default visualProcessingService;
