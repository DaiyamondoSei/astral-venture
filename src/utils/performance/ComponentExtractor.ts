
/**
 * Utility class for extracting component information
 */
export class ComponentExtractor {
  /**
   * Extract component name from a component type
   */
  public static getComponentName(component: any): string {
    if (!component) return 'Unknown';
    
    if (typeof component === 'string') {
      return component;
    }
    
    // Handle function or class components
    if (component.displayName) {
      return component.displayName;
    }
    
    if (component.name) {
      return component.name;
    }
    
    // Try to get name from the constructor
    if (component.constructor && component.constructor.name) {
      return component.constructor.name;
    }
    
    // Last resort, use the component type
    return typeof component;
  }
  
  /**
   * Get the complexity score for a component
   */
  public getComplexityScore(component: any): number {
    // This would need to analyze the component AST or code
    // For now, return a placeholder value
    return 1;
  }
  
  /**
   * Get dependencies used by a component
   */
  public getDependencies(component: any): string[] {
    // This would need to analyze the component imports
    // For now, return an empty array
    return [];
  }
  
  /**
   * Get hooks used in a component
   */
  public getHooks(component: any): string[] {
    // This would need to analyze the component for React hooks
    // For now, return an empty array
    return [];
  }
  
  /**
   * Get child components used in a component
   */
  public getChildComponents(component: any): string[] {
    // This would need to analyze the component's render method
    // For now, return an empty array
    return [];
  }
}

// Export singleton instance
export const componentExtractor = new ComponentExtractor();
