
import React, { useEffect, useState } from 'react';
import GlowEffect from './GlowEffect';
import EntryAnimation from './EntryAnimation';

const LoadingScreen: React.FC<{ onComplete?: () => void, progress?: number, message?: string, showAnimation?: boolean }> = ({ 
  onComplete,
  progress = 0,
  message = "Loading...",
  showAnimation = true
}) => {
  const [loadingProgress, setLoadingProgress] = useState(progress);
  
  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete && onComplete();
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    
    // Performance mark for loading start
    performance.mark("loading-screen:start");
    
    return () => {
      clearInterval(interval);
      // Performance mark for loading end
      performance.mark("loading-screen:end");
      performance.measure("loading-screen", "loading-screen:start", "loading-screen:end");
    };
  }, [onComplete]);
  
  // Render loading animation
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        {showAnimation ? (
          <EntryAnimation initialState="orb" />
        ) : (
          <GlowEffect className="w-20 h-20 rounded-full bg-quantum-500" animation="pulse" />
        )}
        
        <div className="mt-8 relative w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-quantum-500 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <p className="mt-4 text-quantum-100 animate-pulse">
          {message}
        </p>
        
        <p className="text-sm text-quantum-300 mt-2">
          {loadingProgress}%
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
