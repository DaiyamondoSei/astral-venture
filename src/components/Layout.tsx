
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { usePerformance } from '@/contexts/PerformanceContext';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import { useComponentAnalysis } from '@/hooks/useComponentAnalysis';

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

const Layout = ({ 
  children, 
  className,
  contentWidth = 'standard',
  removeBackground = false
}: LayoutProps) => {
  const { 
    deviceCapability, 
    isLowPerformance
  } = usePerformance();
  
  // Track performance of this component
  usePerformanceTracking('Layout', { className, contentWidth, removeBackground });
  
  // Register with component analyzer
  useComponentAnalysis('Layout', {
    complexity: 20,
    dependencies: ['usePerformance', 'cn'],
    hooks: ['usePerformance', 'usePerformanceTracking', 'useComponentAnalysis'],
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
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-white text-gray-800" role="main">
      {/* Always show simple fallback */}
      <SimpleFallbackBackground />
      
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
    </div>
  );
};

export default Layout;
