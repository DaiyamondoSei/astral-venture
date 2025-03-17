
/**
 * ComponentExtractor
 * 
 * A utility class for analyzing React components in code
 * to extract metadata, dependencies, and complexity metrics.
 */

interface ComponentInfo {
  name: string;
  type: 'function' | 'class' | 'arrow' | 'unknown';
  props: string[];
  hooks: string[];
  stateVars: string[];
  dependencies: string[];
  complexity: number;
  childComponents: string[];
  lineCount: number;
}

export class ComponentExtractor {
  /**
   * Extract component name from code or file path
   */
  static getComponentName(codeOrPath: string): string {
    // If it's a file path, extract the filename without extension
    if (codeOrPath.includes('/') || codeOrPath.includes('\\')) {
      const parts = codeOrPath.split(/[\/\\]/);
      const filename = parts[parts.length - 1];
      return filename.replace(/\.(tsx|jsx|ts|js)$/, '');
    }
    
    // Try to extract component name from code
    const functionComponentMatch = codeOrPath.match(/function\s+([A-Z][A-Za-z0-9]*)/);
    if (functionComponentMatch) return functionComponentMatch[1];
    
    const arrowComponentMatch = codeOrPath.match(/const\s+([A-Z][A-Za-z0-9]*)\s*=\s*(\([^)]*\)|[^=]*)\s*=>/);
    if (arrowComponentMatch) return arrowComponentMatch[1];
    
    const classComponentMatch = codeOrPath.match(/class\s+([A-Z][A-Za-z0-9]*)\s+extends\s+React\.Component/);
    if (classComponentMatch) return classComponentMatch[1];
    
    return 'UnknownComponent';
  }
  
  /**
   * Calculate complexity score for a component
   */
  static getComplexityScore(code: string): number {
    let score = 0;
    
    // Count conditional statements
    const conditionals = (code.match(/if\s*\(/g) || []).length;
    score += conditionals * 1;
    
    // Count loops
    const loops = (code.match(/for\s*\(/g) || []).length + 
                  (code.match(/while\s*\(/g) || []).length +
                  (code.match(/\.map\s*\(/g) || []).length +
                  (code.match(/\.forEach\s*\(/g) || []).length +
                  (code.match(/\.filter\s*\(/g) || []).length;
    score += loops * 2;
    
    // Count state variables
    const stateVars = (code.match(/useState\s*\(/g) || []).length;
    score += stateVars * 1;
    
    // Count effects
    const effects = (code.match(/useEffect\s*\(/g) || []).length;
    score += effects * 2;
    
    // Count JSX elements (approximation)
    const jsxElements = (code.match(/<[A-Z][A-Za-z0-9]*[^>]*>/g) || []).length;
    score += jsxElements * 0.5;
    
    // Large components are more complex
    score += Math.floor(code.length / 1000);
    
    return Math.round(score);
  }
  
  /**
   * Extract dependencies from a component
   */
  static getDependencies(code: string): string[] {
    const importMatches = Array.from(code.matchAll(/import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g));
    return importMatches.map(match => match[1]);
  }
  
  /**
   * Extract hooks used in a component
   */
  static getHooks(code: string): string[] {
    const hooksMatch = Array.from(code.matchAll(/use[A-Z][A-Za-z0-9]*\s*\(/g));
    return hooksMatch.map(match => match[0].trim().replace(/\($/, ''));
  }
  
  /**
   * Extract child components used inside a component
   */
  static getChildComponents(code: string): string[] {
    // This is a simplification - a more robust implementation would use AST parsing
    const jsxMatches = Array.from(code.matchAll(/<([A-Z][A-Za-z0-9]*)[^>]*>/g));
    return [...new Set(jsxMatches.map(match => match[1]))]; // Remove duplicates
  }
  
  /**
   * Analyze an entire component file and return component info
   */
  static analyzeComponent(code: string): ComponentInfo {
    const name = this.getComponentName(code);
    const type = code.includes('function ' + name) ? 'function' : 
                 code.includes('class ' + name) ? 'class' : 
                 code.includes('const ' + name) ? 'arrow' : 'unknown';
    
    // Extract props from component declaration
    const propsMatch = code.match(new RegExp(`${name}\\s*=\\s*\\(\\s*\\{\\s*([^}]*)\\}\\s*\\)`)) || 
                       code.match(/\(\s*\{\s*([^}]*)\}\s*\)/);
    const props = propsMatch ? 
      propsMatch[1].split(',').map(prop => prop.trim().split(':')[0].trim()).filter(Boolean) : 
      [];
    
    // Extract other information
    const hooks = this.getHooks(code);
    const stateVars = hooks
      .filter(hook => hook === 'useState')
      .map((_, idx) => `state${idx + 1}`) // Naive approximation of state var names
    
    const dependencies = this.getDependencies(code);
    const complexity = this.getComplexityScore(code);
    const childComponents = this.getChildComponents(code);
    const lineCount = code.split('\n').length;
    
    return {
      name,
      type,
      props,
      hooks,
      stateVars,
      dependencies,
      complexity,
      childComponents,
      lineCount
    };
  }
}
