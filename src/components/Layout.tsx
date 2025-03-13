
import React from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  performanceTracking?: {
    componentName?: string;
    trackRenders?: boolean;
    trackInteractions?: boolean;
    trackSize?: boolean;
  };
}

/**
 * Main layout component for application pages
 * 
 * Provides consistent structure and styling for pages
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  performanceTracking
}) => {
  const { deviceCapability } = usePerformance();
  
  // Determine background classes based on device capability
  const bgClasses = React.useMemo(() => {
    // Base background classes
    const baseClasses = 'bg-gradient-to-b from-background/80 to-background';
    
    // Add additional effects for higher-end devices
    if (deviceCapability === 'high' || deviceCapability === 'medium') {
      return `${baseClasses} bg-dot-pattern`;
    }
    
    return baseClasses;
  }, [deviceCapability]);

  return (
    <div 
      className={`min-h-screen ${bgClasses} ${className}`}
      data-performance-tracked={!!performanceTracking?.componentName}
    >
      {children}
    </div>
  );
};

export default Layout;
