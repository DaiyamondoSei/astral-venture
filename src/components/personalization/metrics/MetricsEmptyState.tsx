
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

interface MetricsEmptyStateProps {
  onCalculateMetrics: () => void;
  isUpdating: boolean;
}

const MetricsEmptyState: React.FC<MetricsEmptyStateProps> = ({ onCalculateMetrics, isUpdating }) => {
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
          <Button onClick={onCalculateMetrics} disabled={isUpdating}>
            Calculate Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsEmptyState;
