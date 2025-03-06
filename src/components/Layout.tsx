
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

// Lazy load the background component to improve initial load time
const GeometryNetworkBackground = lazy(() => import('./background/GeometryNetworkBackground'));

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

  // Delay loading background until after main content is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBackgroundLoaded(true);
    }, 100);
    
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
  
  return (
    <div className="min-h-screen relative overflow-hidden" role="main">
      {/* Background - only load if not explicitly removed */}
      {!removeBackground && isBackgroundLoaded && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/80" aria-hidden="true" />}>
          <GeometryNetworkBackground density={35} speed={0.6} className="z-0" />
        </Suspense>
      )}
      
      {/* Simplified glass background layers with reduced animations */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Reduced number of orbs and simplified animations */}
        <div className="orb w-[30vw] h-[30vw] -top-[10vw] -left-[10vw] from-quantum-300/20 to-quantum-500/5 animate-pulse-slow" />
        <div className="orb w-[25vw] h-[25vw] top-1/3 -right-[5vw] from-astral-300/15 to-astral-500/5 animate-float" 
             style={{ animationDelay: '-2s' }} />
        
        {/* More efficient wave animation */}
        <div className="wave-container">
          <div className="wave wave-1" style={{ willChange: 'transform' }} />
          <div className="wave wave-2" style={{ willChange: 'transform' }} />
          <div className="wave wave-3" style={{ willChange: 'transform' }} />
        </div>
        
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
