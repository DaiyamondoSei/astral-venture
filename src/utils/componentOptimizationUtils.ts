
import { useEffect, useState, useRef } from 'react';

/**
 * A collection of utilities to optimize component performance.
 * These utilities help with rendering optimization, memoization strategies,
 * and performance monitoring for React components.
 */

/**
 * Monitors component render frequency and logs potential performance issues.
 * 
 * @param componentName Name of the component being monitored
 * @returns Object with render count and performance metrics
 */
export function useRenderMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Log if renders are happening too frequently
    if (timeSinceLastRender < 100 && renderCount.current > 3) {
      console.warn(
        `[RenderMonitor] ${componentName} rendered ${renderCount.current} times. ` +
        `Last render was only ${timeSinceLastRender}ms ago. Consider optimizing.`
      );
    }
    
    lastRenderTime.current = now;
    
    return () => {
      // Final log when component unmounts
      console.debug(
        `[RenderMonitor] ${componentName} rendered ${renderCount.current} times in total.`
      );
    };
  });
  
  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - lastRenderTime.current
  };
}

/**
 * Calculates and logs component render performance metrics
 * 
 * @param componentName Name of the component
 * @returns Performance tracking methods
 */
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef(0);
  const renderTimes = useRef<number[]>([]);
  
  const startRenderTimer = () => {
    renderStartTime.current = performance.now();
  };
  
  const endRenderTimer = () => {
    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);
    
    // Log if render time is too high
    if (renderTime > 50) {
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render. ` +
        `This is above the recommended threshold of 50ms.`
      );
    }
    
    return renderTime;
  };
  
  useEffect(() => {
    startRenderTimer();
    
    return () => {
      const totalRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0);
      const averageRenderTime = totalRenderTime / Math.max(renderTimes.current.length, 1);
      
      console.debug(
        `[Performance] ${componentName} average render time: ` +
        `${averageRenderTime.toFixed(2)}ms over ${renderTimes.current.length} renders.`
      );
    };
  }, [componentName]);
  
  return {
    startRenderTimer,
    endRenderTimer,
    getRenderMetrics: () => ({
      averageRenderTime: renderTimes.current.reduce((sum, time) => sum + time, 0) / 
        Math.max(renderTimes.current.length, 1),
      renderCount: renderTimes.current.length,
      maxRenderTime: Math.max(...renderTimes.current, 0)
    })
  };
}

/**
 * Optimizes expensive calculations by memoizing results
 * 
 * @param calculationFn Function to memoize
 * @returns Memoized function with the same signature
 */
export function memoizeCalculation<T extends (...args: any[]) => any>(calculationFn: T) {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = calculationFn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
