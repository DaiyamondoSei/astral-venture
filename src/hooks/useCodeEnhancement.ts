
import { useEffect } from 'react';
import { renderAnalyzer } from '@/utils/performance/RenderAnalyzer';
import { componentAnalyzer } from '@/utils/performance/ComponentAnalyzer';

interface CodeEnhancementOptions {
  // Component analysis options
  complexity?: number;
  dependencies?: string[];
  hooks?: string[];
  childComponents?: string[];
  parentComponents?: string[];
  
  // Render tracking options
  trackRenders?: boolean;
  renderProps?: Record<string, any>;
  renderReasons?: string[];
}

/**
 * Hook for comprehensive component analysis and enhancement
 * 
 * This hook integrates both component structure analysis and render performance tracking
 * to provide a complete picture of component health and suggest improvements.
 * 
 * @param componentName The name of the component
 * @param options Configuration options for analysis
 */
export function useCodeEnhancement(
  componentName: string,
  options: CodeEnhancementOptions = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') return;
  
  const { 
    complexity = 0,
    dependencies = [],
    hooks = [],
    childComponents = [],
    parentComponents = [],
    trackRenders = true,
    renderProps,
    renderReasons
  } = options;
  
  // Register component with analyzer
  useEffect(() => {
    componentAnalyzer.registerComponent({
      name: componentName,
      complexity,
      dependencies,
      hooks,
      childComponents,
      parentComponents
    });
  }, [componentName, complexity, dependencies, hooks, childComponents, parentComponents]);
  
  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;
    
    const renderStartTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime;
      
      renderAnalyzer.recordRender(
        componentName,
        renderTime,
        renderProps,
        renderReasons
      );
    };
  });
}

export default useCodeEnhancement;
