
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePersonalization } from '@/hooks/usePersonalization';
import { BarChart3, RotateCw } from 'lucide-react';
import MetricsCardSkeleton from './metrics/MetricsCardSkeleton';
import MetricsEmptyState from './metrics/MetricsEmptyState';
import MetricsGrid from './metrics/MetricsGrid';

interface PersonalizationMetricsCardProps {
  compact?: boolean;
}

const PersonalizationMetricsCard: React.FC<PersonalizationMetricsCardProps> = ({ compact = false }) => {
  const { metrics, refreshMetrics, isLoading, isUpdating } = usePersonalization();
  
  if (isLoading) {
    return <MetricsCardSkeleton />;
  }
  
  if (!metrics) {
    return <MetricsEmptyState onCalculateMetrics={refreshMetrics} isUpdating={isUpdating} />;
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
        <MetricsGrid metrics={metrics} compact={compact} />
        
        {!compact && (
          <div className="text-xs text-muted-foreground pt-2">
            Last updated: {formattedDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizationMetricsCard;
