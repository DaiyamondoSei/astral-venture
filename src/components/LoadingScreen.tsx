
import React, { useEffect } from 'react';
import { ProgressCircle } from './ProgressCircle';
import { EntryAnimation } from './EntryAnimation';
import { motion } from 'framer-motion';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';

export const LoadingScreen: React.FC<{ 
  progress: number; 
  message?: string; 
  onComplete?: () => void; 
  showAnimation?: boolean;
}> = ({ 
  progress, 
  message = "Loading...", 
  onComplete, 
  showAnimation = true 
}) => {
  useEffect(() => {
    // Mark load start
    markStart('app_loading');
    
    // When progress reaches 100, mark load completion and call onComplete
    if (progress >= 100 && onComplete) {
      markEnd('app_loading', 'navigation');
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showAnimation ? (
        <div className="w-full max-w-xl">
          <EntryAnimation />
        </div>
      ) : (
        <div className="w-24 h-24 mb-8">
          <ProgressCircle progress={progress} />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h2 className="text-2xl font-light mb-2">{message}</h2>
        <p className="text-muted-foreground">{progress.toFixed(0)}% complete</p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
