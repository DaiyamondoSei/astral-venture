
import React from 'react';
import { Activity, BarChart3, Gauge, Heart, TrendingDown, TrendingUp } from 'lucide-react';
import ProgressValue from '@/components/progress/ProgressValue';

export interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description?: string;
  showPercentSign?: boolean;
  prefix?: string;
  compact?: boolean;
}

export const getIconByMetricType = (metricType: string, value?: number) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Engagement': <Activity />,
    'Engagement Score': <Activity />,
    'Content Relevance': <Gauge />,
    'Chakra Balance': <Heart />,
    'Chakra Balance Improvement': <Heart />,
    'Growth Rate': <TrendingUp />,
    'Emotional Growth Rate': <TrendingUp />,
    'Progress Acceleration': value && value >= 0 ? <TrendingUp /> : <TrendingDown />
  };
  
  return iconMap[metricType] || <BarChart3 />;
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
  // Determine color based on value
  const getColorClass = () => {
    if (label.includes('Balance') || label.includes('Acceleration') || label.includes('Growth')) {
      if (value > 20) return "text-green-500";
      if (value > 0) return "text-green-400";
      if (value === 0) return "text-gray-400";
      if (value > -20) return "text-orange-400";
      return "text-red-500";
    } else {
      if (value >= 75) return "text-green-500";
      if (value >= 50) return "text-green-400";
      if (value >= 25) return "text-blue-400";
      return "text-orange-400";
    }
  };
  
  if (compact) {
    return (
      <div className="p-3 border rounded-md">
        <div className="flex items-center gap-2 mb-1">
          <div className={`${getColorClass()}`}>{icon}</div>
          <p className="text-xs font-medium">{label}</p>
        </div>
        <p className={`text-xl font-medium ${getColorClass()}`}>
          {prefix}{Math.round(value)}{showPercentSign ? '%' : ''}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`${getColorClass()}`}>{icon}</div>
        <p className="font-medium">{label}</p>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getColorClass()}`} 
          style={{ width: `${Math.min(100, Math.max(0, value + 50))}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {label.includes('Balance') || label.includes('Acceleration') ? 'Change' : 'Score'}
        </p>
        <ProgressValue 
          value={value} 
          prefix={prefix} 
          showPercentSign={showPercentSign}
          className={getColorClass()}
        />
      </div>
    </div>
  );
};

export default MetricItem;
