
/**
 * ComponentExtractor
 * 
 * Utility for extracting component information from source code
 */

export class ComponentExtractor {
  /**
   * Extract components from source code
   */
  static extractComponents(source: string): any[] {
    // Basic implementation to extract React components
    const components = [];
    const functionComponentRegex = /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g;
    const arrowComponentRegex = /const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*{/g;
    const classComponentRegex = /class\s+([A-Z][a-zA-Z0-9]*)\s+extends\s+(?:React\.)?Component/g;
    
    let match;
    
    // Extract function components
    while ((match = functionComponentRegex.exec(source)) !== null) {
      components.push({
        name: match[1],
        type: 'function',
        position: match.index
      });
    }
    
    // Extract arrow function components
    while ((match = arrowComponentRegex.exec(source)) !== null) {
      components.push({
        name: match[1],
        type: 'arrow',
        position: match.index
      });
    }
    
    // Extract class components
    while ((match = classComponentRegex.exec(source)) !== null) {
      components.push({
        name: match[1],
        type: 'class',
        position: match.index
      });
    }
    
    return components;
  }
  
  /**
   * Get component name from declaration
   */
  static getComponentName(declaration: any): string {
    return declaration && declaration.name ? declaration.name : "UnknownComponent";
  }
  
  /**
   * Extract props from component source
   */
  static extractProps(source: string): any[] {
    // Extract props pattern
    const propsRegex = /interface\s+([A-Za-z0-9]+Props)\s*{([^}]*)}/g;
    const props = [];
    
    let match;
    while ((match = propsRegex.exec(source)) !== null) {
      const interfaceName = match[1];
      const propsContent = match[2];
      
      // Parse individual props
      const propLines = propsContent.split('\n');
      const propDetails = propLines
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('//'))
        .map(line => {
          const [propDef, ...comment] = line.split('//');
          const optional = propDef.includes('?:');
          const propName = propDef.split(/[?:]:/)[0].trim();
          const propType = propDef.split(/[?:]:/)[1]?.trim();
          
          return {
            name: propName,
            type: propType,
            optional,
            description: comment.join('//').trim()
          };
        });
      
      props.push({
        interfaceName,
        props: propDetails
      });
    }
    
    return props;
  }
  
  /**
   * Get complexity score for a component
   */
  static getComplexityScore(source: string): number {
    // A very basic complexity calculation
    let score = 0;
    
    // Count state hooks
    const stateHooks = (source.match(/useState/g) || []).length;
    score += stateHooks * 2;
    
    // Count effect hooks
    const effectHooks = (source.match(/useEffect/g) || []).length;
    score += effectHooks * 3;
    
    // Count callbacks
    const callbacks = (source.match(/useCallback/g) || []).length;
    score += callbacks;
    
    // Count conditionals
    const conditionals = (source.match(/if\s*\(/g) || []).length;
    score += conditionals;
    
    // Count loops
    const loops = (source.match(/for\s*\(/g) || []).length;
    score += loops * 2;
    
    return score;
  }
  
  /**
   * Get dependencies of a component
   */
  static getDependencies(source: string): string[] {
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies = [];
    
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      const from = match[2];
      
      imports.forEach(importName => {
        dependencies.push({
          name: importName,
          source: from
        });
      });
    }
    
    return dependencies;
  }
  
  /**
   * Get hooks used in a component
   */
  static getHooks(source: string): string[] {
    const hooksRegex = /use[A-Z][a-zA-Z]*/g;
    const hooks = [];
    
    let match;
    while ((match = hooksRegex.exec(source)) !== null) {
      if (!hooks.includes(match[0])) {
        hooks.push(match[0]);
      }
    }
    
    return hooks;
  }
  
  /**
   * Get child components used in a component
   */
  static getChildComponents(source: string): string[] {
    // Look for JSX components (starts with capital letter)
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
    const components = [];
    
    let match;
    while ((match = componentRegex.exec(source)) !== null) {
      if (!components.includes(match[1])) {
        components.push(match[1]);
      }
    }
    
    return components;
  }
}
