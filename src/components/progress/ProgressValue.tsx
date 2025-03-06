
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface ProgressValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  showPercentSign?: boolean;
  format?: (value: number) => string;
  animate?: boolean;
  initialValue?: number;
  duration?: number;
  roundTo?: number;
}

const ProgressValue: React.FC<ProgressValueProps> = ({ 
  value, 
  prefix = '', 
  suffix = '',
  showPercentSign = true,
  format,
  className,
  animate = false,
  initialValue,
  duration = 1000,
  roundTo = 0
}) => {
  // Format the value, allowing for custom formatting or rounding to specified decimal places
  const formatValue = (val: number) => {
    if (format) {
      return format(val);
    }
    return roundTo > 0 ? val.toFixed(roundTo) : Math.round(val);
  };
  
  const displayValue = formatValue(value);
  const percentSign = showPercentSign ? '%' : '';
  
  // If animation is enabled, use motion component
  if (animate) {
    return (
      <div className={cn("text-sm font-medium text-right mt-1", className)}>
        <span className="text-muted-foreground">{prefix}</span>
        <motion.span
          initial={{ opacity: 0.5, y: 5 }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{ 
            duration: duration / 1000,
            ease: "easeOut" 
          }}
        >
          {displayValue}
        </motion.span>
        <span className="text-muted-foreground">{suffix}{percentSign}</span>
      </div>
    );
  }
  
  // Standard non-animated version
  return (
    <div className={cn("text-sm font-medium text-right mt-1", className)}>
      <span className="text-muted-foreground">{prefix}</span>
      <span>{displayValue}</span>
      <span className="text-muted-foreground">{suffix}{percentSign}</span>
    </div>
  );
};

export default ProgressValue;
