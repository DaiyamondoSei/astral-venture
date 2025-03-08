
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
  
  // Code quality options
  codePatterns?: Array<{
    name: string;
    description: string;
    instanceCount?: number;
  }>;
  
  // Architectural metadata
  layer?: 'ui' | 'domain' | 'data' | 'infrastructure';
  responsibility?: string;
  domain?: string;
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
    renderReasons,
    codePatterns = [],
    layer,
    responsibility,
    domain
  } = options;
  
  // Enhanced debug info - visible only in development console
  if (process.env.NODE_ENV === 'development') {
    const debugInfo = {
      componentName,
      analysisTimestamp: new Date().toISOString(),
      options,
      environmentInfo: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV === 'development',
      }
    };
    console.debug(`[CodeEnhancement] Component registered: ${componentName}`, debugInfo);
  }
  
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
    
    // Add architectural metadata if available
    if (layer || responsibility || domain) {
      const metadata: Record<string, any> = {};
      
      if (layer) metadata.layer = layer;
      if (responsibility) metadata.responsibility = responsibility;
      if (domain) metadata.domain = domain;
      
      componentAnalyzer.updateComponent(componentName, { 
        metadata 
      } as any);
    }
    
    // Register code patterns if available
    if (codePatterns.length > 0) {
      // This would be implemented when we expand the ComponentAnalyzer
      console.debug(`[CodeEnhancement] ${componentName} code patterns:`, codePatterns);
    }
    
    // Optional: analyze component immediately
    const analysis = componentAnalyzer.analyzeComponent(componentName);
    if (analysis && analysis.issues.length > 0) {
      console.debug(`[CodeEnhancement] ${componentName} analysis:`, analysis);
    }
  }, [componentName, complexity, dependencies, hooks, childComponents, parentComponents, 
      layer, responsibility, domain, codePatterns]);
  
  // Track render performance with enhanced tracking
  useEffect(() => {
    if (!trackRenders) return;
    
    const renderStartTime = performance.now();
    const frameStartTime = window.requestAnimationFrame 
      ? performance.now() 
      : renderStartTime;
    
    // Track component that started rendering
    console.debug(`[CodeEnhancement] ${componentName} render started`);
    
    return () => {
      const renderTime = performance.now() - renderStartTime;
      const frameTime = window.requestAnimationFrame 
        ? performance.now() - frameStartTime 
        : 0;
      
      renderAnalyzer.recordRender(
        componentName,
        renderTime,
        renderProps,
        renderReasons
      );
      
      // Enhanced performance logging
      console.debug(`[CodeEnhancement] ${componentName} render completed`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        frameTime: frameTime > 0 ? `${frameTime.toFixed(2)}ms` : 'N/A',
        isSlowRender: renderTime > 16.67, // 60fps threshold
        props: renderProps,
        reasons: renderReasons
      });
    };
  });
}

export default useCodeEnhancement;
