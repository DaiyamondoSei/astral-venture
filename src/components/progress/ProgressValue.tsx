
import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  showPercentSign?: boolean;
  format?: (value: number) => string;
}

const ProgressValue: React.FC<ProgressValueProps> = ({ 
  value, 
  prefix = '', 
  suffix = '',
  showPercentSign = true,
  format,
  className 
}) => {
  const displayValue = format ? format(value) : Math.round(value);
  const percentSign = showPercentSign ? '%' : '';
  
  return (
    <div className={cn("text-sm font-medium text-right mt-1", className)}>
      <span className="text-muted-foreground">{prefix}</span>
      <span>{displayValue}</span>
      <span className="text-muted-foreground">{suffix}{percentSign}</span>
    </div>
  );
};

export default ProgressValue;
