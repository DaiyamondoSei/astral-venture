
import { useState, useEffect, useCallback } from 'react';
import { patternAnalyzer, PatternMatch } from '@/utils/ai/codeAnalysis/PatternAnalyzer';
import { codePatternRegistry } from '@/utils/ai/codeAnalysis/CodePatternRegistry';
import { aiLearningSystem } from '@/utils/ai/AIAssistantLearningSystem';

export interface CodeAnalysisResult {
  matches: PatternMatch[];
  mostCriticalIssues: PatternMatch[];
  suggestions: string[];
  applyFix: (patternId: string, code: string) => string | null;
  analyzedAt: Date;
}

/**
 * Hook for analyzing code and providing suggestions for improvement
 * 
 * @param file Filename or identifier for the code being analyzed
 * @param code The code to analyze
 * @param context Optional context about the code (e.g. component type)
 * @returns Analysis results with suggestions and auto-fix capability
 */
export function useCodeAnalysis(
  file: string,
  code: string,
  context?: any
): CodeAnalysisResult {
  const [result, setResult] = useState<CodeAnalysisResult>({
    matches: [],
    mostCriticalIssues: [],
    suggestions: [],
    applyFix: () => null,
    analyzedAt: new Date()
  });
  
  // Function to generate readable suggestions from pattern matches
  const generateSuggestions = useCallback((matches: PatternMatch[]): string[] => {
    return matches.map(match => {
      const pattern = codePatternRegistry.getPattern(match.patternId);
      if (!pattern) return '';
      
      let suggestion = `${pattern.name}: ${pattern.description}`;
      
      if (pattern.goodExample) {
        suggestion += `\nRecommended approach: ${pattern.goodExample}`;
      }
      
      if (pattern.suggestedFix) {
        suggestion += '\n(This issue can be automatically fixed)';
      }
      
      return suggestion;
    }).filter(Boolean);
  }, []);
  
  // Analyze the code when it changes
  useEffect(() => {
    if (!code || !file) return;
    
    // Analyze the code
    const matches = patternAnalyzer.analyzeCode(file, code, context);
    
    // Record detected patterns in the learning system
    matches.forEach(match => {
      aiLearningSystem.recordEvent('pattern_detected', {
        patternId: match.patternId,
        file,
        timestamp: new Date()
      });
    });
    
    // Find critical issues (high or critical severity)
    const criticalIssues = matches.filter(match => {
      const pattern = codePatternRegistry.getPattern(match.patternId);
      return pattern && (pattern.severity === 'critical' || pattern.severity === 'high');
    });
    
    // Generate text suggestions
    const suggestions = generateSuggestions(matches);
    
    // Update the result
    setResult({
      matches,
      mostCriticalIssues: criticalIssues,
      suggestions,
      applyFix: (patternId, codeToFix) => 
        patternAnalyzer.applyFix(file, patternId, codeToFix || code, context),
      analyzedAt: new Date()
    });
  }, [code, file, context, generateSuggestions]);
  
  return result;
}
