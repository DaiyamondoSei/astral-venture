
import type { AIModel } from '@/supabase/functions/ask-assistant/services/openai/types';

/**
 * Input complexity level
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very-complex';

/**
 * Message priority level
 */
export type PriorityLevel = 'low' | 'normal' | 'high' | 'critical';

/**
 * Content characteristics for model selection
 */
export interface ContentCharacteristics {
  complexity?: ComplexityLevel;
  priority?: PriorityLevel;
  tokenEstimate?: number;
  containsCode?: boolean;
  isStreaming?: boolean;
  requiresCreativity?: boolean;
  requiresFactualAccuracy?: boolean;
  isMultilingualContent?: boolean;
  containsMathOrLogic?: boolean;
  userPreference?: AIModel;
}

/**
 * Select the optimal model based on content characteristics
 */
export function selectOptimalModel(
  characteristics: ContentCharacteristics = {}
): AIModel {
  // If user has a specific preference, honor it
  if (characteristics.userPreference) {
    return characteristics.userPreference;
  }

  // Critical priority messages that need high accuracy go to the strongest model
  if (characteristics.priority === 'critical' || 
      characteristics.requiresFactualAccuracy === true) {
    return 'gpt-4o';
  }

  // Complex code generation tasks benefit from more capable models
  if (characteristics.containsCode === true && 
      (characteristics.complexity === 'complex' || 
       characteristics.complexity === 'very-complex')) {
    return 'gpt-4o';
  }
  
  // Tasks involving complex math or logic reasoning
  if (characteristics.containsMathOrLogic === true &&
      (characteristics.complexity === 'complex' || 
       characteristics.complexity === 'very-complex')) {
    return 'gpt-4o';
  }

  // High priority or complex content that doesn't need the absolute best
  if ((characteristics.priority === 'high' || 
       characteristics.complexity === 'complex') &&
      characteristics.requiresFactualAccuracy !== true) {
    return 'gpt-4o-mini';
  }
  
  // Medium complexity multilingual content 
  if (characteristics.isMultilingualContent === true &&
      characteristics.complexity !== 'simple') {
    return 'gpt-4o-mini';
  }

  // Default to most cost-effective model for everything else
  if (characteristics.complexity === 'simple' || 
      characteristics.priority === 'low' ||
      characteristics.tokenEstimate && characteristics.tokenEstimate < 1000) {
    return 'gpt-3.5-turbo';
  }

  // For typical use cases with moderate complexity
  return 'gpt-4o-mini';
}

/**
 * Detect complexity level from message content
 */
export function detectComplexity(message: string): ComplexityLevel {
  // Quick sanity check for empty strings
  if (!message || message.trim().length === 0) {
    return 'simple';
  }

  const wordCount = message.split(/\s+/).length;
  const sentenceCount = message.split(/[.!?]+/).length;
  const codeBlockCount = (message.match(/```/g) || []).length / 2;
  const bulletPointCount = (message.match(/^[\s]*[-*•]/gm) || []).length;
  const questionCount = (message.match(/\?/g) || []).length;
  
  // Keywords that suggest complexity
  const complexityKeywords = [
    'analyze', 'optimize', 'complex', 'architecture', 
    'algorithm', 'recursion', 'implementation',
    'framework', 'integrate', 'asynchronous',
    'distributed', 'refactor', 'compare'
  ];
  
  // Count the complexity keywords
  const keywordMatches = complexityKeywords.filter(keyword => 
    message.toLowerCase().includes(keyword)
  ).length;

  // Scoring system for complexity
  let complexityScore = 0;
  
  // Word count affects complexity
  if (wordCount > 500) complexityScore += 3;
  else if (wordCount > 200) complexityScore += 2;
  else if (wordCount > 50) complexityScore += 1;
  
  // Code blocks suggest complexity
  if (codeBlockCount > 2) complexityScore += 3;
  else if (codeBlockCount > 0) complexityScore += 2;
  
  // Multiple questions suggest complexity
  if (questionCount > 3) complexityScore += 2;
  else if (questionCount > 1) complexityScore += 1;
  
  // Structured content suggests complexity
  if (bulletPointCount > 5) complexityScore += 2;
  else if (bulletPointCount > 2) complexityScore += 1;
  
  // Keywords suggest complexity
  complexityScore += Math.min(3, keywordMatches);
  
  // Assign complexity level based on score
  if (complexityScore >= 7) return 'very-complex';
  if (complexityScore >= 4) return 'complex';
  if (complexityScore >= 2) return 'moderate';
  return 'simple';
}

/**
 * Analyze message and select the best model
 */
export function analyzeAndSelectModel(message: string, options: Partial<ContentCharacteristics> = {}): AIModel {
  const complexity = detectComplexity(message);
  
  // Auto-detect code content
  const containsCode = message.includes('```') || 
                       /^[\s]*[a-z]+\([^)]*\)/.test(message) ||
                       /\bfunction\b|\bclass\b|\bconst\b|\bvar\b|\blet\b/i.test(message);
  
  // Detect math content
  const containsMathOrLogic = /[-+*/=<>!&|^%]/.test(message) &&
                              /\d+/.test(message);
  
  // Estimate token count (rough heuristic: ~4 chars per token for English)
  const tokenEstimate = Math.ceil(message.length / 4);
  
  return selectOptimalModel({
    complexity,
    containsCode,
    containsMathOrLogic,
    tokenEstimate,
    ...options
  });
}

export default {
  selectOptimalModel,
  detectComplexity,
  analyzeAndSelectModel
};
