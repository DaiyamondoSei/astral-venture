
import { ComponentExtractor } from "@/utils/codeAnalysis/ComponentExtractor";
import { RenderAnalyzer } from "@/utils/performance/RenderAnalyzer";
import { performanceMonitor } from "@/utils/performance/performanceMonitor";

export interface AssistantSuggestion {
  id: string;
  componentName: string;
  type: 'performance' | 'quality' | 'optimization' | 'accessibility' | 'security';
  title: string;
  description: string;
  context?: string;
  codeExample?: string;
  autoFixAvailable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'applied' | 'dismissed';
}

export interface AssistantIntent {
  id: string;
  type: string;
  action: string;
  target: string;
  status: 'pending' | 'completed' | 'failed';
  suggestion?: AssistantSuggestion;
}

export class AICodeAssistant {
  private static instance: AICodeAssistant;
  private suggestions: AssistantSuggestion[] = [];
  private intents: AssistantIntent[] = [];
  private componentExtractor: ComponentExtractor;

  private constructor() {
    this.componentExtractor = new ComponentExtractor();
  }

  public static getInstance(): AICodeAssistant {
    if (!AICodeAssistant.instance) {
      AICodeAssistant.instance = new AICodeAssistant();
    }
    return AICodeAssistant.instance;
  }

  public getSuggestions(): AssistantSuggestion[] {
    return this.suggestions;
  }

  public getSuggestionsForComponent(componentName: string): AssistantSuggestion[] {
    return this.suggestions.filter(s => s.componentName === componentName);
  }

  public getIntents(): AssistantIntent[] {
    return this.intents;
  }

  public registerIntent(intent: Omit<AssistantIntent, 'id'>): string {
    const id = `intent-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newIntent: AssistantIntent = {
      ...intent,
      id,
      status: 'pending'
    };
    this.intents.push(newIntent);
    return id;
  }

  public updateIntentStatus(intentId: string, status: 'pending' | 'completed' | 'failed'): void {
    const intentIndex = this.intents.findIndex(i => i.id === intentId);
    if (intentIndex >= 0) {
      this.intents[intentIndex].status = status;
    }
  }

  public applyAutoFix(suggestionId: string): Promise<boolean> {
    // Implement auto-fix logic here
    return Promise.resolve(true);
  }

  public updateContext(context: any): void {
    // Update system context
    console.log("Context updated:", context);
  }

  public analyzeSuggestions(): AssistantSuggestion[] {
    // Generate suggestions based on component analysis
    const performanceMetrics = performanceMonitor.getComponentMetrics();
    
    // Create performance optimization suggestions
    Object.entries(performanceMetrics).forEach(([componentName, metrics]) => {
      if (!metrics || typeof metrics.averageRenderTime !== 'number') return;
      
      if (metrics.averageRenderTime > 16) {
        this.suggestions.push({
          id: `perf-${componentName}-${Date.now()}`,
          componentName,
          type: 'performance',
          title: `Slow render detected in ${componentName}`,
          description: `Component ${componentName} is rendering slowly (${metrics.averageRenderTime.toFixed(2)}ms). Consider memoizing or optimizing this component.`,
          priority: metrics.averageRenderTime > 50 ? 'critical' : 'high',
          autoFixAvailable: false
        });
      }
    });
    
    return this.suggestions;
  }
}

// Export singleton instance
export const aiCodeAssistant = AICodeAssistant.getInstance();
