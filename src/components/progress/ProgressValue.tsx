
import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const ProgressValue: React.FC<ProgressValueProps> = ({ 
  value, 
  prefix = '', 
  suffix = '%',
  className 
}) => {
  return (
    <div className={cn("text-sm font-medium text-right mt-1", className)}>
      <span className="text-muted-foreground">{prefix}</span>
      <span>{Math.round(value)}</span>
      <span className="text-muted-foreground">{suffix}</span>
    </div>
  );
};

export default ProgressValue;
