
/**
 * Visual Processing Service
 * 
 * Provides AI-powered visual processing capabilities for geometry patterns,
 * animations, and other visual elements.
 */
import { DeviceCapability } from '@/contexts/PerformanceContext';
import { Result, success, failure } from '@/utils/api/Result';

// Geometry Pattern Types
export interface Point2D {
  x: number;
  y: number;
}

export interface GeometryNode {
  id: string;
  position: Point2D;
  radius?: number;
  color?: string;
  opacity?: number;
  glowIntensity?: number;
  pulseFrequency?: number;
}

export interface GeometryConnection {
  source: string;
  target: string;
  width?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  animationSpeed?: number;
  dashed?: boolean;
}

export interface AnimationProperties {
  globalRotation?: number;
  globalRotationSpeed?: number;
  pulseEnabled?: boolean;
  pulseFrequency?: number;
  pulseAmplitude?: number;
  glowEnabled?: boolean;
  glowIntensity?: number;
  glowColor?: string;
  particlesEnabled?: boolean;
  particlesDensity?: number;
  particlesSpeed?: number;
}

export interface GeometryPattern {
  id: string;
  nodes: GeometryNode[];
  connections: GeometryConnection[];
  width: number;
  height: number;
  centerPoint?: Point2D;
  animationProperties?: AnimationProperties;
  metadata?: Record<string, any>;
}

export interface VisualProcessingOptions {
  preferLocal?: boolean;
  complexity?: number;
  qualityLevel?: 'low' | 'medium' | 'high';
  forceRemote?: boolean;
}

export interface ProcessingResult<T> {
  result: T;
  generatedLocally: boolean;
  processingTime: number;
}

/**
 * Visual Processing Service Implementation
 */
class VisualProcessingService {
  /**
   * Generate a geometry pattern based on seed and complexity
   */
  async generateGeometryPattern(
    seed: string,
    complexity: number = 3,
    chakraAssociations: number[] = [],
    options: VisualProcessingOptions = {}
  ): Promise<ProcessingResult<GeometryPattern>> {
    const startTime = performance.now();
    
    try {
      // Default to local generation if preferred or if in development
      const useLocalGeneration = options.preferLocal || 
        process.env.NODE_ENV === 'development' ||
        !navigator.onLine;
      
      if (useLocalGeneration && !options.forceRemote) {
        // Generate locally
        const pattern = this.generateLocalPattern(seed, complexity, chakraAssociations);
        
        return {
          result: pattern,
          generatedLocally: true,
          processingTime: performance.now() - startTime
        };
      } else {
        // TODO: Implement remote pattern generation via API
        // For now, fall back to local generation
        console.warn('Remote pattern generation not implemented, falling back to local');
        
        const pattern = this.generateLocalPattern(seed, complexity, chakraAssociations);
        
        return {
          result: pattern,
          generatedLocally: true,
          processingTime: performance.now() - startTime
        };
      }
    } catch (err) {
      console.error('Error generating geometry pattern:', err);
      
      // Fallback to a very basic pattern
      const fallbackPattern = this.generateFallbackPattern();
      
      return {
        result: fallbackPattern,
        generatedLocally: true,
        processingTime: performance.now() - startTime
      };
    }
  }
  
  /**
   * Optimize animations based on device capability
   */
  optimizeAnimations(
    animations: AnimationProperties,
    deviceCapability: string
  ): AnimationProperties {
    // Create a copy to avoid modifying the original
    const optimized = { ...animations };
    
    // Adjust based on device capability
    switch (deviceCapability) {
      case 'low':
        // Disable or reduce expensive animations
        optimized.particlesEnabled = false;
        optimized.glowEnabled = false;
        optimized.pulseFrequency = (optimized.pulseFrequency || 0.5) / 2;
        optimized.globalRotationSpeed = (optimized.globalRotationSpeed || 0.5) / 2;
        break;
        
      case 'medium':
        // Reduce animation complexity
        optimized.particlesDensity = Math.min(optimized.particlesDensity || 50, 30);
        optimized.particlesSpeed = Math.min(optimized.particlesSpeed || 1, 0.7);
        optimized.glowIntensity = Math.min(optimized.glowIntensity || 0.5, 0.3);
        break;
        
      // 'high' can handle full animations
      default:
        break;
    }
    
    return optimized;
  }
  
