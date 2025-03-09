
/**
 * Component Extractor
 * 
 * Utility for extracting and analyzing component structure
 */

export class ComponentExtractor {
  /**
   * Get the display name of a component
   */
  static getComponentName(component: any): string {
    return component?.displayName || component?.name || 'Unknown';
  }

  /**
   * Get the complexity score of a component
   */
  static getComplexityScore(component: any): number {
    // Basic implementation
    return 1;
  }

  /**
   * Get the dependencies of a component
   */
  static getDependencies(component: any): string[] {
    return [];
  }

  /**
   * Get the hooks used in a component
   */
  static getHooks(component: any): string[] {
    return [];
  }

  /**
   * Get the child components of a component
   */
  static getChildComponents(component: any): any[] {
    return [];
  }
  
  // Instance methods for backward compatibility
  getComponentName(component: any): string {
    return ComponentExtractor.getComponentName(component);
  }

  getComplexityScore(component: any): number {
    return ComponentExtractor.getComplexityScore(component);
  }

  getDependencies(component: any): string[] {
    return ComponentExtractor.getDependencies(component);
  }

  getHooks(component: any): string[] {
    return ComponentExtractor.getHooks(component);
  }

  getChildComponents(component: any): any[] {
    return ComponentExtractor.getChildComponents(component);
  }
}

export default ComponentExtractor;
