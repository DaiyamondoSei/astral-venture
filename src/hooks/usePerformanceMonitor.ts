
import { useState, useEffect, useRef } from 'react';

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
  
  useEffect(() => {
    if (!isMonitoring) return;
    
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    
    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // Update metrics once per second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round(frameCountRef.current * 1000 / (now - lastTimeRef.current));
        const renderTime = parseFloat((performance.now() - now).toFixed(2));
        
        // Get memory usage if available
        const memoryUsage = (window.performance as any).memory 
          ? Math.round((window.performance as any).memory.usedJSHeapSize / (1024 * 1024))
          : 0;
        
        const newMetrics = {
          fps,
          renderTime,
          memoryUsage,
          lastUpdate: now
        };
        
        setMetrics(newMetrics);
        setHistory(prev => [...prev.slice(-19), newMetrics]);
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      rafIdRef.current = requestAnimationFrame(measurePerformance);
    };
    
    rafIdRef.current = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMonitoring]);
  
  const getPerformanceStatus = () => {
    if (metrics.fps >= 55) return { label: "Excellent", color: "bg-green-500" };
    if (metrics.fps >= 40) return { label: "Good", color: "bg-green-400" };
    if (metrics.fps >= 30) return { label: "Fair", color: "bg-yellow-400" };
    if (metrics.fps >= 20) return { label: "Poor", color: "bg-orange-400" };
    return { label: "Critical", color: "bg-red-500" };
  };
  
  return {
    metrics,
    history,
    status: getPerformanceStatus()
  };
}
