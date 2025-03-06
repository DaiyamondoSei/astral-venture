
import React from 'react';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import GlowEffect from './GlowEffect';

interface ProgressTrackerProps {
  progress: number; // 0-100
  className?: string;
  label?: string;
  showPercentage?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const ProgressTracker = ({ 
  progress, 
  className, 
  label, 
  showPercentage = true,
  glowIntensity = 'medium',
  size = 'md',
  labelPosition = 'top'
}: ProgressTrackerProps) => {
  // Calculate color based on progress
  const getColor = () => {
    if (progress < 30) return 'from-quantum-300 to-quantum-500';
    if (progress < 60) return 'from-astral-300 to-astral-500';
    return 'from-ethereal-300 to-ethereal-500';
  };

  // Calculate height based on size
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'md': return 'h-4';
      case 'lg': return 'h-6';
      default: return 'h-4';
    }
  };

  // Calculate glow intensity
  const getGlowEffect = () => {
    switch (glowIntensity) {
      case 'low': return 'pulse-subtle';
      case 'high': return 'pulse-intense';
      default: return 'pulse';
    }
  };

  return (
    <div className={cn(
      "w-full", 
      {
        'flex items-center gap-3': labelPosition === 'left' || labelPosition === 'right',
      },
      className
    )}>
      {(label && (labelPosition === 'top' || labelPosition === 'left')) && (
        <div className={cn(
          "text-sm font-medium text-muted-foreground",
          { 'mb-1': labelPosition === 'top' }
        )}>
          {label}
        </div>
      )}
      
      <div className={cn("relative bg-black/10 rounded-full overflow-hidden", getHeight())}>
        <GlowEffect 
          className={cn(
            "absolute h-full left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            getColor()
          )}
          animation={getGlowEffect()}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className="mt-1 text-xs text-right font-medium text-muted-foreground">
          {progress}%
        </div>
      )}
      
      {(label && (labelPosition === 'bottom' || labelPosition === 'right')) && (
        <div className={cn(
          "text-sm font-medium text-muted-foreground",
          { 'mt-1': labelPosition === 'bottom' }
        )}>
          {label}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
