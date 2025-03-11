
/**
 * Performance Monitor Component
 * 
 * A debug component that displays performance metrics in the UI
 * for development and testing.
 */
import React, { useState, useEffect } from 'react';
import { usePerformance } from '../providers/PerformanceProvider';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { getWebVitals } from '../utils/performance/webVitalsMonitor';

interface PerformanceMonitorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showWebVitals?: boolean;
  showAdaptiveConfig?: boolean;
  showDeviceInfo?: boolean;
  collapsed?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  position = 'bottom-right',
  showWebVitals = true,
  showAdaptiveConfig = true,
  showDeviceInfo = true,
  collapsed = false
}) => {
  const { 
    config, 
    deviceCapability, 
    adaptiveConfig, 
    shouldUseSimplifiedUI 
  } = usePerformance();
  
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [fps, setFps] = useState(60);
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});
  const [memory, setMemory] = useState<{
    total: number;
    used: number;
    limit: number;
  } | null>(null);
  
  // Track component performance
  const { startTiming, endTiming, getPerformanceData, ref } = usePerformanceMonitor({
    componentName: 'PerformanceMonitor',
    trackMountTime: true,
    trackUpdateTime: true,
    trackDomSize: true
  });
  
  // Start timing for this render
  startTiming();
  
  // Get position styles
  const getPositionStyle = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };
  
  // Update FPS counter
  useEffect(() => {
    if (isCollapsed) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFps = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      
      frameId = requestAnimationFrame(updateFps);
    };
    
    let frameId = requestAnimationFrame(updateFps);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isCollapsed]);
  
  // Update web vitals
  useEffect(() => {
    if (!showWebVitals || isCollapsed) return;
    
    const interval = setInterval(() => {
      setWebVitals(getWebVitals());
    }, 2000);
    
    return () => clearInterval(interval);
  }, [showWebVitals, isCollapsed]);
  
  // Update memory usage
  useEffect(() => {
    if (isCollapsed) return;
    
    const updateMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        
        if (memoryInfo) {
          setMemory({
            total: Math.round(memoryInfo.totalJSHeapSize / (1024 * 1024)),
            used: Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024)),
            limit: Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024))
          });
        }
      }
    };
    
    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    
    return () => clearInterval(interval);
  }, [isCollapsed]);
  
  // Format a number as MB
  const formatMB = (value: number) => `${value} MB`;
  
  // End timing after rendering
  useEffect(() => {
    endTiming();
  });
  
  // If collapsed, just show a button
  if (isCollapsed) {
    return (
      <button
        className={`fixed ${getPositionStyle()} bg-black/80 text-white p-2 rounded-full shadow hover:bg-black/90 z-50`}
        onClick={() => setIsCollapsed(false)}
        aria-label="Show performance monitor"
      >
        <span className="sr-only">Show performance monitor</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4"></path>
          <path d="M12 18v4"></path>
          <path d="m4.93 4.93 2.83 2.83"></path>
          <path d="m16.24 16.24 2.83 2.83"></path>
          <path d="M2 12h4"></path>
          <path d="M18 12h4"></path>
          <path d="m4.93 19.07 2.83-2.83"></path>
          <path d="m16.24 7.76 2.83-2.83"></path>
        </svg>
      </button>
    );
  }
  
  return (
    <div
      ref={ref}
      className={`fixed ${getPositionStyle()} z-50 w-80 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Performance Monitor</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-white hover:text-white/80"
          aria-label="Collapse performance monitor"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      
      <div className="space-y-3 text-xs">
        {/* FPS Counter */}
        <div className="flex justify-between items-center">
          <span>FPS:</span>
          <span className={`font-mono ${fps >= 55 ? 'text-green-400' : (fps >= 30 ? 'text-yellow-400' : 'text-red-400')}`}>
            {fps}
          </span>
        </div>
        
        {/* Memory Usage */}
        {memory && (
          <div className="flex justify-between items-center">
            <span>Memory:</span>
            <span className="font-mono">
              {formatMB(memory.used)} / {formatMB(memory.limit)}
            </span>
          </div>
        )}
        
        {/* Device Info */}
        {showDeviceInfo && (
          <div className="flex flex-col gap-1 border-t border-white/20 pt-2">
            <div className="flex justify-between items-center">
              <span>Device Capability:</span>
              <span className={`font-mono ${
                deviceCapability === 'high' ? 'text-green-400' : 
                deviceCapability === 'medium' ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {deviceCapability}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Simplified UI:</span>
              <span className="font-mono">{shouldUseSimplifiedUI ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )}
        
        {/* Web Vitals */}
        {showWebVitals && Object.keys(webVitals).length > 0 && (
          <div className="border-t border-white/20 pt-2">
            <h4 className="text-xs font-semibold mb-1">Web Vitals</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(webVitals).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="font-mono">{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Adaptive Config */}
        {showAdaptiveConfig && (
          <div className="border-t border-white/20 pt-2">
            <h4 className="text-xs font-semibold mb-1">Adaptive Features</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(adaptiveConfig).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                  <span className="font-mono">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Component render stats */}
        <div className="border-t border-white/20 pt-2">
          <h4 className="text-xs font-semibold mb-1">This Component</h4>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(getPerformanceData()).map(([key, value]) => {
              if (typeof value === 'object') return null;
              if (key === 'updateTimes') return null;
              
              return (
                <div key={key} className="flex justify-between">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                  <span className="font-mono">
                    {typeof value === 'number' && key.includes('Time') ? 
                      `${value.toFixed(2)}ms` : 
                      String(value)
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
