
// Importing from the newly created interface file
import type { AssistantSuggestion, AssistantIntent, AssistantIntentStatus } from '@/services/ai/types';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

export { AssistantSuggestion, AssistantIntent, AssistantIntentStatus };

export class AICodeAssistant {
  private suggestions: AssistantSuggestion[] = [];
  private intents: AssistantIntent[] = [];
  private analyzedComponents: Set<string> = new Set();
  private isFixing: boolean = false;

  constructor() {
    // Initialize the code assistant
    console.log('AI Code Assistant initialized');
  }

  // Analyze a specific component and provide suggestions
  public async analyzeComponent(componentId: string): Promise<AssistantSuggestion[]> {
    console.log(`Analyzing component: ${componentId}`);
    
    // Mark this component as analyzed
    this.analyzedComponents.add(componentId);
    
    // For now, we'll generate mock suggestions based on performance metrics
    const metrics = performanceMonitor.getComponentMetrics(componentId);
    const suggestions: AssistantSuggestion[] = [];
    
    // Generate suggestions based on performance metrics if available
    if (metrics && typeof metrics === 'object') {
      const averageRenderTime = typeof metrics.averageRenderTime === 'number' ? metrics.averageRenderTime : 0;
      
      if (averageRenderTime > 50) {
        suggestions.push({
          id: `perf-${componentId}-${Date.now()}`,
          type: 'performance',
          component: componentId,
          title: 'High render time detected',
          description: `Component ${componentId} has an average render time of ${averageRenderTime.toFixed(2)}ms, which may cause performance issues.`,
          priority: 'high',
          autoFixAvailable: true
        });
      } else if (averageRenderTime > 16) {
        suggestions.push({
          id: `perf-${componentId}-${Date.now()}`,
          type: 'performance',
          component: componentId,
          title: 'Render optimization opportunity',
          description: `Component ${componentId} could benefit from render optimization. Current average: ${averageRenderTime.toFixed(2)}ms.`,
          priority: 'medium',
          autoFixAvailable: false
        });
      }
    }
    
    // Add some generic suggestions for every component
    suggestions.push({
      id: `quality-${componentId}-${Date.now()}`,
      type: 'quality',
      component: componentId,
      title: 'Consider adding error boundaries',
      description: 'Wrapping this component with an error boundary would improve resilience.',
      priority: 'low',
      autoFixAvailable: false
    });
    
    // Store the suggestions
    this.suggestions = [...this.suggestions, ...suggestions];
    
    return suggestions;
  }
  
  // Analyze multiple components
  public async analyzeComponents(componentIds: string[]): Promise<AssistantSuggestion[]> {
    console.log(`Analyzing ${componentIds.length} components`);
    
    const allSuggestions: AssistantSuggestion[] = [];
    
    for (const componentId of componentIds) {
      const suggestions = await this.analyzeComponent(componentId);
      allSuggestions.push(...suggestions);
    }
    
    return allSuggestions;
  }
  
  // Get all current suggestions
  public getSuggestions(): AssistantSuggestion[] {
    return this.suggestions;
  }
  
  // Get suggestions for a specific component
  public getSuggestionsForComponent(componentId: string): AssistantSuggestion[] {
    return this.suggestions.filter(s => s.component === componentId);
  }
  
  // Register a new intent
  public async registerIntent(intent: Omit<AssistantIntent, 'id' | 'created' | 'status'>): Promise<AssistantIntent> {
    const newIntent: AssistantIntent = {
      ...intent,
      id: `intent-${Date.now()}`,
      created: new Date(),
      status: 'pending'
    };
    
    this.intents = [...this.intents, newIntent];
    
    return newIntent;
  }
  
  // Update an intent's status
  public async updateIntentStatus(intentId: string, status: AssistantIntentStatus): Promise<AssistantIntent | undefined> {
    const intentIndex = this.intents.findIndex(i => i.id === intentId);
    
    if (intentIndex === -1) {
      return undefined;
    }
    
    const updatedIntent = {
      ...this.intents[intentIndex],
      status,
      updated: new Date()
    };
    
    this.intents = [
      ...this.intents.slice(0, intentIndex),
      updatedIntent,
      ...this.intents.slice(intentIndex + 1)
    ];
    
    return updatedIntent;
  }
  
  // Get all intents
  public getIntents(): AssistantIntent[] {
    return this.intents;
  }
  
  // Apply a fix for a suggestion
  public async applyFix(suggestionId: string): Promise<boolean> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion || !suggestion.autoFixAvailable) {
      return false;
    }
    
    // Set fixing flag
    this.isFixing = true;
    
    // Simulate applying a fix
    console.log(`Applying fix for suggestion: ${suggestionId}`);
    
    // Wait for a short time to simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset fixing flag
    this.isFixing = false;
    
    // Remove the fixed suggestion
    this.suggestions = this.suggestions.filter(s => s.id !== suggestionId);
    
    return true;
  }
  
  // Check if currently applying a fix
  public getIsFixing(): boolean {
    return this.isFixing;
  }
  
  // Reset the code assistant
  public reset(): void {
    this.suggestions = [];
    this.intents = [];
    this.analyzedComponents.clear();
    this.isFixing = false;
  }
}

// Export a singleton instance
export const aiCodeAssistant = new AICodeAssistant();
export default aiCodeAssistant;
