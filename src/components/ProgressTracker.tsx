
import React from 'react';
import { cn } from "@/lib/utils";
import GlowEffect from './GlowEffect';

interface ProgressTrackerProps {
  progress: number; // 0-100
  className?: string;
  label?: string;
}

const ProgressTracker = ({ progress, className, label }: ProgressTrackerProps) => {
  // Calculate color based on progress
  const getColor = () => {
    if (progress < 30) return 'from-quantum-300 to-quantum-500';
    if (progress < 60) return 'from-astral-300 to-astral-500';
    return 'from-ethereal-300 to-ethereal-500';
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="text-sm font-medium mb-1 text-muted-foreground">{label}</div>
      )}
      <div className="relative h-4 bg-black/10 rounded-full overflow-hidden">
        <GlowEffect 
          className={cn(
            "absolute h-full left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            getColor()
          )}
          animation="pulse"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-right font-medium text-muted-foreground">
        {progress}%
      </div>
    </div>
  );
};

export default ProgressTracker;
