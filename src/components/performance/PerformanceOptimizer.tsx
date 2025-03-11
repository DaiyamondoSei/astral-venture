
import React, { ReactNode, useState, useEffect } from 'react';
import { usePerformance } from '../../contexts/PerformanceContext';
import { useAdaptiveRendering } from '../../hooks/useAdaptiveRendering';

interface PerformanceOptimizerProps {
  children: ReactNode;
  componentName: string;
  renderIf?: boolean;
  threshold?: number; // FPS threshold for optimization
  optimizationLevel?: 'auto' | 'low' | 'medium' | 'high';
  placeholder?: ReactNode;
  fallback?: ReactNode;
}

/**
 * PerformanceOptimizer component optimizes rendering based on device capability
 * It can conditionally render children or a simplified version based on performance metrics
 */
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  componentName,
  renderIf = true,
  threshold = 30, // Default to 30 FPS threshold
  optimizationLevel = 'auto',
  placeholder,
  fallback
}) => {
  const { config, deviceCapability } = usePerformance();
  const [shouldRender, setShouldRender] = useState(renderIf);
  const [fps, setFps] = useState<number | null>(null);
  
  // Get adaptive rendering settings
  const adaptive = useAdaptiveRendering({
    enableAnimations: optimizationLevel !== 'high',
    enableBlur: optimizationLevel !== 'high',
    enableShadows: optimizationLevel !== 'high',
    lowPerformanceAdjustment: optimizationLevel === 'low' ? 0.5 : 0.3,
    mediumPerformanceAdjustment: optimizationLevel === 'low' ? 0.8 : 0.7
  });
  
  // If adaptive rendering is disabled, just render the children
  if (!config.enableAdaptiveRendering) {
    return <>{children}</>;
  }
  
  // Monitor FPS if auto optimization is enabled
  useEffect(() => {
    if (optimizationLevel !== 'auto' || !renderIf) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    
    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) { // Update every second
        const currentFps = Math.round(frameCount * 1000 / (now - lastTime));
        setFps(currentFps);
        
        // Update rendering decision based on FPS
        setShouldRender(currentFps >= threshold);
        
        frameCount = 0;
        lastTime = now;
      }
      
      rafId = requestAnimationFrame(measureFps);
    };
    
    rafId = requestAnimationFrame(measureFps);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [optimizationLevel, threshold, renderIf]);
  
  // Handle manual optimization levels
  useEffect(() => {
    if (optimizationLevel === 'auto') return;
    
    // For manual levels, determine rendering based on device capability
    if (optimizationLevel === 'high') {
      setShouldRender(deviceCapability === 'high');
    } else if (optimizationLevel === 'medium') {
      setShouldRender(deviceCapability !== 'low');
    } else {
      // For 'low' level, render on all devices
      setShouldRender(true);
    }
  }, [optimizationLevel, deviceCapability]);
  
  // If we shouldn't render at all based on renderIf prop
  if (!renderIf) {
    return null;
  }
  
  // Render proper content based on performance decisions
  if (!shouldRender) {
    // Render fallback if available, otherwise simplified content
    return (
      <div data-component={componentName} data-optimized="true">
        {fallback || placeholder || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Simplified view for better performance
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For low-performance devices, we might want to apply some CSS optimizations
  if (adaptive.isSimplifiedUI) {
    return (
      <div 
        data-component={componentName} 
        data-simplified="true" 
        className="will-change-auto"
        style={{ 
          // Reduce animation complexity for better performance
          willChange: 'auto',
          // Hint to the browser that this content doesn't need high-quality rendering
          contentVisibility: 'auto'
        }}
      >
        {children}
      </div>
    );
  }
  
  // Render full content for high-performance devices
  return <>{children}</>;
};

export default PerformanceOptimizer;
