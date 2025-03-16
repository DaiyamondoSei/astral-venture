
/**
 * Component Extractor
 * 
 * Utilities for extracting information from React components
 */

export class ComponentExtractor {
  /**
   * Extracts a component name from code
   */
  static getComponentName(code: string): string {
    // Extract component name from a function or class declaration
    const fnMatch = code.match(/function\s+([A-Z][a-zA-Z0-9_]*)/);
    if (fnMatch) return fnMatch[1];
    
    const arrowMatch = code.match(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(\([^)]*\)|[a-zA-Z0-9_]*)\s*=>/);
    if (arrowMatch) return arrowMatch[1];
    
    const classMatch = code.match(/class\s+([A-Z][a-zA-Z0-9_]*)\s+extends/);
    if (classMatch) return classMatch[1];
    
    // Default name if we couldn't extract one
    return "UnknownComponent";
  }
  
  /**
   * Calculates a complexity score for a component
   */
  static getComplexityScore(code: string): number {
    let score = 0;
    
    // Count JSX elements
    const jsxTags = (code.match(/<[A-Za-z][^>]*>/g) || []).length;
    score += jsxTags * 0.5;
    
    // Count hooks
    const hooks = (code.match(/use[A-Z][a-zA-Z]*/g) || []).length;
    score += hooks * 2;
    
    // Count state updates
    const stateUpdates = (code.match(/set[A-Z][a-zA-Z]*\(/g) || []).length;
    score += stateUpdates;
    
    // Count conditional rendering
    const conditionals = (code.match(/\{[\s\n]*(.+?)[\s\n]*\?/g) || []).length;
    score += conditionals * 1.5;
    
    // Count effect dependencies
    const effectDeps = (code.match(/useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[(.*?)\]\)/g) || []).length;
    score += effectDeps;
    
    return Math.round(score);
  }
  
  /**
   * Extracts dependencies from a component
   */
  static getDependencies(code: string): string[] {
    const deps: string[] = [];
    
    // Extract imports
    const importMatches = code.matchAll(/import\s+(?:{([^}]*)})?\s*(?:from\s+)?['"]([^'"]*)['"]/g);
    
    for (const match of importMatches) {
      if (match[2]) {
        deps.push(match[2]);
      }
    }
    
    return deps;
  }
  
  /**
   * Extracts hooks used in a component
   */
  static getHooks(code: string): string[] {
    const hooks: string[] = [];
    const hookMatches = code.match(/use[A-Z][a-zA-Z]*/g) || [];
    
    // Filter out duplicates
    return [...new Set(hookMatches)];
  }
  
  /**
   * Extracts child components used within a component
   */
  static getChildComponents(code: string): string[] {
    const components: string[] = [];
    
    // Look for components (tags that start with capital letters)
    const componentMatches = code.match(/<([A-Z][a-zA-Z0-9_]*)/g) || [];
    
    for (const match of componentMatches) {
      components.push(match.substring(1));
    }
    
    // Filter out duplicates
    return [...new Set(components)];
  }
}

export default ComponentExtractor;
