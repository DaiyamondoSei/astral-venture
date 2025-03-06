import React from 'react';
import { cn } from '@/lib/utils';
import ProgressGlow from './progress/ProgressGlow';
import ProgressValue from './progress/ProgressValue';

export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ProgressTrackerProps {
  progress: number;
  label?: string;
  labelPosition?: LabelPosition;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  glowIntensity?: 'low' | 'medium' | 'high';
  animation?: 'none' | 'pulse' | 'slide' | 'ripple';
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  progress,
  label,
  labelPosition = 'top',
  showValue = false,
  valuePrefix = '',
  valueSuffix = '',
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
              animation={animation}
              colorScheme={colorScheme}
            />
          )}
        </div>
      </div>
      
      {/* Progress value (if enabled) */}
      {showValue && (
        <ProgressValue 
          value={normalizedProgress} 
          prefix={valuePrefix}
          suffix={valueSuffix}
        />
      )}
    </div>
  );
};

// Helper functions for styling
const getProgressHeight = (size: string) => {
  switch (size) {
    case 'sm': return 'h-1.5';
    case 'lg': return 'h-4';
    case 'md':
    default: return 'h-2.5';
  }
};

const getLayoutClass = (position: LabelPosition) => {
  switch (position) {
    case 'left': return 'flex items-center gap-3';
    case 'right': return 'flex flex-row-reverse items-center gap-3';
    case 'bottom': return 'flex flex-col-reverse gap-1';
    case 'top':
    default: return 'flex flex-col gap-1';
  }
};

const getLabelClass = (position: LabelPosition) => {
  switch (position) {
    case 'left': return 'flex-shrink-0 w-24 text-right';
    case 'right': return 'flex-shrink-0 w-24';
    default: return '';
  }
};

const getColorScheme = (colorScheme: string) => {
  // Check if it's a custom gradient
  if (colorScheme.includes('from-')) {
    return colorScheme;
  }
  
  // Otherwise use predefined color schemes
  switch (colorScheme) {
    case 'secondary': return 'bg-secondary';
    case 'accent': return 'bg-accent';
    case 'success': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    case 'quantum': return 'from-quantum-400 to-quantum-600 bg-gradient-to-r';
    case 'primary':
    default: return 'bg-primary';
  }
};

export default ProgressTracker;
