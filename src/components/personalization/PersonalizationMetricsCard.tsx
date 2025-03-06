
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalizationMetrics } from '@/services/personalization';
import { usePersonalization } from '@/hooks/usePersonalization';
import { RotateCw, BarChart3, TrendingUp, TrendingDown, Activity, Gauge, Heart } from 'lucide-react';
import ProgressValue from '@/components/progress/ProgressValue';

interface PersonalizationMetricsCardProps {
  compact?: boolean;
}

const PersonalizationMetricsCard: React.FC<PersonalizationMetricsCardProps> = ({ compact = false }) => {
  const { metrics, refreshMetrics, isLoading, isUpdating } = usePersonalization();
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-card-foreground/10 h-6 w-1/3 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-card-foreground/10 h-4 w-2/3 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="bg-card-foreground/10 h-4 w-1/4 rounded"></div>
              <div className="bg-card-foreground/10 h-6 w-full rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} />
            Personalization Impact
          </CardTitle>
          <CardDescription>
            See how personalization is improving your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <BarChart3 size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Metrics not available yet</p>
            <Button onClick={() => refreshMetrics()} disabled={isUpdating}>
              Calculate Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format date
  const lastUpdated = new Date(metrics.lastUpdated);
  const formattedDate = lastUpdated.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return (
    <Card className="w-full">
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? 'pb-2' : 'pb-4'}`}>
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} />
            Personalization Impact
          </CardTitle>
          {!compact && (
            <CardDescription>
              See how personalization is improving your experience
            </CardDescription>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => refreshMetrics()} disabled={isUpdating}>
          <RotateCw size={16} className={isUpdating ? "animate-spin" : ""} />
          <span className="sr-only">Refresh metrics</span>
        </Button>
      </CardHeader>
      <CardContent className={`space-y-${compact ? '4' : '6'} pt-2`}>
        {compact ? (
          <div className="grid grid-cols-2 gap-4">
            <MetricItem 
              icon={<Activity size={16} />}
              label="Engagement"
              value={metrics.engagementScore}
              showPercentSign
              compact
            />
            <MetricItem 
              icon={<Gauge size={16} />}
              label="Content Relevance"
              value={metrics.contentRelevanceRating}
              showPercentSign
              compact
            />
            <MetricItem 
              icon={<TrendingUp size={16} />}
              label="Growth Rate"
              value={metrics.emotionalGrowthRate}
              showPercentSign
              compact
            />
            <MetricItem 
              icon={<Heart size={16} />}
              label="Chakra Balance"
              value={metrics.chakraBalanceImprovement}
              prefix={metrics.chakraBalanceImprovement > 0 ? '+' : ''}
              compact
            />
          </div>
        ) : (
          <>
            <MetricItem 
              icon={<Activity size={20} />}
              label="Engagement Score"
              value={metrics.engagementScore}
              description="How actively you're using personalized features"
              showPercentSign
            />
            <MetricItem 
              icon={<Gauge size={20} />}
              label="Content Relevance"
              value={metrics.contentRelevanceRating}
              description="How well recommendations match your interests"
              showPercentSign
            />
            <MetricItem 
              icon={<Heart size={20} />}
              label="Chakra Balance Improvement"
              value={metrics.chakraBalanceImprovement}
              description="How your energy balance has changed over time"
              prefix={metrics.chakraBalanceImprovement > 0 ? '+' : ''}
            />
            <MetricItem 
              icon={<TrendingUp size={20} />}
              label="Emotional Growth Rate"
              value={metrics.emotionalGrowthRate}
              description="Improvement in emotional awareness through reflections"
              showPercentSign
            />
            <MetricItem 
              icon={metrics.progressAcceleration >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              label="Progress Acceleration"
              value={metrics.progressAcceleration}
              description="How your progress rate has changed over time"
              prefix={metrics.progressAcceleration > 0 ? '+' : ''}
            />
          </>
        )}
        
        {!compact && (
          <div className="text-xs text-muted-foreground pt-2">
            Last updated: {formattedDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description?: string;
  showPercentSign?: boolean;
  prefix?: string;
  compact?: boolean;
}

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

export default PersonalizationMetricsCard;
