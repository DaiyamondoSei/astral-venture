
/**
 * ComponentExtractor
 * 
 * Utility class to extract component information from code
 * for analysis and optimization purposes.
 */

export interface ComponentInfo {
  name: string;
  complexity: number;
  dependencies: string[];
  hooks: string[];
  childComponents: string[];
  lines: number;
  props: string[];
}

export class ComponentExtractor {
  /**
   * Extract component name from code or filename
   */
  static getComponentName(code: string, fileName?: string): string {
    // Try to extract from export default statement
    const exportDefaultMatch = code.match(/export\s+default\s+(?:function\s+)?([A-Za-z0-9_]+)/);
    if (exportDefaultMatch && exportDefaultMatch[1]) {
      return exportDefaultMatch[1];
    }
    
    // Try to extract from const declaration
    const constMatch = code.match(/const\s+([A-Za-z0-9_]+)\s*[:=]\s*(?:React\.)?(?:FC|FunctionComponent|React\.Component)/);
    if (constMatch && constMatch[1]) {
      return constMatch[1];
    }
    
    // Try to extract from class declaration
    const classMatch = code.match(/class\s+([A-Za-z0-9_]+)\s+extends\s+(?:React\.)?Component/);
    if (classMatch && classMatch[1]) {
      return classMatch[1];
    }
    
    // Fallback to filename
    if (fileName) {
      const baseName = fileName.split('/').pop() || '';
      return baseName.replace(/\.[jt]sx?$/, '');
    }
    
    return 'UnknownComponent';
  }
  
  /**
   * Calculate component complexity score
   */
  static getComplexityScore(code: string): number {
    // This is a simplified complexity calculation
    let score = 0;
    
    // Count conditional statements
    const conditionals = (code.match(/if\s*\(|}\s*else\s*{|\?\s*\w+\s*:/g) || []).length;
    score += conditionals * 2;
    
    // Count loops
    const loops = (code.match(/for\s*\(|while\s*\(|\.map\s*\(|\.forEach\s*\(|\.filter\s*\(/g) || []).length;
    score += loops * 3;
    
    // Count state variables
    const stateVars = (code.match(/useState\s*\(/g) || []).length;
    score += stateVars * 2;
    
    // Count effects
    const effects = (code.match(/useEffect\s*\(/g) || []).length;
    score += effects * 2;
    
    // Count lines of code
    const lines = code.split('\n').length;
    score += Math.floor(lines / 10);
    
    return score;
  }
  
  /**
   * Extract dependencies from the component
   */
  static getDependencies(code: string): string[] {
    const imports: string[] = [];
    
    // Match import statements
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }
  
  /**
   * Extract React hooks used in the component
   */
  static getHooks(code: string): string[] {
    const hooks: string[] = [];
    
    // Common React hooks
    const hookRegex = /use[A-Z][a-zA-Z]+\s*\(/g;
    let match;
    
    while ((match = hookRegex.exec(code)) !== null) {
      const hook = match[0].replace(/\s*\($/, '');
      if (!hooks.includes(hook)) {
        hooks.push(hook);
      }
    }
    
    return hooks;
  }
  
  /**
   * Extract child components used in the component
   */
  static getChildComponents(code: string): string[] {
    const components: string[] = [];
    
    // Find JSX components (capitalized tags)
    const componentRegex = /<([A-Z][a-zA-Z0-9_]*)/g;
    let match;
    
    while ((match = componentRegex.exec(code)) !== null) {
      const component = match[1];
      if (!components.includes(component) && component !== 'React') {
        components.push(component);
      }
    }
    
    return components;
  }
  
  /**
   * Analyze component code and return comprehensive info
   */
  static analyzeComponent(code: string, fileName?: string): ComponentInfo {
    return {
      name: this.getComponentName(code, fileName),
      complexity: this.getComplexityScore(code),
      dependencies: this.getDependencies(code),
      hooks: this.getHooks(code),
      childComponents: this.getChildComponents(code),
      lines: code.split('\n').length,
      props: this.extractProps(code)
    };
  }
  
  /**
   * Extract component props from interface or type definition
   */
  private static extractProps(code: string): string[] {
    const props: string[] = [];
    
    // Find props interface or type
    const propsMatch = code.match(/interface\s+(\w+Props)\s*{([^}]*)}/);
    if (propsMatch) {
      const propsBlock = propsMatch[2];
      const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(propsBlock)) !== null) {
        props.push(propMatch[1]);
      }
    }
    
    return props;
  }
}

// Export a singleton instance
export default ComponentExtractor;
