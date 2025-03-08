
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { Button } from '@/components/ui/button';

interface PerformanceInsightsProps {
  compact?: boolean;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ compact = false }) => {
  const [metrics, setMetrics] = React.useState(() => performanceMonitor.getMetrics());
  
  const refreshMetrics = () => {
    setMetrics(performanceMonitor.getMetrics());
  };
  
  React.useEffect(() => {
    refreshMetrics();
    
    const intervalId = setInterval(refreshMetrics, 5000);
    return () => clearInterval(intervalId);
  }, []);
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Performance</h3>
          <Button variant="ghost" size="sm" onClick={refreshMetrics}>
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted p-2 rounded">
            <span className="block text-muted-foreground">FPS</span>
            <span className="font-mono">{metrics.fps.toFixed(1)}</span>
          </div>
          <div className="bg-muted p-2 rounded">
            <span className="block text-muted-foreground">Memory</span>
            <span className="font-mono">{(metrics.memory / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Performance Metrics</span>
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">FPS</div>
            <div className="text-2xl font-bold font-mono">{metrics.fps.toFixed(1)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Memory Usage</div>
            <div className="text-2xl font-bold font-mono">{(metrics.memory / 1024 / 1024).toFixed(1)} MB</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">DOM Nodes</div>
            <div className="text-2xl font-bold font-mono">{metrics.domNodes}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Render Time</div>
            <div className="text-2xl font-bold font-mono">{metrics.renderTime.toFixed(2)} ms</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
