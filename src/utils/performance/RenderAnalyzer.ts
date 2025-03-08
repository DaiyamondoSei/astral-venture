
/**
 * Render Analyzer
 * 
 * Analyzes component renders to identify unnecessary re-renders
 * and suggest performance optimizations.
 */

import { devLogger } from '@/utils/debugUtils';

export type RenderInfo = {
  componentName: string;
  renderTime: number;
  renderCount: number;
  props?: Record<string, any>;
  reasons?: string[];
  timestamp: number;
};

export type RenderAnalysis = {
  component: string;
  averageRenderTime: number;
  totalRenderCount: number;
  unnecessaryRenderCount: number;
  suggestions: {
    type: 'memo' | 'callback' | 'state' | 'prop-drilling';
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
};

export class RenderAnalyzer {
  private static instance: RenderAnalyzer;
  private renderHistory: Map<string, RenderInfo[]> = new Map();
  private analysisCache: Map<string, RenderAnalysis> = new Map();
  private isEnabled = process.env.NODE_ENV === 'development';
  private maxHistoryLength = 20;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): RenderAnalyzer {
    if (!RenderAnalyzer.instance) {
      RenderAnalyzer.instance = new RenderAnalyzer();
    }
    return RenderAnalyzer.instance;
  }
  
  /**
   * Record a component render
   */
  public recordRender(
    componentName: string, 
    renderTime: number, 
    props?: Record<string, any>,
    reasons?: string[]
  ): void {
    if (!this.isEnabled) return;
    
    const renderInfo: RenderInfo = {
      componentName,
      renderTime,
      renderCount: 1,
      props,
      reasons,
      timestamp: Date.now()
    };
    
    // Get existing history or create new array
    const history = this.renderHistory.get(componentName) || [];
    
    // Add new render to history
    history.unshift(renderInfo);
    
    // Limit history length
    if (history.length > this.maxHistoryLength) {
      history.pop();
    }
    
    // Update history
    this.renderHistory.set(componentName, history);
    
    // Invalidate analysis cache
    this.analysisCache.delete(componentName);
    
    devLogger.log('RenderAnalyzer', `Recorded render for ${componentName}: ${renderTime.toFixed(2)}ms`);
  }
  
  /**
   * Analyze renders for a specific component
   */
  public analyzeRenders(componentName: string): RenderAnalysis | null {
    if (!this.isEnabled) return null;
    
    // Return cached analysis if available
    if (this.analysisCache.has(componentName)) {
      return this.analysisCache.get(componentName)!;
    }
    
    const history = this.renderHistory.get(componentName);
    if (!history || history.length < 2) {
      return null;
    }
    
    // Calculate metrics
    const totalRenderCount = history.length;
    const totalRenderTime = history.reduce((sum, info) => sum + info.renderTime, 0);
    const averageRenderTime = totalRenderTime / totalRenderCount;
    
    // Count potentially unnecessary renders
    let unnecessaryRenderCount = 0;
    
    // Compare consecutive renders to detect unnecessary ones
    for (let i = 0; i < history.length - 1; i++) {
      const currentRender = history[i];
      const previousRender = history[i + 1];
      
      // If renders happened close together and props look the same
      if (
        currentRender.timestamp - previousRender.timestamp < 100 && // Within 100ms
        this.arePropsEquivalent(currentRender.props, previousRender.props)
      ) {
        unnecessaryRenderCount++;
      }
    }
    
    // Generate suggestions based on analysis
    const suggestions: RenderAnalysis['suggestions'] = [];
    
    // Suggest memoization for frequently rendering components
    if (totalRenderCount > 10 && averageRenderTime > 5) {
      suggestions.push({
        type: 'memo',
        description: 'Component renders frequently with significant render time',
        priority: 'high'
      });
    }
    
    // Suggest useCallback for components passing functions to children
    if (this.hasFunctionProps(history[0]?.props)) {
      suggestions.push({
        type: 'callback',
        description: 'Component passes functions to children which may cause unnecessary re-renders',
        priority: 'medium'
      });
    }
    
    // Suggest state optimization if many renders with similar props
    if (unnecessaryRenderCount > totalRenderCount * 0.3) {
      suggestions.push({
        type: 'state',
        description: `${unnecessaryRenderCount} of ${totalRenderCount} renders may be unnecessary`,
        priority: 'high'
      });
    }
    
    const analysis: RenderAnalysis = {
      component: componentName,
      averageRenderTime,
      totalRenderCount,
      unnecessaryRenderCount,
      suggestions
    };
    
    // Cache the analysis
    this.analysisCache.set(componentName, analysis);
    
    return analysis;
  }
  
  /**
   * Get components with performance issues
   */
  public findComponentsWithPerformanceIssues(): RenderAnalysis[] {
    if (!this.isEnabled) return [];
    
    const results: RenderAnalysis[] = [];
    
    this.renderHistory.forEach((_, componentName) => {
      const analysis = this.analyzeRenders(componentName);
      if (analysis && analysis.suggestions.length > 0) {
        results.push(analysis);
      }
    });
    
    // Sort by priority (high to low)
    return results.sort((a, b) => {
      const aHighPriority = a.suggestions.some(s => s.priority === 'high');
      const bHighPriority = b.suggestions.some(s => s.priority === 'high');
      
      if (aHighPriority && !bHighPriority) return -1;
      if (!aHighPriority && bHighPriority) return 1;
      
      // If same priority, sort by unnecessary render count
      return b.unnecessaryRenderCount - a.unnecessaryRenderCount;
    });
  }
  
  /**
   * Helper to check if two prop objects are roughly equivalent
   */
  private arePropsEquivalent(
    props1?: Record<string, any>, 
    props2?: Record<string, any>
  ): boolean {
    if (!props1 || !props2) return false;
    
    // Basic check: same properties
    const keys1 = Object.keys(props1);
    const keys2 = Object.keys(props2);
    
    if (keys1.length !== keys2.length) return false;
    
    // Check primitive values for equality
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      
      const val1 = props1[key];
      const val2 = props2[key];
      
      // Skip functions - we can't easily compare them
      if (typeof val1 === 'function' || typeof val2 === 'function') {
        continue;
      }
      
      // Shallow comparison for objects
      if (typeof val1 === 'object' && typeof val2 === 'object') {
        // Both null
        if (val1 === null && val2 === null) continue;
        
        // One null, other not
        if (val1 === null || val2 === null) return false;
        
        // Both arrays - check length only
        if (Array.isArray(val1) && Array.isArray(val2)) {
          if (val1.length !== val2.length) return false;
          continue;
        }
        
        // Different types
        if (Array.isArray(val1) !== Array.isArray(val2)) return false;
        
        // Skip deep object comparison, just check keys
        continue;
      }
      
      // Compare primitive values
      if (val1 !== val2) return false;
    }
    
    return true;
  }
  
  /**
   * Check if props contain functions
   */
  private hasFunctionProps(props?: Record<string, any>): boolean {
    if (!props) return false;
    
    return Object.values(props).some(val => typeof val === 'function');
  }
  
  /**
   * Clear render history
   */
  public clearHistory(): void {
    this.renderHistory.clear();
    this.analysisCache.clear();
  }
}

// Export the singleton instance
export const renderAnalyzer = RenderAnalyzer.getInstance();
