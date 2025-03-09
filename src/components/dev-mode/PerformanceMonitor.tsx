
import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { DeviceCapability } from '@/utils/performanceUtils';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

/**
 * PerformanceMonitor
 * 
 * A floating component that shows performance metrics and allows
 * adjusting performance settings on the fly.
 */
const PerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [slowestComponents, setSlowestComponents] = useState<any[]>([]);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const { 
    deviceCapability, 
    enableParticles, 
    enableComplexAnimations, 
    enableBlur, 
    enableShadows,
    setManualPerformanceMode 
  } = usePerformance();
  
  const { config, updateConfig, applyPreset } = usePerfConfig();

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
        
        // Get slowest components
        setSlowestComponents(performanceMonitor.getSlowestComponents(5));
      }
      
      rafId = requestAnimationFrame(countFrame);
    };
    
    rafId = requestAnimationFrame(countFrame);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/80 p-2 rounded-full hover:bg-black/90 transition-colors"
      >
        <Settings size={16} className="text-white/80" />
      </button>
      
      {isOpen && (
        <div className="bg-black/80 text-white/90 p-4 mb-2 rounded-lg text-xs w-80">
          <h3 className="font-medium mb-2">Performance Monitor</h3>
          
          <div className="space-y-2">
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
              <span>{deviceCapability}</span>
            </div>
            
            {slowestComponents.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-xs">Slowest Components:</h4>
                <div className="max-h-32 overflow-y-auto text-[10px] mt-1">
                  {slowestComponents.map((comp, i) => (
                    <div key={i} className="flex justify-between mb-1">
                      <span>{comp.componentName}</span>
                      <span className={comp.averageRenderTime > 16 ? 'text-red-400' : 'text-yellow-400'}>
                        {comp.averageRenderTime.toFixed(1)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 space-y-2">
              <h4 className="font-medium">Performance Settings</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === DeviceCapability.LOW ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode(DeviceCapability.LOW)}
                >
                  Low
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === DeviceCapability.MEDIUM ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode(DeviceCapability.MEDIUM)}
                >
                  Medium
                </button>
                <button
                  className={`px-2 py-1 rounded text-xs ${deviceCapability === DeviceCapability.HIGH ? 'bg-quantum-600' : 'bg-black/40'}`}
                  onClick={() => setManualPerformanceMode(DeviceCapability.HIGH)}
                >
                  High
                </button>
                <button
                  className="px-2 py-1 rounded text-xs bg-black/40"
                  onClick={() => setManualPerformanceMode('auto')}
                >
                  Auto-detect
                </button>
              </div>
              
              <div className="mt-2">
                <h4 className="font-medium text-xs">Performance Presets:</h4>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    className="px-2 py-1 rounded text-xs bg-black/40"
                    onClick={() => applyPreset('comprehensive')}
                  >
                    Comprehensive
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs bg-quantum-600"
                    onClick={() => applyPreset('balanced')}
                  >
                    Balanced
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs bg-black/40"
                    onClick={() => applyPreset('minimal')}
                  >
                    Minimal
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs bg-black/40"
                    onClick={() => applyPreset('disabled')}
                  >
                    Disabled
                  </button>
                </div>
              </div>
              
              <div className="pt-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Features Enabled:</span>
                </div>
                <ul className="text-[10px] pl-2">
                  <li className={enableParticles ? 'text-green-400' : 'text-red-400'}>
                    Particles: {enableParticles ? 'On' : 'Off'}
                  </li>
                  <li className={enableComplexAnimations ? 'text-green-400' : 'text-red-400'}>
                    Complex Animations: {enableComplexAnimations ? 'On' : 'Off'}
                  </li>
                  <li className={enableBlur ? 'text-green-400' : 'text-red-400'}>
                    Blur Effects: {enableBlur ? 'On' : 'Off'}
                  </li>
                  <li className={enableShadows ? 'text-green-400' : 'text-red-400'}>
                    Shadows: {enableShadows ? 'On' : 'Off'}
                  </li>
                  <li className={config.enableRenderTracking ? 'text-green-400' : 'text-red-400'}>
                    Render Tracking: {config.enableRenderTracking ? 'On' : 'Off'}
                  </li>
                </ul>
              </div>
              
              <div className="text-[10px] mt-2 pt-2 border-t border-white/10">
                <button 
                  className="text-quantum-400 underline"
                  onClick={() => {
                    performanceMonitor.resetMetrics();
                    setSlowestComponents([]);
                  }}
                >
                  Reset Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
