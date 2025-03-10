
import React, { Suspense } from 'react';
import { cn } from "@/lib/utils";
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import PerfConfigDashboard from './dev-mode/PerfConfigDashboard';

// Simple fallback background that doesn't block rendering
const SimpleFallbackBackground = () => (
  <div className="fixed inset-0 bg-white" aria-hidden="true" />
);

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  contentWidth?: 'narrow' | 'standard' | 'wide' | 'full';
  removeBackground?: boolean;
}

/**
 * Layout component with performance tracking and flexible content width
 */
const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  contentWidth = 'standard',
  removeBackground = false
}: LayoutProps) => {
  // Use enhanced performance tracking
  const { trackInteraction } = usePerformanceTracking({
    componentName: 'Layout',
    logSlowRenders: true,
    categories: ['layout', 'core']
  });
  
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
  
  const handleLayoutClick = () => {
    const trackMetadata = trackInteraction('layout-click');
    return trackMetadata();
  };
  
  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-white text-gray-800" 
      role="main"
      onClick={handleLayoutClick}
    >
      {/* Only show background if not explicitly removed */}
      {!removeBackground && <SimpleFallbackBackground />}
      
      {/* Main content with improved spacing and z-indexing */}
      <main className={cn(
        "container mx-auto px-4 py-8 relative z-10",
        getContentWidthClass(),
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
      
      {/* Performance configuration dashboard - only in development */}
      {process.env.NODE_ENV === 'development' && <PerfConfigDashboard />}
    </div>
  );
};

export default Layout;