  /**
   * Generate a local geometry pattern
   */
  private generateLocalPattern(
    seed: string,
    complexity: number,
    chakraAssociations: number[] = []
  ): GeometryPattern {
    // Use seed for deterministic generation
    const seedValue = this.hashString(seed);
    const random = this.createSeededRandom(seedValue);
    
    // Define pattern dimensions
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Scale complexity (1-10)
    const scaledComplexity = Math.max(1, Math.min(10, complexity));
    
    // Calculate number of nodes based on complexity
    const nodeCount = 3 + Math.floor(scaledComplexity * 3);
    
    // Generate nodes in a sacred geometry pattern
    const nodes: GeometryNode[] = [];
    const baseRadius = Math.min(width, height) * 0.4;
    
    // Color palette influenced by chakra associations
    const chakraColors = [
      '#FF0000', // Root - Red
      '#FF7F00', // Sacral - Orange
      '#FFFF00', // Solar Plexus - Yellow
      '#00FF00', // Heart - Green
      '#00FFFF', // Throat - Blue
      '#0000FF', // Third Eye - Indigo
      '#8B00FF'  // Crown - Violet
    ];
    
    let dominantColors = chakraColors;
    if (chakraAssociations.length > 0) {
      dominantColors = chakraAssociations.map(index => 
        chakraColors[Math.min(6, Math.max(0, index))]
      );
    }
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      // Position nodes in a circular pattern with some variance
      const angle = (i / nodeCount) * Math.PI * 2;
      const radiusVariance = random() * 0.3 + 0.85; // 0.85 to 1.15
      const radius = baseRadius * radiusVariance;
      
      // Add some randomness to node positions
      const x = centerX + Math.cos(angle) * radius * (0.9 + random() * 0.2);
      const y = centerY + Math.sin(angle) * radius * (0.9 + random() * 0.2);
      
      // Select color from dominant colors
      const colorIndex = Math.floor(random() * dominantColors.length);
      const color = dominantColors[colorIndex];
      
      // Create node
      nodes.push({
        id: `node-${i}`,
        position: { x, y },
        radius: 10 + scaledComplexity * 2 * (0.8 + random() * 0.4),
        color,
        opacity: 0.7 + random() * 0.3,
        glowIntensity: 0.2 + random() * 0.5,
        pulseFrequency: 0.5 + random() * 1.5
      });
    }
    
    // Generate connections
    const connections: GeometryConnection[] = [];
    
    // Number of connections based on complexity
    const connectionCount = Math.floor(nodeCount * (scaledComplexity / 3));
    
    // Create connections
    for (let i = 0; i < connectionCount; i++) {
      const sourceIndex = i % nodeCount;
      let targetIndex = (sourceIndex + 2 + Math.floor(random() * (nodeCount - 3))) % nodeCount;
      
      // Ensure different nodes
      if (targetIndex === sourceIndex) {
        targetIndex = (targetIndex + 1) % nodeCount;
      }
      
      // Create connection
      connections.push({
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        width: 1 + random() * 3,
        color: nodes[sourceIndex].color,
        opacity: 0.4 + random() * 0.3,
        animated: random() > 0.3,
        animationSpeed: 0.2 + random() * 0.8,
        dashed: random() > 0.7
      });
    }
    
    // Animation properties
    const animationProperties: AnimationProperties = {
      globalRotation: random() * 360,
      globalRotationSpeed: 0.05 + (random() * 0.1 * scaledComplexity / 10),
      pulseEnabled: true,
      pulseFrequency: 0.2 + random() * 0.3,
      pulseAmplitude: 0.05 + random() * 0.1,
      glowEnabled: true,
      glowIntensity: 0.2 + (scaledComplexity / 10) * 0.5,
      glowColor: dominantColors[Math.floor(random() * dominantColors.length)],
      particlesEnabled: scaledComplexity > 5,
      particlesDensity: scaledComplexity * 5,
      particlesSpeed: 0.5 + (scaledComplexity / 10) * 0.5
    };
    
    // Return complete pattern
    return {
      id: `pattern-${seed}`,
      nodes,
      connections,
      width,
      height,
      centerPoint: { x: centerX, y: centerY },
      animationProperties,
      metadata: {
        complexity: scaledComplexity,
        chakraAssociations,
        seed
      }
    };
  }
  
  /**
   * Generate a minimal fallback pattern
   */
  private generateFallbackPattern(): GeometryPattern {
    // Simple triangle pattern
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const nodes: GeometryNode[] = [
      {
        id: 'node-0',
        position: { x: centerX, y: centerY - 100 },
        radius: 15,
        color: '#8B00FF',
        opacity: 0.8
      },
      {
        id: 'node-1',
        position: { x: centerX - 87, y: centerY + 50 },
        radius: 15, 
        color: '#00FF00',
        opacity: 0.8
      },
      {
        id: 'node-2',
        position: { x: centerX + 87, y: centerY + 50 },
        radius: 15,
        color: '#0000FF',
        opacity: 0.8
      }
    ];
    
    const connections: GeometryConnection[] = [
      { source: 'node-0', target: 'node-1', width: 2, color: '#FFFFFF', opacity: 0.6 },
      { source: 'node-1', target: 'node-2', width: 2, color: '#FFFFFF', opacity: 0.6 },
      { source: 'node-2', target: 'node-0', width: 2, color: '#FFFFFF', opacity: 0.6 }
    ];
    
    const animationProperties: AnimationProperties = {
      globalRotation: 0,
      globalRotationSpeed: 0.05,
      pulseEnabled: true,
      pulseFrequency: 0.3,
      pulseAmplitude: 0.05,
      glowEnabled: true,
      glowIntensity: 0.3,
      glowColor: '#FFFFFF',
      particlesEnabled: false
    };
    
    return {
      id: 'fallback-pattern',
      nodes,
      connections,
      width,
      height,
      centerPoint: { x: centerX, y: centerY },
      animationProperties,
      metadata: {
        isFallback: true
      }
    };
  }
  
  /**
   * Hash a string to a number (for seeding random)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Create a seeded random number generator
   */
  private createSeededRandom(seed: number): () => number {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

// Export a singleton instance
export const visualProcessingService = new VisualProcessingService();
