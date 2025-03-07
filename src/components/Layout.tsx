
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { getPerformanceCategory } from '@/utils/performanceUtils'; 

// Lazy load the background component to improve initial load time
const GeometryNetworkBackground = lazy(() => 
  import('./background/GeometryNetworkBackground')
    .then(module => ({
      default: module.default
    }))
);

// Simple fallback background that doesn't block rendering
const SimpleFallbackBackground = () => (
  <div className="fixed inset-0 bg-gradient-to-b from-black/90 to-quantum-900/80" aria-hidden="true" />
);

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  contentWidth?: 'narrow' | 'standard' | 'wide' | 'full';
  removeBackground?: boolean;
}

const Layout = ({ 
  children, 
  className,
  contentWidth = 'standard',
  removeBackground = false
}: LayoutProps) => {
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [animationQuality, setAnimationQuality] = useState<'high' | 'medium' | 'low'>('high');

  // Detect device performance capabilities
  useEffect(() => {
    const quality = getPerformanceCategory();
    setAnimationQuality(quality);
    
    // For medium and high-performance devices, load background after 100ms delay
    // For low-performance devices, wait 300ms to prioritize interactive elements
    const timer = setTimeout(() => {
      setIsBackgroundLoaded(true);
    }, quality === 'low' ? 300 : 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Map content width options to appropriate max-width classes
  const getContentWidthClass = () => {
    switch (contentWidth) {
      case 'narrow':
        return 'max-w-3xl';
      case 'standard':
        return 'max-w-screen-xl';
      case 'wide':
        return 'max-w-screen-2xl';
      case 'full':
        return 'max-w-none px-2';
      default:
        return 'max-w-screen-xl';
    }
  };
  
  // Background density based on performance capability
  const getBackgroundDensity = () => {
    switch (animationQuality) {
      case 'low': return 15;
      case 'medium': return 25;
      case 'high': return 35;
      default: return 25;
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden" role="main">
      {/* Background - only load if not explicitly removed */}
      {!removeBackground && (
        <>
          {/* Always show simple fallback immediately */}
          <SimpleFallbackBackground />
          
          {/* Load the complex background only after initial render */}
          {isBackgroundLoaded && (
            <Suspense fallback={null}>
              <GeometryNetworkBackground 
                density={getBackgroundDensity()} 
                speed={0.6} 
                className="z-0" 
              />
            </Suspense>
          )}
        </>
      )}
      
      {/* Simplified glass background layers with reduced animations */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Reduced number of orbs and simplified animations based on device capability */}
        {animationQuality !== 'low' && (
          <>
            <div className="orb w-[30vw] h-[30vw] -top-[10vw] -left-[10vw] from-quantum-300/20 to-quantum-500/5 animate-pulse-slow" />
            <div className="orb w-[25vw] h-[25vw] top-1/3 -right-[5vw] from-astral-300/15 to-astral-500/5 animate-float" 
                style={{ animationDelay: '-2s' }} />
          </>
        )}
        
        {/* More efficient wave animation - only shown on medium and high performance devices */}
        {animationQuality !== 'low' && (
          <div className="wave-container">
            <div className="wave wave-1" style={{ willChange: 'transform' }} />
            <div className="wave wave-2" style={{ willChange: 'transform' }} />
            {animationQuality === 'high' && (
              <div className="wave wave-3" style={{ willChange: 'transform' }} />
            )}
          </div>
        )}
        
        {/* Simplified gradient for better performance */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40 pointer-events-none" />
      </div>
      
      {/* Main content with improved spacing and z-indexing */}
      <main className={cn(
        "container mx-auto px-4 py-8 relative z-10",
        "transition-all duration-300 ease-in-out", // Reduced transition duration
        getContentWidthClass(), // Dynamic max-width based on prop
        className
      )}>
        {/* Skip link for keyboard users for better accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Main content area with proper semantic structure */}
        <div id="main-content" className="focus:outline-none" tabIndex={-1}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
