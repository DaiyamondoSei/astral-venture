
import React from 'react';
import { Activity, BarChart, Heart, Sparkles, TrendingUp } from 'lucide-react';

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description?: string;
  showPercentSign?: boolean;
  prefix?: string;
  compact?: boolean;
}

export const getIconByMetricType = (metricType: string, value?: number) => {
  switch (metricType) {
    case 'Engagement':
    case 'Engagement Score':
      return <Activity className="h-4 w-4" />;
    case 'Content Relevance':
      return <BarChart className="h-4 w-4" />;
    case 'Chakra Balance':
    case 'Chakra Balance Improvement':
      return <Sparkles className="h-4 w-4" />;
    case 'Growth Rate':
    case 'Emotional Growth Rate':
      return <Heart className="h-4 w-4" />;
    case 'Progress Acceleration':
      return <TrendingUp className={`h-4 w-4 ${value && value > 0 ? 'text-green-500' : value && value < 0 ? 'text-red-500' : ''}`} />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const MetricItem: React.FC<MetricItemProps> = ({
  icon,
  label,
  value,
  description,
  showPercentSign = false,
  prefix = '',
  compact = false
}) => {
  const formattedValue = `${prefix}${value}${showPercentSign ? '%' : ''}`;
  
  if (compact) {
    return (
      <div className="flex flex-col items-center p-3 bg-background/50 rounded-lg border">
        <div className="bg-primary/10 p-2 rounded-full mb-2">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-2xl font-bold">{formattedValue}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-start space-x-4 p-4 bg-background/50 rounded-lg border">
      <div className="bg-primary/10 p-3 rounded-full">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-3xl font-bold">{formattedValue}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default MetricItem;
