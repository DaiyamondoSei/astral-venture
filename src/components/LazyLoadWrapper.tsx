
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallbackHeight?: string;
  className?: string;
}

/**
 * A wrapper component that provides a consistent loading experience
 * for lazily loaded components with Suspense
 */
const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallbackHeight = '300px',
  className = '',
}) => {
  return (
    <Suspense
      fallback={
        <div 
          className={`flex items-center justify-center ${className}`}
          style={{ minHeight: fallbackHeight }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-quantum-500" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyLoadWrapper;
