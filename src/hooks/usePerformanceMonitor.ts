
import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  lastUpdate: number;
}

export function usePerformanceMonitor(isMonitoring: boolean) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    lastUpdate: 0
  });
  
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafIdRef = useRef<number>();
  
  // Optimize history updates with a memoized function
  const updateHistory = useCallback((newMetrics: PerformanceMetrics) => {
    setHistory(prev => {
      // Limit history size to 20 entries
      const newHistory = [...prev, newMetrics];
      if (newHistory.length > 20) {
        return newHistory.slice(-20);
      }
      return newHistory;
    });
  }, []);
  
  // Optimized performance monitoring with throttling
  useEffect(() => {
    if (!isMonitoring) return;
    
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    
    // Throttle updates to reduce performance impact of the monitor itself
    let lastUpdateTime = 0;
    const updateInterval = 1000; // Update metrics once per second
    
    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Update metrics once per interval
      if (now - lastUpdateTime >= updateInterval) {
        lastUpdateTime = now;
        const elapsed = now - lastTimeRef.current;
        
        // Only calculate if we have a meaningful time interval
        if (elapsed >= 500) {
          const fps = Math.round(frameCountRef.current * 1000 / elapsed);
          const renderTime = parseFloat((performance.now() - now).toFixed(2));
          
          // Get memory usage if available
          let memoryUsage = 0;
          try {
            // Try to access memory API (only available in some browsers)
            if ((performance as any).memory) {
              memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
            }
          } catch (e) {
            // Ignore errors - memory API is not available in all browsers
          }
          
          const newMetrics = {
            fps,
            renderTime,
            memoryUsage,
            lastUpdate: now
          };
          
          setMetrics(newMetrics);
          updateHistory(newMetrics);
          
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }
      }
      
      rafIdRef.current = requestAnimationFrame(measurePerformance);
    };
    
    // Use requestIdleCallback if available to reduce impact on main thread
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        rafIdRef.current = requestAnimationFrame(measurePerformance);
      });
    } else {
      rafIdRef.current = requestAnimationFrame(measurePerformance);
    }
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMonitoring, updateHistory]);
  
  // Get performance status label and color based on metrics
  const getPerformanceStatus = useCallback(() => {
    if (metrics.fps >= 55) return { label: "Excellent", color: "bg-green-500" };
    if (metrics.fps >= 40) return { label: "Good", color: "bg-green-400" };
    if (metrics.fps >= 30) return { label: "Fair", color: "bg-yellow-400" };
    if (metrics.fps >= 20) return { label: "Poor", color: "bg-orange-400" };
    return { label: "Critical", color: "bg-red-500" };
  }, [metrics.fps]);
  
  return {
    metrics,
    history,
    status: getPerformanceStatus()
  };
}
