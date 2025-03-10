
import { moderateContent } from './moderationService.ts';
import { generateChatResponse } from './chatService.ts';
import { generateStreamingResponse } from './streamingService.ts';
import { 
  AIModel, 
  ChatMetrics, 
  ChatOptions, 
  ContentModerationType 
} from './types.ts';

/**
 * Select the optimal AI model based on input complexity and requirements
 * 
 * @param input The user input text
 * @param options Configuration options
 * @returns The selected optimal AI model
 */
export function selectOptimalModel(
  input: string,
  options: {
    preferFaster?: boolean;
    preferHigherQuality?: boolean;
    maxCost?: 'low' | 'medium' | 'high';
    requiredFeatures?: string[];
  } = {}
): AIModel {
  const {
    preferFaster = false,
    preferHigherQuality = false,
    maxCost = 'medium',
    requiredFeatures = []
  } = options;
  
  // Calculate input complexity
  const wordCount = input.split(/\s+/).length;
  const complexityScore = calculateComplexityScore(input);
  
  // Check for specific feature requirements
  const needsAdvancedReasoning = 
    requiredFeatures.includes('reasoning') || 
    detectReasoningRequirement(input);
  
  const needsCode = 
    requiredFeatures.includes('code') ||
    detectCodeRequirement(input);
  
  // Fast path for simple queries
  if (preferFaster && wordCount < 30 && complexityScore < 0.3) {
    return 'gpt-3.5-turbo';
  }
  
  // Higher quality path
  if (preferHigherQuality || needsAdvancedReasoning) {
    return maxCost === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
  }
  
  // Code-related content
  if (needsCode) {
    return 'gpt-4o-mini';
  }
  
  // Default selection based on complexity
  if (complexityScore > 0.7 || wordCount > 200) {
    return maxCost === 'low' ? 'gpt-3.5-turbo' : 'gpt-4o-mini';
  }
  
  if (complexityScore > 0.4 || wordCount > 100) {
    return 'gpt-4o-mini';
  }
  
  return 'gpt-3.5-turbo';
}

/**
 * Calculate the complexity score of a text input
 */
function calculateComplexityScore(text: string): number {
  // Calculate average word length
  const words = text.split(/\s+/);
  const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Factor in sentence complexity
  const sentences = text.split(/[.!?]+/);
  const averageSentenceLength = words.length / Math.max(sentences.length, 1);
  
  // Check for complex question patterns
  const hasComparisonPattern = /compar(e|ison)|versus|vs\.|better than|difference between/i.test(text);
  const hasAnalysisPattern = /analy(s|z)e|explain|why|how come|reason/i.test(text);
  const hasMultiPartQuestion = (text.match(/\?/g) || []).length > 1;
  
  // Combine factors into a single score between 0 and 1
  let complexityScore = 0;
  complexityScore += Math.min(averageWordLength / 10, 0.3);
  complexityScore += Math.min(averageSentenceLength / 25, 0.3);
  complexityScore += hasComparisonPattern ? 0.2 : 0;
  complexityScore += hasAnalysisPattern ? 0.15 : 0;
  complexityScore += hasMultiPartQuestion ? 0.15 : 0;
  
  return Math.min(complexityScore, 1);
}

/**
 * Detect if the input requires advanced reasoning
 */
function detectReasoningRequirement(text: string): boolean {
  const reasoningPatterns = [
    /why|how come|explain|analy(s|z)e|reason|think|logic|understand|perspective/i,
    /compare|contrast|difference|similarities|better|worse|best|optimal/i,
    /complex|difficult|challenging|nuanced|subtle|advanced/i
  ];
  
  return reasoningPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect if the input requires code generation or understanding
 */
function detectCodeRequirement(text: string): boolean {
  const codePatterns = [
    /code|function|algorithm|program|script|implementation/i,
    /javascript|typescript|python|java|c\+\+|ruby|go|rust|php/i,
    /class|method|interface|api|library|framework/i,
    /refactor|optimize|debug|fix|error|bug/i
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
}

export {
  moderateContent,
  generateChatResponse,
  generateStreamingResponse
};

export type {
  AIModel,
  ContentModerationType,
  ChatMetrics,
  ChatOptions
};
