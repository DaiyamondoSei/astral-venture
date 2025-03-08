
import { devLogger } from '@/utils/debugUtils';
import { codePatternRegistry } from './CodePatternRegistry';

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
  private knownMatches: Map<string, PatternMatch[]> = new Map();
  
  /**
   * Analyze code for registered patterns
   */
  public analyzeCode(file: string, code: string, context?: any): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    for (const pattern of codePatternRegistry.getAllPatterns()) {
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
   * Apply a pattern's suggested fix to code
   */
  public applyFix(file: string, patternId: string, code: string, context?: any): string | null {
    const pattern = codePatternRegistry.getPattern(patternId);
    
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
   * Get a pattern by ID
   */
  public getPattern(patternId: string): CodePattern | undefined {
    return codePatternRegistry.getPattern(patternId);
  }
  
  /**
   * Get a summary of pattern matches by category
   */
  public getMatchesByCategory(): Record<CodePattern['category'], PatternMatch[]> {
    const result: Record<CodePattern['category'], PatternMatch[]> = {
      architecture: [],
      performance: [],
      style: [],
      quality: []
    };
    
    // Combine all matches from all files
    const allMatches: PatternMatch[] = [];
    this.knownMatches.forEach(fileMatches => {
      allMatches.push(...fileMatches);
    });
    
    // Group by category
    allMatches.forEach(match => {
      const pattern = codePatternRegistry.getPattern(match.patternId);
      if (pattern) {
        result[pattern.category].push(match);
      }
    });
    
    return result;
  }
  
  /**
   * Get a summary of pattern matches by severity
   */
  public getMatchesBySeverity(): Record<CodePattern['severity'], PatternMatch[]> {
    const result: Record<CodePattern['severity'], PatternMatch[]> = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    // Combine all matches
    const allMatches: PatternMatch[] = [];
    this.knownMatches.forEach(fileMatches => {
      allMatches.push(...fileMatches);
    });
    
    // Group by severity
    allMatches.forEach(match => {
      const pattern = codePatternRegistry.getPattern(match.patternId);
      if (pattern) {
        result[pattern.severity].push(match);
      }
    });
    
    return result;
  }
  
  /**
   * Find the most common patterns in the codebase
   */
  public getMostCommonPatterns(limit: number = 5): { patternId: string; count: number }[] {
    const patternCounts: Record<string, number> = {};
    
    // Count occurrences of each pattern
    this.knownMatches.forEach(matches => {
      matches.forEach(match => {
        patternCounts[match.patternId] = (patternCounts[match.patternId] || 0) + 1;
      });
    });
    
    // Convert to array and sort
    return Object.entries(patternCounts)
      .map(([patternId, count]) => ({ patternId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  /**
   * Reset all pattern matches
   */
  public reset(): void {
    this.knownMatches.clear();
  }
}

// Export singleton instance
export const patternAnalyzer = new PatternAnalyzer();
