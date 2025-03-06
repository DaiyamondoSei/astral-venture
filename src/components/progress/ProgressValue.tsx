
import React from 'react';
import { cn } from "@/lib/utils";

interface ProgressValueProps {
  progress: number;
  showPercentage?: boolean;
  valueClassName?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

const ProgressValue: React.FC<ProgressValueProps> = ({
  progress,
  showPercentage = true,
  valueClassName,
  valuePrefix = '',
  valueSuffix = '%'
}) => {
  if (!showPercentage) return null;
  
  return (
    <div className={cn("mt-1 text-xs text-right font-medium text-muted-foreground", valueClassName)}>
      {valuePrefix}{progress}{valueSuffix}
    </div>
  );
};

export default ProgressValue;
