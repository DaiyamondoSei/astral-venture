
/**
 * Component Analyzer
 * 
 * Analyzes component structures and provides suggestions for improvements.
 */

import { devLogger } from '@/utils/debugUtils';

export type ComponentMetadata = {
  name: string;
  complexity: number;
  fileSize?: number;
  dependencies: string[];
  hooks: string[];
  renderCount?: number;
  parentComponents?: string[];
  childComponents?: string[];
};

export type ComponentAnalysis = {
  component: ComponentMetadata;
  issues: {
    type: 'complexity' | 'dependencies' | 'structure' | 'performance';
    description: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
};

export class ComponentAnalyzer {
  private static instance: ComponentAnalyzer;
  private components: Map<string, ComponentMetadata> = new Map();
  private analysisCache: Map<string, ComponentAnalysis> = new Map();
  private isEnabled = process.env.NODE_ENV === 'development';
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): ComponentAnalyzer {
    if (!ComponentAnalyzer.instance) {
      ComponentAnalyzer.instance = new ComponentAnalyzer();
    }
    return ComponentAnalyzer.instance;
  }
  
  /**
   * Register a component for analysis
   */
  public registerComponent(metadata: ComponentMetadata): void {
    if (!this.isEnabled) return;
    
    this.components.set(metadata.name, metadata);
    
    // Invalidate analysis cache for this component
    this.analysisCache.delete(metadata.name);
    
    devLogger.log('ComponentAnalyzer', `Registered component: ${metadata.name}`);
  }
  
  /**
   * Update component metadata
   */
  public updateComponent(name: string, updates: Partial<ComponentMetadata>): void {
    if (!this.isEnabled) return;
    
    const existing = this.components.get(name);
    if (!existing) {
      devLogger.warn('ComponentAnalyzer', `Attempted to update unknown component: ${name}`);
      return;
    }
    
    this.components.set(name, { ...existing, ...updates });
    
    // Invalidate analysis cache for this component
    this.analysisCache.delete(name);
  }
  
  /**
   * Analyze a specific component
   */
  public analyzeComponent(name: string): ComponentAnalysis | null {
    if (!this.isEnabled) return null;
    
    // Return cached analysis if available
    if (this.analysisCache.has(name)) {
      return this.analysisCache.get(name)!;
    }
    
    const component = this.components.get(name);
    if (!component) {
      devLogger.warn('ComponentAnalyzer', `Attempted to analyze unknown component: ${name}`);
      return null;
    }
    
    const issues: ComponentAnalysis['issues'] = [];
    
    // Check for complexity issues
    if (component.complexity > 100) {
      issues.push({
        type: 'complexity',
        description: `Component complexity score (${component.complexity}) is too high`,
        severity: 'high',
        suggestion: 'Split this component into smaller, more focused components'
      });
    } else if (component.complexity > 50) {
      issues.push({
        type: 'complexity',
        description: `Component complexity score (${component.complexity}) is moderately high`,
        severity: 'medium',
        suggestion: 'Consider breaking down this component into smaller parts'
      });
    }
    
    // Check for dependency issues
    if (component.dependencies.length > 15) {
      issues.push({
        type: 'dependencies',
        description: `Component has ${component.dependencies.length} dependencies`,
        severity: 'medium',
        suggestion: 'Review dependencies and consider extracting some functionality'
      });
    }
    
    // Check for hook usage patterns
    const statefulHooks = component.hooks.filter(h => 
      h.startsWith('useState') || h.startsWith('useReducer')
    );
    
    if (statefulHooks.length > 5) {
      issues.push({
        type: 'structure',
        description: `Component uses ${statefulHooks.length} state hooks`,
        severity: 'medium',
        suggestion: 'Consider using useReducer instead of multiple useState hooks'
      });
    }
    
    // Check parent-child relationships for prop drilling
    if (component.childComponents && component.childComponents.length > 10) {
      issues.push({
        type: 'structure',
        description: 'Component renders many child components directly',
        severity: 'low',
        suggestion: 'Consider using composition or creating intermediate container components'
      });
    }
    
    const analysis: ComponentAnalysis = {
      component,
      issues
    };
    
    // Cache the analysis
    this.analysisCache.set(name, analysis);
    
    return analysis;
  }
  
  /**
   * Find all components with issues
   */
  public findComponentsWithIssues(): ComponentAnalysis[] {
    if (!this.isEnabled) return [];
    
    const results: ComponentAnalysis[] = [];
    
    this.components.forEach((_, name) => {
      const analysis = this.analyzeComponent(name);
      if (analysis && analysis.issues.length > 0) {
        results.push(analysis);
      }
    });
    
    return results;
  }
  
  /**
   * Generate refactoring suggestions for the entire application
   */
  public generateRefactoringSuggestions(): {
    type: 'component' | 'architecture' | 'performance';
    description: string;
    components: string[];
    priority: 'high' | 'medium' | 'low';
  }[] {
    if (!this.isEnabled) return [];
    
    const suggestions: {
      type: 'component' | 'architecture' | 'performance';
      description: string;
      components: string[];
      priority: 'high' | 'medium' | 'low';
    }[] = [];
    
    // Look for complex components
    const complexComponents = Array.from(this.components.values())
      .filter(c => c.complexity > 70)
      .map(c => c.name);
    
    if (complexComponents.length > 0) {
      suggestions.push({
        type: 'component',
        description: 'These components have high complexity scores and should be refactored into smaller components',
        components: complexComponents,
        priority: 'high'
      });
    }
    
    // Look for potential prop drilling
    const propDrillingCandidates = this.findPotentialPropDrilling();
    if (propDrillingCandidates.length > 0) {
      suggestions.push({
        type: 'architecture',
        description: 'Potential prop drilling detected in these component chains. Consider using Context API or composition',
        components: propDrillingCandidates,
        priority: 'medium'
      });
    }
    
    // Look for high render count components (from performance data)
    const highRenderComponents = Array.from(this.components.values())
      .filter(c => c.renderCount && c.renderCount > 10)
      .map(c => c.name);
    
    if (highRenderComponents.length > 0) {
      suggestions.push({
        type: 'performance',
        description: 'These components are rendering too frequently. Consider using React.memo or optimizing their parent components',
        components: highRenderComponents,
        priority: 'high'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Find potential prop drilling issues
   */
  private findPotentialPropDrilling(): string[] {
    const results: string[] = [];
    const componentRelationships = new Map<string, Set<string>>();
    
    // Build parent-child relationships map
    this.components.forEach(component => {
      if (component.parentComponents && component.childComponents) {
        componentRelationships.set(
          component.name, 
          new Set([...component.parentComponents, ...component.childComponents])
        );
      }
    });
    
    // Find chains of components passing props down
    // This is a simplified heuristic and could be improved
    Array.from(this.components.keys()).forEach(name => {
      let currentComp = name;
      let chainLength = 0;
      let visited = new Set<string>();
      
      while (chainLength < 5 && !visited.has(currentComp)) {
        visited.add(currentComp);
        
        const related = componentRelationships.get(currentComp);
        if (!related || related.size === 0) break;
        
        // For simplicity we just take the first child
        currentComp = Array.from(related)[0];
        chainLength++;
      }
      
      if (chainLength >= 3) {
        results.push(name);
      }
    });
    
    return results;
  }
}

// Export the singleton instance
export const componentAnalyzer = ComponentAnalyzer.getInstance();
