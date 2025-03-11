
import React, { useMemo, Suspense } from 'react';
import { cn } from "@/lib/utils";
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import PerfConfigDashboard from './dev-mode/PerfConfigDashboard';

// Simple fallback background that doesn't block rendering
const SimpleFallbackBackground = () => (
  <div className="fixed inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900" aria-hidden="true" />
);

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  contentWidth?: 'narrow' | 'standard' | 'wide' | 'full';
  removeBackground?: boolean;
  centerContent?: boolean;
  fullHeight?: boolean;
  showDevTools?: boolean;
}

/**
 * Layout component with performance tracking and flexible content width
 */
const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  contentWidth = 'standard',
  removeBackground = false,
  centerContent = false,
  fullHeight = false,
  showDevTools = process.env.NODE_ENV === 'development'
}: LayoutProps) => {
  // Use enhanced performance tracking
  const { trackInteraction } = usePerformanceTracking({
    componentName: 'Layout',
    logSlowRenders: true
  });
  
  // Memoize content width class to prevent unnecessary re-renders
  const contentWidthClass = useMemo(() => {
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
  }, [contentWidth]);
  
  const handleLayoutClick = () => {
    const trackingFn = trackInteraction('layout-click');
    if (trackingFn) trackingFn();
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors",
        fullHeight ? "min-h-screen" : ""
      )}
      role="main"
      onClick={handleLayoutClick}
    >
      {/* Only show background if not explicitly removed */}
      {!removeBackground && <SimpleFallbackBackground />}
      
      {/* Main content with improved spacing and z-indexing */}
      <main className={cn(
        "container mx-auto px-4 py-8 relative z-10",
        contentWidthClass,
        centerContent && "flex flex-col items-center justify-center",
        fullHeight && "min-h-screen",
        className
      )}>
        {/* Skip link for keyboard users for better accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 z-50">
          Skip to main content
        </a>
        
        {/* Main content area with proper semantic structure */}
        <div id="main-content" className="focus:outline-none w-full" tabIndex={-1}>
          {children}
        </div>
      </main>
      
      {/* Performance configuration dashboard - only in development */}
      {showDevTools && process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <PerfConfigDashboard />
        </Suspense>
      )}
    </div>
  );
};

export default Layout;
