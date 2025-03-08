
import { devLogger } from '@/utils/debugUtils';

export interface CodePattern {
  id: string;
  name: string;
  description: string;
  detectFn: (code: string, context?: any) => boolean;
  goodExample?: string;
  badExample?: string;
  suggestedFix?: (code: string, context?: any) => string;
  category: 'architecture' | 'performance' | 'style' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface PatternMatch {
  patternId: string;
  file: string;
  lineStart?: number;
  lineEnd?: number;
  context?: any;
  autoFixable: boolean;
}

/**
 * Pattern Analyzer that detects code patterns and anti-patterns
 * in components and other code files
 */
export class PatternAnalyzer {
  private patterns: Map<string, CodePattern> = new Map();
  private knownMatches: Map<string, PatternMatch[]> = new Map();
  
  constructor() {
    this.registerDefaultPatterns();
  }
  
  /**
   * Register a new code pattern to detect
   */
  public registerPattern(pattern: CodePattern): void {
    this.patterns.set(pattern.id, pattern);
    devLogger.info('PatternAnalyzer', `Registered pattern: ${pattern.name}`);
  }
  
  /**
   * Analyze code for registered patterns
   */
  public analyzeCode(file: string, code: string, context?: any): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    for (const pattern of this.patterns.values()) {
      try {
        if (pattern.detectFn(code, context)) {
          matches.push({
            patternId: pattern.id,
            file,
            context,
            autoFixable: !!pattern.suggestedFix
          });
          
          devLogger.info('PatternAnalyzer', `Detected pattern "${pattern.name}" in ${file}`);
        }
      } catch (error) {
        devLogger.error('PatternAnalyzer', `Error detecting pattern "${pattern.id}": ${error}`);
      }
    }
    
    // Store the matches for this file
    this.knownMatches.set(file, matches);
    
    return matches;
  }
  
  /**
   * Get a pattern by ID
   */
  public getPattern(id: string): CodePattern | undefined {
    return this.patterns.get(id);
  }
  
  /**
   * Apply a pattern's suggested fix to code
   */
  public applyFix(file: string, patternId: string, code: string, context?: any): string | null {
    const pattern = this.patterns.get(patternId);
    
    if (!pattern || !pattern.suggestedFix) {
      return null;
    }
    
    try {
      const fixedCode = pattern.suggestedFix(code, context);
      devLogger.info('PatternAnalyzer', `Applied fix for pattern "${pattern.name}" in ${file}`);
      return fixedCode;
    } catch (error) {
      devLogger.error('PatternAnalyzer', `Error applying fix for "${patternId}": ${error}`);
      return null;
    }
  }
  
  /**
   * Get all matches for a specific file
   */
  public getMatchesForFile(file: string): PatternMatch[] {
    return this.knownMatches.get(file) || [];
  }
  
  /**
   * Get patterns by category
   */
  public getPatternsByCategory(category: CodePattern['category']): CodePattern[] {
    return Array.from(this.patterns.values())
      .filter(pattern => pattern.category === category);
  }
  
  /**
   * Register default patterns to detect common issues
   */
  private registerDefaultPatterns(): void {
    // Large component pattern
    this.registerPattern({
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
        
        return lines.length > 150; // Consider components with more than 150 lines as too large
      },
      goodExample: 'A component with focused responsibility that is less than 100 lines',
      badExample: 'A 400-line component handling multiple concerns',
    });
    
    // Excessive useState pattern
    this.registerPattern({
      id: 'excessive-usestate',
      name: 'Excessive useState',
      description: 'Component uses too many useState hooks and should consider useReducer',
      category: 'architecture',
      severity: 'medium',
      detectFn: (code: string) => {
        const useStateMatches = code.match(/useState\(/g);
        return useStateMatches !== null && useStateMatches.length >= 5;
      },
      goodExample: 'Using useReducer for complex state',
      badExample: 'A component with 8+ useState hooks',
    });
    
    // Missing memo pattern
    this.registerPattern({
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
        // Simple heuristic to add memo - in reality would need more sophisticated parsing
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
    });
    
    // And more patterns would be registered here...
  }
}

// Export singleton instance
export const patternAnalyzer = new PatternAnalyzer();
