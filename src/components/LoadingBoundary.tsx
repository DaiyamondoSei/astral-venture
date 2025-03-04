
import React from 'react';

interface LoadingBoundaryProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * LoadingBoundary Component
 * 
 * Provides a consistent way to handle loading states across the application.
 * Shows a loading indicator or custom fallback when content is loading.
 */
const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  children,
  loadingFallback
}) => {
  if (isLoading) {
    return loadingFallback || (
      <div className="w-full flex items-center justify-center p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-indigo-300/50 border-l-indigo-300/70 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-indigo-200">
            Loading
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingBoundary;
