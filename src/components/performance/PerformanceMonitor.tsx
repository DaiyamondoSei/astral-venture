
import React, { useState, useEffect } from 'react';
import { usePerformance } from '../../contexts/PerformanceContext';
import { PerformanceData } from '../../hooks/usePerformanceTracking';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  componentFilter?: string[];
  refreshIntervalMs?: number;
  maxHistory?: number;
}

/**
 * Component for monitoring and visualizing performance metrics
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  componentFilter = [],
  refreshIntervalMs = 2000,
  maxHistory = 100
}) => {
  const { getAllComponentStats, config } = usePerformance();
  const [stats, setStats] = useState<Record<string, PerformanceData>>({});
  const [history, setHistory] = useState<Array<{ timestamp: number; metrics: Record<string, PerformanceData> }>>([]);
  
  // Update stats at regular intervals
  useEffect(() => {
    if (!config.enablePerformanceTracking) return;
    
    const updateStats = () => {
      const currentStats = getAllComponentStats();
      setStats(currentStats);
      
      // Add to history with timestamp
      setHistory(prev => {
        const newHistory = [
          ...prev, 
          { timestamp: Date.now(), metrics: { ...currentStats } }
        ];
        
        // Limit history size
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory);
        }
        
        return newHistory;
      });
    };
    
    // Update immediately and then at intervals
    updateStats();
    const interval = setInterval(updateStats, refreshIntervalMs);
    
    return () => clearInterval(interval);
  }, [config.enablePerformanceTracking, refreshIntervalMs, maxHistory]);
  
  // If performance tracking is disabled, don't render
  if (!config.enablePerformanceTracking) {
    return null;
  }
  
  // Filter stats by component name if filter is provided
  const filteredStats = componentFilter.length > 0
    ? Object.entries(stats).filter(([name]) => componentFilter.includes(name))
      .reduce((acc, [name, data]) => ({ ...acc, [name]: data }), {})
    : stats;
  
  // Get the slowest components
  const slowestComponents = Object.entries(filteredStats)
    .sort(([, a], [, b]) => b.averageRenderTime - a.averageRenderTime)
    .slice(0, 5);
  
  return (
    <div className="bg-background border rounded-lg shadow-sm p-4 text-sm">
      <h3 className="text-lg font-medium mb-3">Performance Monitor</h3>
      
      {Object.keys(filteredStats).length === 0 ? (
        <p className="text-muted-foreground">No performance data available yet</p>
      ) : (
        <>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Slowest Components</h4>
            <div className="space-y-1.5">
              {slowestComponents.map(([name, data]) => (
                <div key={name} className="flex justify-between items-center">
                  <div className="flex-1 truncate" title={name}>
                    {name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-2 ${getPerformanceColorClass(data.averageRenderTime)}`} 
                      style={{ width: `${Math.min(100, data.averageRenderTime)}px` }}
                    />
                    <span className="text-xs tabular-nums">
                      {data.averageRenderTime.toFixed(1)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Component Details</h4>
              <div className="text-xs max-h-60 overflow-y-auto space-y-4">
                {Object.entries(filteredStats).map(([name, data]) => (
                  <div key={name} className="space-y-1">
                    <h5 className="font-medium">{name}</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>Render count:</div>
                      <div className="text-right tabular-nums">{data.renderCount}</div>
                      
                      <div>Average render time:</div>
                      <div className="text-right tabular-nums">{data.averageRenderTime.toFixed(2)}ms</div>
                      
                      <div>Last render time:</div>
                      <div className="text-right tabular-nums">{data.lastRenderTime.toFixed(2)}ms</div>
                      
                      {data.mountTime && (
                        <>
                          <div>Mount time:</div>
                          <div className="text-right tabular-nums">{data.mountTime.toFixed(2)}ms</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to get color class based on performance
function getPerformanceColorClass(renderTime: number): string {
  if (renderTime < 8) {
    return 'bg-green-500';
  } else if (renderTime < 16) {
    return 'bg-yellow-500';
  } else if (renderTime < 50) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
}

export default PerformanceMonitor;
