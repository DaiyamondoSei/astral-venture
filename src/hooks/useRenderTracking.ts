
import { useRef, useEffect, useCallback } from 'react';
import { RenderAnalyzer } from '@/utils/performance/RenderAnalyzer';
import { usePerfConfig } from './usePerfConfig';

interface RenderTrackingOptions {
  complexity?: number;
  dependencies?: string[];
  hooks?: string[];
  childComponents?: string[];
  enabled?: boolean;
  throttleInterval?: number;
}

/**
 * Hook to track component renders and provide optimization suggestions
 * with improved efficiency through throttling and sampling
 * 
 * @param componentName Name of the component to track
 * @param options Additional component metadata and tracking options
 */
export function useRenderTracking(
  componentName: string,
  options: RenderTrackingOptions = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const {
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    enabled = true,
    throttleInterval = 0
  } = options;
  
  // Get additional config
  const config = usePerfConfig();
  
  // Skip if tracking is disabled
  if (!enabled || !config.enableRenderTracking) return;
  
  const renderCountRef = useRef(0);
  const renderStartTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const lastRecordTimeRef = useRef(0);
  const recordedThisRenderRef = useRef(false);
  
  // Track render start time
  renderStartTimeRef.current = performance.now();
  recordedThisRenderRef.current = false;
  
  // Create throttled recording function
  const recordRender = useCallback((duration: number) => {
    const now = performance.now();
    
    // Skip if within throttle interval
    if (throttleInterval > 0 && now - lastRecordTimeRef.current < throttleInterval) {
      return;
    }
    
    // Use RenderAnalyzer instead of renderCostAnalyzer
    const analyzer = RenderAnalyzer.getInstance();
    analyzer.analyzeComponent({
      componentName,
      renderTime: duration,
      renderCount: renderCountRef.current
    });
    
    lastRecordTimeRef.current = now;
    
    // Only log slow renders (over 16ms) for complex components to reduce noise
    if (duration > 16 && (complexity > 1 || childComponents.length > 2)) {
      console.warn(`[${componentName}] Slow render detected: ${duration.toFixed(2)}ms`);
      
      // Only provide detailed info for very slow renders
      if (duration > 50) {
        console.info(`Component info:`, { complexity, dependencies, hooks, childComponents });
      }
    }
    
    // Only check for optimizations occasionally and for problematic components
    if (renderCountRef.current % 10 === 0 && (complexity > 1 || duration > 16)) {
      const analysis = analyzer.analyzeComponent({
        componentName,
        renderTime: duration,
        renderCount: renderCountRef.current
      });
      
      if (analysis && analysis.possibleOptimizations.some(s => s.includes('critical'))) {
        console.warn(`[${componentName}] Critical optimization suggestions:`);
      }
    }
  }, [componentName, complexity, childComponents, dependencies, hooks, throttleInterval]);
  
  // Track render completion with throttling
  useEffect(() => {
    // Skip if already recorded this render cycle
    if (recordedThisRenderRef.current) return;
    
    recordedThisRenderRef.current = true;
    const renderDuration = performance.now() - renderStartTimeRef.current;
    renderCountRef.current++;
    lastRenderTimeRef.current = renderDuration;
    
    recordRender(renderDuration);
  });
  
  return;
}
