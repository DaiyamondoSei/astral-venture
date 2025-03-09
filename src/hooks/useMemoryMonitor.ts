
import { useState, useEffect, useRef } from 'react';
import { usePerfConfig } from './usePerfConfig';

interface MemoryStats {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  usagePercentage: number;
  isHighUsage: boolean;
}

interface UseMemoryMonitorOptions {
  highUsageThreshold?: number;
  monitoringInterval?: number;
  onHighUsage?: (stats: MemoryStats) => void;
  enabled?: boolean;
}

/**
 * Hook for monitoring memory usage
 * Only works in browsers that support the memory API (Chrome)
 */
export function useMemoryMonitor(options: UseMemoryMonitorOptions = {}) {
  const { config } = usePerfConfig();
  
  const {
    highUsageThreshold = 0.7,
    monitoringInterval = 5000,
    onHighUsage,
    enabled = config.enableMemoryMonitoring
  } = options;
  
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const highUsageReportedRef = useRef(false);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Check if memory API is supported
    const memoryAPISupported = 
      typeof performance !== 'undefined' && 
      'memory' in performance;
    
    setIsSupported(memoryAPISupported);
    
    if (!memoryAPISupported) {
      return;
    }
    
    // Initial check
    checkMemory();
    
    // Set up interval
    intervalRef.current = window.setInterval(checkMemory, monitoringInterval);
    
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [enabled, monitoringInterval]);
  
  // Memory check function
  const checkMemory = () => {
    if (!('performance' in window) || !('memory' in performance)) {
      return;
    }
    
    const memory = (performance as any).memory;
    
    const stats: MemoryStats = {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      usagePercentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      isHighUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit > highUsageThreshold
    };
    
    setMemoryStats(stats);
    
    // Trigger high usage callback if needed
    if (stats.isHighUsage && !highUsageReportedRef.current && onHighUsage) {
      onHighUsage(stats);
      highUsageReportedRef.current = true;
    } else if (!stats.isHighUsage) {
      highUsageReportedRef.current = false;
    }
  };
  
  /**
   * Force garbage collection if DevTools is open
   * and gc is available (requires --expose-gc flag)
   */
  const forceGarbageCollection = () => {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
      setTimeout(checkMemory, 100);
    }
  };
  
  return {
    memoryStats,
    isSupported,
    checkMemory,
    forceGarbageCollection
  };
}

export default useMemoryMonitor;
