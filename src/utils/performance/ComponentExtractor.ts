
/**
 * Utility for extracting component information for analysis
 */

interface ComponentInfo {
  name: string;
  complexity: number;
  dependencies: string[];
  hooks: string[];
  childComponents: string[];
}

class ComponentExtractor {
  private components: Map<string, ComponentInfo> = new Map();
  
  /**
   * Extract component information from rendered components
   */
  extractComponentInfo(component: React.ComponentType<any> | string): ComponentInfo {
    const name = this.getComponentName(component);
    
    // Check if we already have this component's info
    if (this.components.has(name)) {
      return this.components.get(name)!;
    }
    
    // Create new component info
    const componentInfo: ComponentInfo = {
      name,
      complexity: this.getComplexityScore(component),
      dependencies: this.getDependencies(component),
      hooks: this.getHooks(component),
      childComponents: this.getChildComponents(component)
    };
    
    // Store component info
    this.components.set(name, componentInfo);
    
    return componentInfo;
  }
  
  /**
   * Get component name from component
   */
  getComponentName(component: React.ComponentType<any> | string): string {
    if (typeof component === 'string') {
      return component;
    }
    
    return component.displayName || component.name || 'UnnamedComponent';
  }
  
  /**
   * Get complexity score for component
   */
  getComplexityScore(component: React.ComponentType<any> | string): number {
    // This is a placeholder for a real complexity analysis
    // In a real implementation, this would analyze the component's code
    
    if (typeof component === 'string') {
      return 1; // Built-in components have low complexity
    }
    
    // Get component source code if possible
    const source = this.getComponentSource(component);
    
    // Placeholder complexity calculation based on source length
    return Math.min(10, Math.ceil((source.length / 1000) * 3));
  }
  
  /**
   * Get component dependencies
   */
  getDependencies(component: React.ComponentType<any> | string): string[] {
    // Placeholder - in a real implementation, this would parse imports or use React DevTools
    return [];
  }
  
  /**
   * Get hooks used by component
   */
  getHooks(component: React.ComponentType<any> | string): string[] {
    // Placeholder - in a real implementation, this would analyze code for hook calls
    return [];
  }
  
  /**
   * Get child components
   */
  getChildComponents(component: React.ComponentType<any> | string): string[] {
    // Placeholder - in a real implementation, this would analyze rendering tree
    return [];
  }
  
  /**
   * Get component source code if possible
   */
  private getComponentSource(component: React.ComponentType<any>): string {
    // This is a placeholder - in a real implementation, this could
    // use function.toString() with limitations or source maps
    return component.toString();
  }
  
  /**
   * Static helper method to get component name
   */
  static getComponentName(component: React.ComponentType<any> | string): string {
    if (typeof component === 'string') {
      return component;
    }
    
    return component.displayName || component.name || 'UnnamedComponent';
  }
}

// Export a singleton instance
export const componentExtractor = new ComponentExtractor();

// Also export the class
export default ComponentExtractor;
