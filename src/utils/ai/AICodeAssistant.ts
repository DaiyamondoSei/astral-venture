
import { componentAnalyzer } from '@/utils/performance/ComponentAnalyzer';
import { renderAnalyzer } from '@/utils/performance/RenderAnalyzer';
import { CodeQualityIssue } from '@/hooks/useCodeQuality';
import { devLogger } from '@/utils/debugUtils';

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  codeExample?: string;
  type: 'performance' | 'quality' | 'architecture' | 'refactoring';
  priority: 'critical' | 'high' | 'medium' | 'low';
  autoFixAvailable: boolean;
  context: {
    component?: string;
    file?: string;
    relatedIssues: CodeQualityIssue[];
  };
};

export type AssistantIntent = {
  id: string;
  description: string;
  createdAt: Date;
  status: 'pending' | 'implemented' | 'abandoned';
  relatedComponents: string[];
};

/**
 * AI Code Assistant
 * 
 * This service integrates code analysis tools with contextual AI assistance
 * to provide intelligent suggestions and automated improvements.
 */
export class AICodeAssistant {
  private static instance: AICodeAssistant;
  private isEnabled = process.env.NODE_ENV === 'development';
  private intents: Map<string, AssistantIntent> = new Map();
  private suggestions: Map<string, AssistantSuggestion> = new Map();
  private applicationContext: Record<string, any> = {};
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): AICodeAssistant {
    if (!AICodeAssistant.instance) {
      AICodeAssistant.instance = new AICodeAssistant();
    }
    return AICodeAssistant.instance;
  }
  
  /**
   * Register a new development intent
   * 
   * This allows the system to understand what you're trying to achieve
   * and provide more relevant suggestions
   */
  public registerIntent(description: string, relatedComponents: string[] = []): string {
    if (!this.isEnabled) return '';
    
    const id = `intent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    this.intents.set(id, {
      id,
      description,
      createdAt: new Date(),
      status: 'pending',
      relatedComponents
    });
    
    devLogger.log('AICodeAssistant', `Registered intent: ${description}`);
    return id;
  }
  
  /**
   * Update the application context
   * 
   * This helps the assistant understand the current state of the application
   * and provide more relevant suggestions
   */
  public updateContext(context: Record<string, any>): void {
    if (!this.isEnabled) return;
    
    this.applicationContext = {
      ...this.applicationContext,
      ...context,
      lastUpdated: new Date()
    };
    
    devLogger.log('AICodeAssistant', 'Updated application context');
  }
  
  /**
   * Generate suggestions based on current issues and context
   */
  public generateSuggestions(): AssistantSuggestion[] {
    if (!this.isEnabled) return [];
    
    const allSuggestions: AssistantSuggestion[] = [];
    
    // Get component analysis issues
    const componentIssues = componentAnalyzer.findComponentsWithIssues();
    
    // Get render performance issues
    const renderIssues = renderAnalyzer.findComponentsWithPerformanceIssues();
    
    // Generate suggestions from component issues
    componentIssues.forEach(analysis => {
      analysis.issues.forEach(issue => {
        const suggestionId = `component-${analysis.component.name}-${issue.type}`;
        
        const suggestion: AssistantSuggestion = {
          id: suggestionId,
          title: `Improve ${analysis.component.name}`,
          description: issue.suggestion,
          type: this.mapIssueTypeToSuggestionType(issue.type),
          priority: this.mapSeverityToPriority(issue.severity),
          autoFixAvailable: false,
          context: {
            component: analysis.component.name,
            relatedIssues: [{
              id: suggestionId,
              component: analysis.component.name,
              type: issue.type as any,
              severity: this.mapSeverityToPriority(issue.severity),
              description: issue.description,
              suggestion: issue.suggestion
            }]
          }
        };
        
        allSuggestions.push(suggestion);
        this.suggestions.set(suggestionId, suggestion);
      });
    });
    
    // Generate suggestions from render issues
    renderIssues.forEach(analysis => {
      analysis.suggestions.forEach(renderSuggestion => {
        const suggestionId = `render-${analysis.component}-${renderSuggestion.type}`;
        
        const suggestion: AssistantSuggestion = {
          id: suggestionId,
          title: `Optimize rendering in ${analysis.component}`,
          description: renderSuggestion.description,
          type: 'performance',
          priority: this.mapRenderPriorityToPriority(renderSuggestion.priority),
          autoFixAvailable: renderSuggestion.type === 'memo' || renderSuggestion.type === 'callback',
          codeExample: this.generateCodeExample(renderSuggestion.type, analysis.component),
          context: {
            component: analysis.component,
            relatedIssues: [{
              id: suggestionId,
              component: analysis.component,
              type: 'render',
              severity: this.mapRenderPriorityToPriority(renderSuggestion.priority),
              description: renderSuggestion.description,
              suggestion: this.getSuggestionForRenderIssue(renderSuggestion.type)
            }]
          }
        };
        
        allSuggestions.push(suggestion);
        this.suggestions.set(suggestionId, suggestion);
      });
    });
    
    // Sort by priority
    return allSuggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  /**
   * Get suggestions for a specific component
   */
  public getSuggestionsForComponent(componentName: string): AssistantSuggestion[] {
    if (!this.isEnabled) return [];
    
    return this.generateSuggestions().filter(
      suggestion => suggestion.context.component === componentName
    );
  }
  
  /**
   * Apply an automatic fix for a suggestion
   * (In a real implementation, this would generate and apply code changes)
   */
  public applyAutoFix(suggestionId: string): boolean {
    if (!this.isEnabled) return false;
    
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion || !suggestion.autoFixAvailable) {
      return false;
    }
    
    // In a real implementation, this would generate and apply the fix
    devLogger.log('AICodeAssistant', `Applied auto-fix for: ${suggestion.title}`);
    
    return true;
  }
  
  /**
   * Get all registered intents
   */
  public getIntents(): AssistantIntent[] {
    return Array.from(this.intents.values());
  }
  
  /**
   * Mark an intent as implemented or abandoned
   */
  public updateIntentStatus(intentId: string, status: 'implemented' | 'abandoned'): boolean {
    const intent = this.intents.get(intentId);
    if (!intent) return false;
    
    intent.status = status;
    this.intents.set(intentId, intent);
    return true;
  }
  
  // Helper methods
  private mapIssueTypeToSuggestionType(type: string): AssistantSuggestion['type'] {
    switch (type) {
      case 'performance':
        return 'performance';
      case 'complexity':
        return 'quality';
      case 'structure':
        return 'architecture';
      default:
        return 'quality';
    }
  }
  
  private mapSeverityToPriority(severity: string): AssistantSuggestion['priority'] {
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
  
  private mapRenderPriorityToPriority(priority: string): AssistantSuggestion['priority'] {
    switch (priority) {
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
  
  private generateCodeExample(type: string, componentName: string): string {
    switch (type) {
      case 'memo':
        return `
// Before
export default ${componentName};

// After
import { memo } from 'react';
export default memo(${componentName});`;
      case 'callback':
        return `
// Before
const handleClick = () => {
  // handle click logic
};

// After
const handleClick = useCallback(() => {
  // handle click logic
}, []);`;
      default:
        return '';
    }
  }
  
  private getSuggestionForRenderIssue(type: string): string {
    switch (type) {
      case 'memo':
        return 'Wrap component with React.memo() to prevent unnecessary re-renders';
      case 'callback':
        return 'Use useCallback() for functions passed as props to child components';
      case 'state':
        return 'Consider using useReducer() instead of multiple useState hooks, or reorganize your component logic';
      default:
        return 'Review component implementation for optimizations';
    }
  }
}

// Export singleton instance
export const aiCodeAssistant = AICodeAssistant.getInstance();
