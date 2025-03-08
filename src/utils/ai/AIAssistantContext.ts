/**
 * AI Assistant Context
 * 
 * Maintains context information about the current development session
 * to improve the relevance of AI suggestions
 */

export interface DevelopmentIntent {
  id: string;
  description: string;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
  category: 'feature' | 'bugfix' | 'refactoring' | 'performance' | 'other';
  status: 'pending' | 'in-progress' | 'implemented' | 'abandoned';
  components: string[];
  notes?: string;
}

export interface CodeContext {
  recentFiles: string[];
  activeComponents: string[];
  currentComponent?: string;
  currentIntent?: string;
  sessionStartTime: Date;
  lastActivity: Date;
}

class AIAssistantContext {
  private static instance: AIAssistantContext;
  private intents: Map<string, DevelopmentIntent> = new Map();
  private context: CodeContext = {
    recentFiles: [],
    activeComponents: [],
    sessionStartTime: new Date(),
    lastActivity: new Date()
  };
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): AIAssistantContext {
    if (!AIAssistantContext.instance) {
      AIAssistantContext.instance = new AIAssistantContext();
    }
    return AIAssistantContext.instance;
  }
  
  /**
   * Register a new development intent
   */
  public registerIntent(intent: Omit<DevelopmentIntent, 'id' | 'createdAt'>): string {
    const id = `intent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    this.intents.set(id, {
      ...intent,
      id,
      createdAt: new Date()
    });
    
    return id;
  }
  
  /**
   * Update an existing intent
   */
  public updateIntent(id: string, updates: Partial<DevelopmentIntent>): boolean {
    const intent = this.intents.get(id);
    if (!intent) return false;
    
    this.intents.set(id, { ...intent, ...updates });
    return true;
  }
  
  /**
   * Get all registered intents
   */
  public getIntents(): DevelopmentIntent[] {
    return Array.from(this.intents.values());
  }
  
  /**
   * Get a specific intent by ID
   */
  public getIntent(id: string): DevelopmentIntent | undefined {
    return this.intents.get(id);
  }
  
  /**
   * Update the current development context
   */
  public updateContext(updates: Partial<CodeContext>): void {
    this.context = {
      ...this.context,
      ...updates,
      lastActivity: new Date()
    };
  }
  
  /**
   * Get the current development context
   */
  public getContext(): CodeContext {
    return this.context;
  }
  
  /**
   * Track file access to build context
   */
  public trackFileAccess(filePath: string): void {
    // Update recent files list
    this.context.recentFiles = [
      filePath,
      ...this.context.recentFiles.filter(f => f !== filePath)
    ].slice(0, 10); // Keep only 10 most recent
    
    this.context.lastActivity = new Date();
  }
  
  /**
   * Set active component
   */
  public setCurrentComponent(componentName: string): void {
    this.context.currentComponent = componentName;
    
    // Add to active components if not already there
    if (!this.context.activeComponents.includes(componentName)) {
      this.context.activeComponents.unshift(componentName);
      
      // Keep only 5 most recent active components
      if (this.context.activeComponents.length > 5) {
        this.context.activeComponents.pop();
      }
    }
    
    this.context.lastActivity = new Date();
  }
  
  /**
   * Reset the context (for testing or session cleanup)
   */
  public reset(): void {
    this.intents.clear();
    this.context = {
      recentFiles: [],
      activeComponents: [],
      sessionStartTime: new Date(),
      lastActivity: new Date()
    };
  }
}

// Export singleton instance
export const aiAssistantContext = AIAssistantContext.getInstance();
