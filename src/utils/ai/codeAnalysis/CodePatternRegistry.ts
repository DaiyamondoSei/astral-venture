
import { CodePattern } from './PatternAnalyzer';
import { devLogger } from '@/utils/debugUtils';

/**
 * Registry for code patterns that can be detected in the codebase
 */
export class CodePatternRegistry {
  private patterns: Map<string, CodePattern> = new Map();
  
  /**
   * Register a new pattern
   */
  public registerPattern(pattern: CodePattern): void {
    if (this.patterns.has(pattern.id)) {
      devLogger.warn('CodePatternRegistry', `Pattern with ID ${pattern.id} already exists. Overwriting.`);
    }
    
    this.patterns.set(pattern.id, pattern);
    devLogger.info('CodePatternRegistry', `Registered pattern: ${pattern.name}`);
  }
  
  /**
   * Register multiple patterns at once
   */
  public registerPatterns(patterns: CodePattern[]): void {
    patterns.forEach(pattern => this.registerPattern(pattern));
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
   * Clear all registered patterns
   */
  public clear(): void {
    this.patterns.clear();
    devLogger.info('CodePatternRegistry', 'All patterns cleared');
  }
}

// Export singleton instance
export const codePatternRegistry = new CodePatternRegistry();

// Register default patterns
// This would be expanded with more patterns in a full implementation
codePatternRegistry.registerPatterns([
  {
    id: 'unused-state',
    name: 'Unused State Variable',
    description: 'State variable is declared but never used',
    detectFn: (code: string) => {
      // A simple detection for demonstration
      return /const \[[a-zA-Z0-9]+, set[A-Z][a-zA-Z0-9]+\] = useState/.test(code) &&
             !/(set[A-Z][a-zA-Z0-9]+\()/.test(code);
    },
    category: 'quality',
    severity: 'medium',
    goodExample: 'const [count, setCount] = useState(0); /* Then use setCount somewhere */',
    badExample: 'const [count, setCount] = useState(0); /* But setCount is never used */',
  },
  {
    id: 'missing-dependency',
    name: 'Missing useEffect Dependency',
    description: 'useEffect hook might be missing dependencies',
    detectFn: (code: string) => {
      // Simplified detection for demonstration
      return /useEffect\(\(\) => {[\s\S]+?}, \[\]\);/.test(code);
    },
    category: 'performance',
    severity: 'high',
    goodExample: 'useEffect(() => { doSomething(value); }, [value]);',
    badExample: 'useEffect(() => { doSomething(value); }, []); // Missing value dependency',
  }
]);
