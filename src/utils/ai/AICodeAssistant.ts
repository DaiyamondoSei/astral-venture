
import { AssistantSuggestion, AssistantIntent, AssistantIntentStatus } from '@/services/ai/types';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';
import { RenderAnalyzer } from '@/utils/performance/RenderAnalyzer';

/**
 * AI-powered code analysis and assistance
 */
export class AICodeAssistant {
  private suggestions: Record<string, AssistantSuggestion[]> = {};
  private intents: AssistantIntent[] = [];
  private context: string = '';

  constructor() {
    // Initialize with empty suggestions
    this.suggestions = {};
    this.intents = [];
  }

  /**
   * Get suggestions for a specific component
   */
  public async getSuggestions(componentId: string): Promise<AssistantSuggestion[]> {
    // Return cached suggestions if available
    if (this.suggestions[componentId]) {
      return this.suggestions[componentId];
    }

    try {
      // Generate new suggestions based on component analysis
      const suggestions = await this.analyzeSingleComponent(componentId);
      
      // Cache suggestions
      this.suggestions[componentId] = suggestions;
      
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get all registered intents
   */
  public async getIntents(): Promise<AssistantIntent[]> {
    return this.intents;
  }

  /**
   * Register a new intent
   */
  public async registerIntent(intent: Omit<AssistantIntent, 'id' | 'created' | 'status'>): Promise<AssistantIntent> {
    const newIntent: AssistantIntent = {
      ...intent,
      id: `intent-${Date.now()}`,
      created: new Date(),
      status: 'pending'
    };
    
    this.intents.push(newIntent);
    return newIntent;
  }

  /**
   * Apply an auto-fix for a suggestion
   */
  public async applyAutoFix(suggestionId: string): Promise<boolean> {
    // Find the suggestion across all components
    let targetSuggestion: AssistantSuggestion | null = null;
    
    Object.values(this.suggestions).forEach(componentSuggestions => {
      const found = componentSuggestions.find(s => s.id === suggestionId);
      if (found) {
        targetSuggestion = found;
      }
    });
    
    if (!targetSuggestion || !targetSuggestion.autoFixAvailable) {
      return false;
    }
    
    try {
      // Apply the auto-fix (mock implementation for now)
      console.log(`Applying auto-fix for suggestion: ${suggestionId}`);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error applying auto-fix:', error);
      return false;
    }
  }

  /**
   * Update the status of an intent
   */
  public async updateIntentStatus(intentId: string, status: AssistantIntentStatus): Promise<boolean> {
    const intentIndex = this.intents.findIndex(i => i.id === intentId);
    
    if (intentIndex === -1) {
      return false;
    }
    
    this.intents[intentIndex] = {
      ...this.intents[intentIndex],
      status,
      updated: new Date()
    };
    
    return true;
  }

  /**
   * Update context information for more accurate suggestions
   */
  public updateContext(context: string): void {
    this.context = context;
  }

  /**
   * Analyze a single component for improvement suggestions
   */
  private async analyzeSingleComponent(componentId: string): Promise<AssistantSuggestion[]> {
    const suggestions: AssistantSuggestion[] = [];
    
    // Get performance metrics
    const metrics = performanceMonitor.getComponentMetrics();
    const componentMetrics = metrics[componentId];
    
    // Check for render performance issues
    if (componentMetrics && typeof componentMetrics === 'object') {
      const averageRenderTime = 'averageRenderTime' in componentMetrics ? 
        (componentMetrics as any).averageRenderTime : 0;
      
      if (averageRenderTime > 16) {
        suggestions.push({
          id: `perf-${componentId}-${Date.now()}`,
          type: 'warning',
          component: componentId,
          title: 'Slow render performance',
          description: `Component ${componentId} is rendering slowly (${averageRenderTime.toFixed(2)}ms)`,
          priority: 'high',
          autoFixAvailable: false
        });
      }
      
      // Check for excessive re-renders
      const renderCount = 'renderCount' in componentMetrics ? 
        (componentMetrics as any).renderCount : 0;
      
      if (renderCount > 50) {
        suggestions.push({
          id: `renders-${componentId}-${Date.now()}`,
          type: 'warning',
          component: componentId,
          title: 'Excessive re-renders',
          description: `Component ${componentId} is re-rendering excessively (${renderCount} times)`,
          context: 'Consider using React.memo or optimizing dependency arrays',
          codeExample: `
const ${componentId} = React.memo(({ prop1, prop2 }) => {
  // Component implementation
});`,
          priority: 'medium',
          autoFixAvailable: true
        });
      }
    }
    
    // Check for general React best practices
    suggestions.push({
      id: `practice-${componentId}-${Date.now()}`,
      type: 'improvement',
      component: componentId,
      title: 'Use functional components with hooks',
      description: 'Modern React best practices favor functional components with hooks',
      priority: 'low',
      autoFixAvailable: false
    });
    
    return suggestions;
  }
}
