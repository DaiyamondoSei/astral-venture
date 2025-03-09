
import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { RenderAnalyzer, RenderAnalysis } from '@/utils/performance/RenderAnalyzer';
import { RenderFrequency, DeviceCapability } from '@/utils/performanceUtils';

interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  renderTimes?: number[];
  lastRenderTime?: number;
}

// Component to display insights about component rendering
const RenderInsights = () => {
  const [componentMetrics, setComponentMetrics] = useState<Record<string, ComponentMetric>>({});
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'renderCount' | 'renderTime'>('renderTime');
  const [showProblematicOnly, setShowProblematicOnly] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<string, RenderAnalysis>>({});
  
  // Fetch metrics on initial load and periodically
  useEffect(() => {
    // Initial fetch
    fetchMetrics();
    
    // Setup interval for periodic updates
    const interval = setInterval(fetchMetrics, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch component metrics from performance monitor
  const fetchMetrics = () => {
    const metrics = performanceMonitor.getComponentMetrics() as Record<string, ComponentMetric>;
    setComponentMetrics(metrics || {});
    
    // Analyze components for performance issues
    const results: Record<string, RenderAnalysis> = {};
    
    for (const [name, metric] of Object.entries(metrics || {})) {
      // Convert to format expected by RenderAnalyzer
      const analysis = RenderAnalyzer.getInstance().analyzeComponent({
        componentName: name,
        renderTime: metric.averageRenderTime || 0,
        renderCount: metric.renderCount || 0
      });
      
      results[name] = analysis;
    }
    
    setAnalysisResults(results);
  };
  
  // Get sorted list of components
  const getSortedComponents = (): [string, ComponentMetric][] => {
    if (!componentMetrics) return [];
    
    let entries = Object.entries(componentMetrics);
    
    // Filter problematic components if option is selected
    if (showProblematicOnly) {
      entries = entries.filter(([name, metrics]) => {
        return (
          metrics.renderCount > 30 || 
          metrics.averageRenderTime > 16 ||
          (analysisResults[name]?.lastRenderTime || 0) > 30
        );
      });
    }
    
    // Sort components
    return entries.sort(([nameA, metricsA], [nameB, metricsB]) => {
      if (sortBy === 'renderCount') {
        return (metricsB.renderCount || 0) - (metricsA.renderCount || 0);
      } else {
        return (metricsB.averageRenderTime || 0) - (metricsA.averageRenderTime || 0);
      }
    });
  };
  
  // Get render frequency classification
  const getRenderFrequencyClass = (frequency: RenderFrequency): string => {
    if (frequency === RenderFrequency.EXCESSIVE) return 'text-red-400';
    if (frequency === RenderFrequency.FREQUENT) return 'text-yellow-400';
    return 'text-green-400';
  };
  
  // Format optimization recommendations
  const formatOptimizationPoints = (analysis?: RenderAnalysis): JSX.Element | null => {
    if (!analysis || !analysis.possibleOptimizations || analysis.possibleOptimizations.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-2 text-xs">
        <h4 className="font-semibold mb-1">Possible optimizations:</h4>
        <ul className="list-disc pl-4 space-y-1 text-yellow-300">
          {analysis.possibleOptimizations.map((opt, idx) => (
            <li key={idx}>{opt}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Select a component to view detailed metrics
  const handleSelectComponent = (name: string) => {
    setSelectedComponent(name === selectedComponent ? null : name);
  };
  
  // Sort components by render count or render time
  const handleSort = (criteria: 'renderCount' | 'renderTime') => {
    setSortBy(criteria);
  };
  
  // Components sorted according to current criteria
  const sortedComponents = getSortedComponents();
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Component Render Insights</h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleSort('renderTime')}
            className={`px-2 py-1 text-xs rounded ${sortBy === 'renderTime' ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            Sort by render time
          </button>
          <button 
            onClick={() => handleSort('renderCount')}
            className={`px-2 py-1 text-xs rounded ${sortBy === 'renderCount' ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            Sort by render count
          </button>
          <label className="flex items-center text-xs">
            <input 
              type="checkbox" 
              checked={showProblematicOnly}
              onChange={() => setShowProblematicOnly(!showProblematicOnly)}
              className="mr-1"
            />
            Show problematic only
          </label>
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedComponents.map(([name, metrics]) => {
          const analysis = analysisResults[name];
          const renderFrequency = analysis?.renderFrequency || RenderFrequency.NORMAL;
          
          // Determine if this component has optimization potential
          const needsOptimization = 
            renderFrequency === RenderFrequency.EXCESSIVE || 
            renderFrequency === RenderFrequency.FREQUENT;
          
          return (
            <div 
              key={name}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedComponent === name ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'
              } ${needsOptimization ? 'border-l-2 border-yellow-500' : ''}`}
              onClick={() => handleSelectComponent(name)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">{name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRenderFrequencyClass(renderFrequency)}`}>
                  {renderFrequency}
                </span>
              </div>
              
              <div className="flex mt-1 text-xs text-gray-400">
                <div className="mr-4">
                  <span className="font-medium">Renders:</span> {metrics.renderCount || 0}
                </div>
                <div>
                  <span className="font-medium">Avg time:</span> {(metrics.averageRenderTime || 0).toFixed(2)}ms
                </div>
                <div className="ml-4">
                  <span className="font-medium">Last:</span> {(analysis?.lastRenderTime || 0).toFixed(2)}ms
                </div>
              </div>
              
              {selectedComponent === name && analysis && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  {formatOptimizationPoints(analysis)}
                </div>
              )}
            </div>
          );
        })}
        
        {sortedComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No component metrics available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default RenderInsights;
