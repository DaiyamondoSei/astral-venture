
import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';
import { Settings, X, BarChart, AlertTriangle, ArrowRight } from 'lucide-react';

/**
 * Component that shows performance insights and suggestions for improvement
 * Only rendered in development mode
 */
const PerformanceInsights: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'bottlenecks' | 'summary' | 'suggestions'>('bottlenecks');
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  
  // Refresh data periodically
  useEffect(() => {
    if (!isOpen) return;
    
    const intervalId = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [isOpen]);
  
  // Get performance bottlenecks
  const bottlenecks = performanceMonitor.getPerformanceBottlenecks();
  const summary = performanceMonitor.getPerformanceSummary();
  
  // Generate optimization suggestions based on performance metrics
  const generateSuggestions = () => {
    const suggestions: { component: string; suggestion: string; priority: 'high' | 'medium' | 'low' }[] = [];
    
    bottlenecks.forEach(({ component, issues }) => {
      if (issues.some(i => i.includes('Slow render time'))) {
        suggestions.push({
          component: component.componentName,
          suggestion: `Consider memoizing ${component.componentName} with React.memo or breaking it into smaller components.`,
          priority: 'high'
        });
      }
      
      if (issues.some(i => i.includes('High prop count'))) {
        suggestions.push({
          component: component.componentName,
          suggestion: `${component.componentName} receives too many props. Consider using component composition or context.`,
          priority: 'medium'
        });
      }
      
      if (issues.some(i => i.includes('High state variable count'))) {
        suggestions.push({
          component: component.componentName,
          suggestion: `${component.componentName} manages too many state variables. Consider using useReducer or splitting into smaller components.`,
          priority: 'medium'
        });
      }
    });
    
    return suggestions;
  };
  
  const suggestions = generateSuggestions();
  
  // If not in development, don't render anything
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-quantum-800/90 p-2 rounded-full hover:bg-quantum-700/90 transition-colors"
        title="Performance Insights"
      >
        <BarChart size={16} className="text-white/90" />
      </button>
      
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg absolute bottom-12 right-0 w-96 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-quantum-700 text-white p-3">
            <h3 className="font-medium">Performance Insights</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex border-b">
            <button
              className={`px-3 py-2 text-sm flex-1 ${activeTab === 'bottlenecks' ? 'bg-quantum-100 border-b-2 border-quantum-500' : ''}`}
              onClick={() => setActiveTab('bottlenecks')}
            >
              Bottlenecks
            </button>
            <button
              className={`px-3 py-2 text-sm flex-1 ${activeTab === 'summary' ? 'bg-quantum-100 border-b-2 border-quantum-500' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button
              className={`px-3 py-2 text-sm flex-1 ${activeTab === 'suggestions' ? 'bg-quantum-100 border-b-2 border-quantum-500' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions
            </button>
          </div>
          
          <div className="overflow-y-auto p-3 flex-1 custom-scrollbar">
            {activeTab === 'bottlenecks' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Components that exceed performance thresholds:
                </p>
                
                {bottlenecks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No performance bottlenecks detected</p>
                  </div>
                ) : (
                  bottlenecks.map(({ component, issues }) => (
                    <div key={component.componentName} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-start">
                        <AlertTriangle size={16} className="text-amber-500 mt-1 mr-2" />
                        <div>
                          <h4 className="font-medium">{component.componentName}</h4>
                          <ul className="mt-1 space-y-1">
                            {issues.map((issue, i) => (
                              <li key={i} className="text-sm text-gray-600">• {issue}</li>
                            ))}
                          </ul>
                          {component.renderPath.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Render path:</p>
                              <div className="flex items-center flex-wrap mt-1">
                                {component.renderPath.map((parent, i) => (
                                  <React.Fragment key={i}>
                                    <span className="text-xs">{parent}</span>
                                    {i < component.renderPath.length - 1 && (
                                      <ArrowRight size={10} className="mx-1 text-gray-400" />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-500">Components Tracked</p>
                    <p className="font-medium text-lg">{summary.totalComponents}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-500">Slow Components</p>
                    <p className="font-medium text-lg">{summary.slowComponents}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-500">Avg Render Time</p>
                    <p className="font-medium text-lg">{summary.averageRenderTime.toFixed(2)}ms</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm">Slowest Components</h4>
                  {summary.worstComponents.length > 0 ? (
                    <div className="space-y-2">
                      {summary.worstComponents.map((comp) => (
                        <div key={comp.name} className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span className="text-sm">{comp.name}</span>
                          <span className={`text-sm ${comp.renderTime > 16 ? 'text-red-500' : 'text-amber-500'}`}>
                            {comp.renderTime.toFixed(2)}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Suggestions for improving application performance:
                </p>
                
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No specific suggestions available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, i) => (
                      <div 
                        key={i} 
                        className={`border rounded-md p-3 ${
                          suggestion.priority === 'high' 
                            ? 'border-red-200 bg-red-50' 
                            : suggestion.priority === 'medium' 
                              ? 'border-amber-200 bg-amber-50' 
                              : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <h4 className="font-medium text-sm">{suggestion.component}</h4>
                        <p className="text-sm mt-1">{suggestion.suggestion}</p>
                        <div className="mt-2 flex justify-end">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            suggestion.priority === 'high' 
                              ? 'bg-red-200 text-red-800' 
                              : suggestion.priority === 'medium' 
                                ? 'bg-amber-200 text-amber-800' 
                                : 'bg-blue-200 text-blue-800'
                          }`}>
                            {suggestion.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-sm mb-2">General Best Practices</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Use React.memo for components that render often with the same props</li>
                    <li>• Implement useCallback for functions passed as props</li>
                    <li>• Use useMemo for expensive calculations</li>
                    <li>• Avoid inline object creation in render functions</li>
                    <li>• Use the useId hook instead of Math.random()</li>
                    <li>• Virtualize long lists with react-window or similar libraries</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t flex justify-between items-center bg-gray-50 text-xs text-gray-500">
            <span>Refreshed {refreshCounter} times</span>
            <button 
              onClick={() => performanceMonitor.reset()}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;
