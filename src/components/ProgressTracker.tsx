
import React from 'react';
import { cn } from '@/lib/utils';
import ProgressGlow from './progress/ProgressGlow';
import ProgressValue from './progress/ProgressValue';
import { 
  ProgressTrackerProps,
  LabelPosition
} from './onboarding/data/types';
import {
  getColorScheme,
  getProgressHeight,
  getGlowAnimation,
  getLayoutClass,
  getLabelClass
} from './progress/utils';

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  progress,
  label,
  labelPosition = 'top',
  showValue = false,
  colorScheme = 'primary',
  size = 'md',
  glowIntensity = 'medium',
  animation = 'none',
  className
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);
  
  // Get style classes
  const progressHeight = getProgressHeight(size);
  const layoutClass = getLayoutClass(labelPosition);
  const labelClass = getLabelClass(labelPosition);
  const colorClasses = getColorScheme(colorScheme);
  const animationStyle = getGlowAnimation(animation);
  
  return (
    <div className={cn(
      'w-full',
      layoutClass,
      className
    )}>
      {/* Label (if provided) */}
      {label && (
        <div className={labelClass}>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className="relative w-full overflow-hidden bg-muted/30 rounded-full">
        <div className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0',
          progressHeight
        )}>
          {/* Progress background */}
          <div 
            className={cn(
              'absolute inset-0 rounded-full transition-all duration-500 ease-out',
              colorClasses
            )}
            style={{ width: `${normalizedProgress}%` }}
          />
          
          {/* Glow effect (if progress > 0) */}
          {normalizedProgress > 0 && (
            <ProgressGlow 
              progress={normalizedProgress}
              intensity={glowIntensity} 
              animation={animation as "pulse" | "slide" | "ripple" | "none"}
              colorScheme={colorScheme}
            />
          )}
        </div>
      </div>
      
      {/* Progress value (if enabled) */}
      {showValue && (
        <ProgressValue value={normalizedProgress} />
      )}
    </div>
  );
};

export default ProgressTracker;
