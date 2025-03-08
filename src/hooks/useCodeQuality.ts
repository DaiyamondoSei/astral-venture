
import { useEffect, useState } from 'react';
import { componentAnalyzer } from '@/utils/performance/ComponentAnalyzer';
import { renderAnalyzer } from '@/utils/performance/RenderAnalyzer';

export type CodeQualityIssue = {
  id: string;
  component: string;
  type: 'performance' | 'complexity' | 'architecture' | 'render';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  affectedFiles?: string[];
};

/**
 * Hook to provide unified analysis of code quality issues
 * 
 * @param componentName Current component name for focused analysis
 * @param refreshInterval How often to refresh the analysis (in ms)
 * @returns Object containing code quality issues and stats
 */
export function useCodeQuality(
  componentName?: string,
  refreshInterval = 5000
) {
  const [issues, setIssues] = useState<CodeQualityIssue[]>([]);
  const [stats, setStats] = useState({
    componentsAnalyzed: 0,
    totalIssues: 0,
    criticalIssues: 0,
    highPriorityIssues: 0,
    lastUpdated: new Date()
  });
  
  // Refresh the code quality analysis at specified interval
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Initial analysis
    performAnalysis();
    
    // Set up interval for refreshing
    const intervalId = setInterval(performAnalysis, refreshInterval);
    
    return () => clearInterval(intervalId);
    
    function performAnalysis() {
      // Get component issues from component analyzer
      const componentIssues = componentAnalyzer.findComponentsWithIssues()
        .flatMap(analysis => {
          return analysis.issues.map(issue => ({
            id: `component-${analysis.component.name}-${issue.type}`,
            component: analysis.component.name,
            type: issue.type as any,
            severity: mapSeverityToPriority(issue.severity),
            description: issue.description,
            suggestion: issue.suggestion,
            affectedFiles: [analysis.component.name]
          }));
        });
      
      // Get render issues from render analyzer
      const renderIssues = renderAnalyzer.findComponentsWithPerformanceIssues()
        .flatMap(analysis => {
          return analysis.suggestions.map(suggestion => ({
            id: `render-${analysis.component}-${suggestion.type}`,
            component: analysis.component,
            type: 'render',
            severity: mapSeverityToPriority(suggestion.priority),
            description: `${analysis.component}: ${suggestion.description}`,
            suggestion: getRecommendationForIssue(suggestion.type),
            affectedFiles: [analysis.component]
          }));
        });
      
      // Combine all issues
      const allIssues = [...componentIssues, ...renderIssues];
      
      // Filter issues if a specific component is selected
      const filteredIssues = componentName 
        ? allIssues.filter(issue => issue.component === componentName)
        : allIssues;
      
      // Sort by severity
      const sortedIssues = filteredIssues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
      
      // Update state
      setIssues(sortedIssues);
      setStats({
        componentsAnalyzed: componentAnalyzer['components'].size,
        totalIssues: allIssues.length,
        criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
        highPriorityIssues: allIssues.filter(i => i.severity === 'high').length,
        lastUpdated: new Date()
      });
    }
  }, [componentName, refreshInterval]);
  
  return { issues, stats };
}

// Helper functions
function mapSeverityToPriority(severity: string): CodeQualityIssue['severity'] {
  switch (severity) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

function getRecommendationForIssue(type: string): string {
  switch (type) {
    case 'memo':
      return 'Wrap component with React.memo() to prevent unnecessary re-renders';
    case 'callback':
      return 'Use useCallback() for functions passed as props to child components';
    case 'state':
      return 'Consider using useReducer() instead of multiple useState hooks, or reorganize your component logic';
    case 'prop-drilling':
      return 'Use Context API or state management library to avoid passing props through multiple components';
    case 'complexity':
      return 'Break down this component into smaller, more focused components';
    default:
      return 'Review component implementation for optimizations';
  }
}

export default useCodeQuality;
