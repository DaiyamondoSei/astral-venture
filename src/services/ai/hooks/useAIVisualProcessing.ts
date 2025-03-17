
/**
 * useAIVisualProcessing Hook
 * 
 * A React hook for AI-powered visual processing capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import { VisualProcessingService, GeometryPattern, VisualProcessingOptions } from '../services/VisualProcessingService';
import { usePerformance } from '@/shared/hooks/usePerformance';
import { AI_CONFIG } from '../config';

// Initialize service
const visualProcessingService = new VisualProcessingService();

export interface UseAIVisualProcessingProps {
  chakraAssociations?: number[];
  initialComplexity?: number;
  adaptToDevice?: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAIVisualProcessingResult {
  geometryPattern: GeometryPattern | null;
  isLoading: boolean;
  error: string | null;
  regeneratePattern: (seed?: string, complexity?: number) => Promise<void>;
  optimizeForDevice: () => void;
  complexity: number;
  setComplexity: (value: number) => void;
  generatedLocally: boolean;
}

/**
 * React hook for AI-powered visual processing
 */
export function useAIVisualProcessing({
  chakraAssociations = [],
  initialComplexity = 3,
  adaptToDevice = true,
  enableAutoRefresh = false,
  refreshInterval = 60000 // 1 minute
}: UseAIVisualProcessingProps = {}): UseAIVisualProcessingResult {
  const [geometryPattern, setGeometryPattern] = useState<GeometryPattern | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState<string>(`pattern-${Date.now()}`);
  const [complexity, setComplexity] = useState<number>(initialComplexity);
  const [generatedLocally, setGeneratedLocally] = useState<boolean>(false);
  
  const { deviceCapability, isLowPerformance } = usePerformance();
  
  // Adjust complexity based on device capability if adaptToDevice is true
  useEffect(() => {
    if (adaptToDevice) {
      switch (deviceCapability) {
        case 'low':
          setComplexity(Math.min(complexity, 2));
          break;
        case 'medium':
          setComplexity(Math.min(complexity, 4));
          break;
        // 'high' can handle any complexity
      }
    }
  }, [deviceCapability, adaptToDevice, complexity]);
  
  // Generate the geometry pattern
  const generatePattern = useCallback(async (
    patternSeed: string = seed,
    patternComplexity: number = complexity
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine options based on device capability
      const options: VisualProcessingOptions = {
        preferLocal: isLowPerformance || !AI_CONFIG.features.enableVisualProcessing
      };
      
      // Generate the pattern
      const result = await visualProcessingService.generateGeometryPattern(
        patternSeed,
        patternComplexity,
        chakraAssociations,
        options
      );
      
      setGeometryPattern(result.result);
      setGeneratedLocally(result.generatedLocally);
    } catch (err) {
      console.error('Error generating geometry pattern:', err);
      setError('Failed to generate pattern. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [seed, complexity, chakraAssociations, isLowPerformance]);
  
  // Optimize animations for the device
  const optimizeForDevice = useCallback(() => {
    if (!geometryPattern) return;
    
    const optimizedAnimations = visualProcessingService.optimizeAnimations(
      geometryPattern.animationProperties || {},
      deviceCapability
    );
    
    setGeometryPattern(prev => 
      prev ? { ...prev, animationProperties: optimizedAnimations } : null
    );
  }, [geometryPattern, deviceCapability]);
  
  // Initial generation
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);
  
  // Auto-refresh pattern if enabled
  useEffect(() => {
    if (!enableAutoRefresh) return;
    
    const intervalId = setInterval(() => {
      generatePattern(`pattern-${Date.now()}`, complexity);
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [enableAutoRefresh, refreshInterval, complexity, generatePattern]);
  
  // Public regenerate function
  const regeneratePattern = async (newSeed?: string, newComplexity?: number) => {
    const patternSeed = newSeed || `pattern-${Date.now()}`;
    const patternComplexity = newComplexity !== undefined ? newComplexity : complexity;
    
    setSeed(patternSeed);
    if (newComplexity !== undefined) {
      setComplexity(newComplexity);
    }
    
    await generatePattern(patternSeed, patternComplexity);
  };
  
  return {
    geometryPattern,
    isLoading,
    error,
    regeneratePattern,
    optimizeForDevice,
    complexity,
    setComplexity,
    generatedLocally
  };
}

export default useAIVisualProcessing;
