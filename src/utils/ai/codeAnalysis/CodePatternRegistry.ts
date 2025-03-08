
import { CodePattern } from './PatternAnalyzer';
import { devLogger } from '@/utils/debugUtils';

/**
 * Registry for code patterns that can be detected in the codebase
 * Separates pattern definitions from the analyzer implementation
 */
export class CodePatternRegistry {
  private patterns: Map<string, CodePattern> = new Map();
  
  /**
   * Register a new code pattern
   */
  public register(pattern: CodePattern): void {
    this.patterns.set(pattern.id, pattern);
    devLogger.info('CodePatternRegistry', `Registered pattern: ${pattern.name}`);
  }
  
  /**
   * Get a pattern by ID
   */
  public getPattern(id: string): CodePattern | undefined {
    return this.patterns.get(id);
  }
  
  /**
   * Get all registered patterns
   */
  public getAllPatterns(): CodePattern[] {
    return Array.from(this.patterns.values());
  }
  
  /**
   * Get patterns by category
   */
  public getPatternsByCategory(category: CodePattern['category']): CodePattern[] {
    return this.getAllPatterns().filter(pattern => pattern.category === category);
  }
  
  /**
   * Get patterns by severity
   */
  public getPatternsBySeverity(severity: CodePattern['severity']): CodePattern[] {
    return this.getAllPatterns().filter(pattern => pattern.severity === severity);
  }
  
  /**
   * Register multiple patterns at once
   */
  public registerMany(patterns: CodePattern[]): void {
    patterns.forEach(pattern => this.register(pattern));
  }
}

// Create and export the default pattern registry instance
export const codePatternRegistry = new CodePatternRegistry();

// Register default patterns
export function registerDefaultPatterns(): void {
  // Architecture patterns
  codePatternRegistry.registerMany([
    {
      id: 'large-component',
      name: 'Large Component',
      description: 'Component is too large and should be broken down into smaller components',
      category: 'architecture',
      severity: 'high',
      detectFn: (code: string) => {
        // Count non-empty, non-comment lines
        const lines = code.split('\n')
          .filter(line => line.trim() !== '')
          .filter(line => !line.trim().startsWith('//'))
          .filter(line => !line.trim().startsWith('/*'))
          .filter(line => !line.trim().startsWith('*'));
        
        return lines.length > 150;
      },
      goodExample: 'A component with focused responsibility that is less than 100 lines',
      badExample: 'A 400-line component handling multiple concerns',
    },
    {
      id: 'excessive-nesting',
      name: 'Excessive Component Nesting',
      description: 'Too many levels of nested components can harm readability and performance',
      category: 'architecture',
      severity: 'medium',
      detectFn: (code: string) => {
        // Count JSX closing tags with indentation greater than 4 levels
        const jsxClosingWithIndent = code.match(/^\s{8,}<\/[A-Z][A-Za-z0-9]*>/gm);
        return jsxClosingWithIndent !== null && jsxClosingWithIndent.length > 5;
      },
      goodExample: 'Flat component hierarchy with composition',
      badExample: 'Deeply nested component structure with > 5 levels',
    }
  ]);
  
  // Performance patterns
  codePatternRegistry.registerMany([
    {
      id: 'missing-memo',
      name: 'Missing Memo',
      description: 'Component could benefit from React.memo to prevent unnecessary re-renders',
      category: 'performance',
      severity: 'medium',
      detectFn: (code: string) => {
        // Component takes props but isn't memoized
        return (
          code.includes('interface') && 
          code.includes('Props') && 
          !code.includes('memo(') && 
          !code.includes('React.memo(')
        );
      },
      goodExample: 'export default memo(Component);',
      badExample: 'export default Component;',
      suggestedFix: (code: string) => {
        if (!code.includes('import { memo }') && !code.includes('import React, {')) {
          code = code.replace(
            'import React from',
            'import React, { memo } from'
          );
        }
        
        return code.replace(
          /export default (\w+);/g,
          'export default memo($1);'
        );
      }
    },
    {
      id: 'excessive-usestate',
      name: 'Excessive useState',
      description: 'Component uses too many useState hooks and should consider useReducer',
      category: 'performance',
      severity: 'medium',
      detectFn: (code: string) => {
        const useStateMatches = code.match(/useState\(/g);
        return useStateMatches !== null && useStateMatches.length >= 5;
      },
      goodExample: 'Using useReducer for complex state',
      badExample: 'A component with 8+ useState hooks',
    }
  ]);
  
  // Style patterns
  codePatternRegistry.registerMany([
    {
      id: 'inconsistent-naming',
      name: 'Inconsistent Naming',
      description: 'Component or variable names don\'t follow project conventions',
      category: 'style',
      severity: 'low',
      detectFn: (code: string, context?: any) => {
        // If it's a component file but component name doesn't match PascalCase
        if (context?.type === 'component') {
          const match = code.match(/function\s+([a-z][A-Za-z0-9]*)\s*\(/);
          return match !== null;
        }
        return false;
      },
      goodExample: 'function UserProfile() { ... }',
      badExample: 'function userProfile() { ... }',
    },
    {
      id: 'inline-styles',
      name: 'Inline Styles',
      description: 'Using inline styles instead of Tailwind or CSS classes',
      category: 'style',
      severity: 'low',
      detectFn: (code: string) => {
        const inlineStyleMatches = code.match(/style=\{(\{|style|styles)/g);
        return inlineStyleMatches !== null && inlineStyleMatches.length > 2;
      },
      goodExample: 'className="p-4 bg-blue-500 text-white"',
      badExample: 'style={{ padding: "16px", backgroundColor: "blue", color: "white" }}',
    }
  ]);
  
  // Quality patterns
  codePatternRegistry.registerMany([
    {
      id: 'missing-error-handling',
      name: 'Missing Error Handling',
      description: 'Async operations without proper error handling',
      category: 'quality',
      severity: 'high',
      detectFn: (code: string) => {
        // Has async/await but no try/catch
        return (
          code.includes('async') && 
          code.includes('await') && 
          !code.includes('try {') && 
          !code.includes('.catch(')
        );
      },
      goodExample: 'try { await fetchData() } catch (error) { handleError(error) }',
      badExample: 'const data = await fetchData();',
    },
    {
      id: 'any-type',
      name: 'Any Type Usage',
      description: 'Using the "any" type extensively defeats TypeScript\'s purpose',
      category: 'quality',
      severity: 'medium',
      detectFn: (code: string) => {
        const anyMatches = code.match(/: any(\[|\]|\)|\s|,|;|=)/g);
        return anyMatches !== null && anyMatches.length > 2;
      },
      goodExample: 'function process(data: UserData): Result { ... }',
      badExample: 'function process(data: any): any { ... }',
    }
  ]);
}

// Initialize the registry with default patterns
registerDefaultPatterns();
