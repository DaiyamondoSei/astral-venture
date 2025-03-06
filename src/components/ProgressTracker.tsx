
import React from 'react';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ProgressGlow from './progress/ProgressGlow';
import ProgressValue from './progress/ProgressValue';
import { 
  ProgressTrackerProps,
  LabelPosition
} from './progress/types';
import {
  getColorScheme,
  getProgressHeight,
  getGlowAnimation,
  getLayoutClass,
  getLabelClass
} from './progress/utils';

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  progress, 
  className, 
  label, 
  showPercentage = true,
  glowIntensity = 'medium',
  size = 'md',
  labelPosition = 'top',
  animation,
  colorScheme: userColorScheme,
  showValue = true,
  labelClassName,
  valueClassName,
  valuePrefix,
  valueSuffix
}) => {
  // Get color based on progress or user-specified color scheme
  const colorScheme = getColorScheme(progress, userColorScheme);
  
  // Get height based on size
  const heightClass = getProgressHeight(size);
  
  // Get animation style - comes from prop or derived from glowIntensity
  const animationStyle = getGlowAnimation(glowIntensity, animation);
  
  // Get layout class based on label position
  const layoutClass = getLayoutClass(labelPosition);
  
  // Get label positioning class
  const labelClass = getLabelClass(labelPosition, labelClassName);

  return (
    <div className={cn(layoutClass, className)}>
      {/* Label - shown based on position */}
      {(label && (labelPosition === 'top' || labelPosition === 'left')) && (
        <div className={labelClass}>
          {label}
        </div>
      )}
      
      {/* Progress bar container */}
      <div className={cn("relative bg-black/10 rounded-full overflow-hidden", heightClass)}>
        <ProgressGlow 
          progress={progress}
          colorScheme={colorScheme}
          animation={animationStyle}
        />
      </div>
      
      {/* Progress value */}
      {showValue && (
        <ProgressValue 
          progress={progress}
          showPercentage={showPercentage}
          valueClassName={valueClassName}
          valuePrefix={valuePrefix}
          valueSuffix={valueSuffix}
        />
      )}
      
      {/* Label - alternative positions */}
      {(label && (labelPosition === 'bottom' || labelPosition === 'right')) && (
        <div className={labelClass}>
          {label}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
