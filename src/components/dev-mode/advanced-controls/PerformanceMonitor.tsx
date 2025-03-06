
import React from 'react';
import { Activity, BarChart, Cpu, Zap, Play, Pause, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceMonitorProps {
  isMonitoring: boolean;
  setIsMonitoring: (value: boolean) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isMonitoring,
  setIsMonitoring
}) => {
  const { metrics, history, status } = usePerformanceMonitor(isMonitoring);
  
  return (
    <Card className="bg-black/50 border border-white/10 mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg flex items-center">
            <Activity size={16} className="mr-2" />
            Performance Monitor
          </CardTitle>
          <Badge className={`${isMonitoring ? 'bg-green-500/80' : 'bg-gray-500/50'}`}>
            {isMonitoring ? 'Active' : 'Paused'}
          </Badge>
        </div>
        <CardDescription>
          Track rendering performance metrics in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="border-white/10 bg-transparent text-white/80"
          >
            {isMonitoring ? (
              <>
                <Pause size={14} className="mr-1" />
                Pause Monitoring
              </>
            ) : (
              <>
                <Play size={14} className="mr-1" />
                Start Monitoring
              </>
            )}
          </Button>
          
          {isMonitoring && (
            <Badge className={`${status.color} text-white`}>
              {status.label}
            </Badge>
          )}
        </div>
        
        {isMonitoring && (
          <div className="space-y-3 mt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm flex items-center">
                  <Zap size={14} className="mr-1" /> FPS
                </span>
                <span className="text-white/90 text-sm">{metrics.fps}</span>
              </div>
              <Progress value={Math.min(metrics.fps / 60 * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm flex items-center">
                  <Clock size={14} className="mr-1" /> Render Time
                </span>
                <span className="text-white/90 text-sm">{metrics.renderTime} ms</span>
              </div>
              <Progress value={Math.min(metrics.renderTime / 16 * 100, 100)} className="h-2" />
            </div>
            
            {metrics.memoryUsage > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70 text-sm flex items-center">
                    <Cpu size={14} className="mr-1" /> Memory Usage
                  </span>
                  <span className="text-white/90 text-sm">{metrics.memoryUsage} MB</span>
                </div>
                <Progress value={Math.min(metrics.memoryUsage / 200 * 100, 100)} className="h-2" />
              </div>
            )}
            
            <div className="h-20 flex items-end gap-1 mt-4 pb-1 border-b border-white/10">
              {history.map((metric, i) => (
                <div 
                  key={i}
                  style={{ 
                    height: `${Math.min(metric.fps / 60 * 100, 100)}%`,
                    backgroundColor: metric.fps > 50 ? '#22c55e' : 
                                    metric.fps > 30 ? '#eab308' : 
                                    '#ef4444'
                  }}
                  className="flex-1 rounded-t-sm"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/40 px-1">
              <span>Earlier</span>
              <span>Recent</span>
            </div>
          </div>
        )}
        
        {!isMonitoring && (
          <div className="flex items-center justify-center h-32 text-white/40 text-sm">
            <div className="text-center">
              <BarChart size={24} className="mx-auto mb-2 opacity-30" />
              Click "Start Monitoring" to track performance
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
