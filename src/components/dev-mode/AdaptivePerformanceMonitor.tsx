
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';

/**
 * Enhanced Performance Monitor component that displays web vitals
 * and adaptive performance features
 */
const AdaptivePerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const { 
    deviceCapability, 
    manualPerformanceMode,
    features,
    webVitals,
    setManualPerformanceMode 
  } = useAdaptivePerformance();

  // Performance monitoring
  useEffect(() => {
    if (!isOpen) return;
    
    let rafId: number;
    
    const countFrame = (time: number) => {
      // Increment frame count
      frameCountRef.current++;
      
      // Calculate FPS once per second
      if (time - lastTimeRef.current >= 1000) {
        setFps(Math.round(frameCountRef.current * 1000 / (time - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
        
        // Try to get memory usage if available
        if ((performance as any).memory) {
          setMemoryUsage((performance as any).memory.usedJSHeapSize / (1024 * 1024));
        }
      }
      
      rafId = requestAnimationFrame(countFrame);
    };
    
    rafId = requestAnimationFrame(countFrame);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  // Helper to render metric value with appropriate color
  const renderMetricValue = (name: string, value: number | null, rating: string | null) => {
    if (value === null) return 'N/A';
    
    let className = '';
    if (rating === 'good') className = 'text-green-400';
    else if (rating === 'needs-improvement') className = 'text-yellow-400';
    else if (rating === 'poor') className = 'text-red-400';
    
    const formattedValue = name === 'CLS' ? value.toFixed(3) : Math.round(value);
    
    return (
      <span className={className}>
        {formattedValue}
        <span className="text-[8px] ml-1 opacity-60">
          {name === 'CLS' ? '' : 'ms'}
        </span>
      </span>
    );
  };

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/80 p-2 rounded-full hover:bg-black/90 transition-colors"
      >
        <Activity size={16} className="text-white/80" />
      </button>
      
      {isOpen && (
        <div className="bg-black/80 text-white/90 p-4 mb-2 rounded-lg text-xs w-72">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Adaptive Performance Monitor</h3>
            <button
              onClick={() => setShowFull(!showFull)}
              className="p-1 hover:bg-white/10 rounded"
            >
              {showFull ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          
          <div className="space-y-2 mt-2">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
                {fps}
              </span>
            </div>
            
            {memoryUsage !== null && (
              <div className="flex justify-between">
                <span>Memory:</span>
                <span>{Math.round(memoryUsage)} MB</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Device Category:</span>
              <span className="font-mono">{deviceCapability}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-mono">{manualPerformanceMode}</span>
            </div>
            
            {/* Web Vitals Section */}
            {showFull && (
              <>
                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-xs font-medium mb-2">Web Vitals</h4>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div className="opacity-60">LCP</div>
                      <div>{renderMetricValue('LCP', webVitals.LCP?.value || null, webVitals.LCP?.rating || null)}</div>
                    </div>
                    <div>
                      <div className="opacity-60">FID</div>
                      <div>{renderMetricValue('FID', webVitals.FID?.value || null, webVitals.FID?.rating || null)}</div>
                    </div>
                    <div>
                      <div className="opacity-60">CLS</div>
                      <div>{renderMetricValue('CLS', webVitals.CLS?.value || null, webVitals.CLS?.rating || null)}</div>
                    </div>
                    <div>
                      <div className="opacity-60">FCP</div>
                      <div>{renderMetricValue('FCP', webVitals.FCP?.value || null, webVitals.FCP?.rating || null)}</div>
                    </div>
                    <div>
                      <div className="opacity-60">TTFB</div>
                      <div>{renderMetricValue('TTFB', webVitals.TTFB?.value || null, webVitals.TTFB?.rating || null)}</div>
                    </div>
                    <div>
                      <div className="opacity-60">INP</div>
                      <div>{renderMetricValue('INP', webVitals.INP?.value || null, webVitals.INP?.rating || null)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Features section */}
                <div className="pt-2">
                  <h4 className="text-xs font-medium mb-1">Features</h4>
                  <ul className="text-[10px] grid grid-cols-2 gap-x-2">
                    <li className={features.enableParticles ? 'text-green-400' : 'text-red-400'}>
                      Particles: {features.enableParticles ? 'On' : 'Off'}
                    </li>
                    <li className={features.enableComplexAnimations ? 'text-green-400' : 'text-red-400'}>
                      Complex Animations: {features.enableComplexAnimations ? 'On' : 'Off'}
                    </li>
                    <li className={features.enableBlur ? 'text-green-400' : 'text-red-400'}>
                      Blur Effects: {features.enableBlur ? 'On' : 'Off'}
                    </li>
                    <li className={features.enableShadows ? 'text-green-400' : 'text-red-400'}>
                      Shadows: {features.enableShadows ? 'On' : 'Off'}
                    </li>
                    <li className={features.enableWebWorkers ? 'text-green-400' : 'text-red-400'}>
                      Web Workers: {features.enableWebWorkers ? 'On' : 'Off'}
                    </li>
                    <li className={features.enableHighResImages ? 'text-green-400' : 'text-red-400'}>
                      High-Res Images: {features.enableHighResImages ? 'On' : 'Off'}
                    </li>
                  </ul>
                </div>
              </>
            )}
            
            <div className="pt-2 space-y-2">
              <h4 className="font-medium">Performance Settings</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === 'low' ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode('low')}
                >
                  Low
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === 'medium' ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode('medium')}
                >
                  Medium
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === 'high' ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode('high')}
                >
                  High
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${manualPerformanceMode === 'auto' ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode('auto')}
                >
                  Auto-detect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptivePerformanceMonitor;
