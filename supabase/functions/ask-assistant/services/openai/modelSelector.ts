
/**
 * Model selector for OpenAI API
 * Intelligently selects the best model based on message complexity and requirements
 */

import { AIModel } from "./types.ts";

// Token estimation constants
const AVG_TOKENS_PER_WORD = 1.35;
const AVG_TOKENS_PER_CHAR = 0.25;

/**
 * Estimate the number of tokens in a text
 * This is a rough estimate, not an exact count
 * 
 * @param text Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Count words and characters for a better estimate
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  // Weighted average of word-based and character-based estimates
  return Math.ceil(
    (wordCount * AVG_TOKENS_PER_WORD * 0.7) + 
    (charCount * AVG_TOKENS_PER_CHAR * 0.3)
  );
}

/**
 * Analyze message complexity based on various factors
 * 
 * @param message User message
 * @returns Complexity score (0-100)
 */
export function analyzeMessageComplexity(message: string): number {
  if (!message) return 0;
  
  let complexityScore = 0;
  
  // Length factor (longer messages are typically more complex)
  const wordCount = message.split(/\s+/).length;
  complexityScore += Math.min(wordCount / 5, 30); // Max 30 points for length
  
  // Linguistic complexity factors
  const sentenceCount = message.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  complexityScore += Math.min(avgWordsPerSentence / 2, 15); // Max 15 points
  
  // Specialized content indicators
  const technicalTerms = [
    "algorithm", "function", "code", "neural", "quantum", "technical",
    "analyze", "complex", "detailed", "programming", "technical", "scientific"
  ];
  
  const technicalMatches = technicalTerms.filter(term => 
    message.toLowerCase().includes(term)
  ).length;
  
  complexityScore += technicalMatches * 5; // 5 points per technical term
  
  // Check for requested analysis or detailed explanation
  if (
    message.toLowerCase().includes("explain") || 
    message.toLowerCase().includes("analyze") ||
    message.toLowerCase().includes("compare") ||
    message.toLowerCase().includes("difference between")
  ) {
    complexityScore += 10;
  }
  
  // Multipart questions
  const questionMarks = (message.match(/\?/g) || []).length;
  complexityScore += questionMarks * 5; // 5 points per question
  
  // Cap at 100
  return Math.min(Math.round(complexityScore), 100);
}

/**
 * Check if message requires advanced reasoning capabilities
 * 
 * @param message User message
 * @returns True if advanced reasoning is needed
 */
export function requiresAdvancedReasoning(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Keywords indicating advanced reasoning needs
  const advancedReasoningPatterns = [
    /complex (analysis|reasoning)/,
    /detailed (explanation|analysis)/,
    /philosophical/,
    /compare and contrast/,
    /implications of/,
    /(ethical|moral) considerations/,
    /multi-step/,
    /nuanced/,
    /trade-offs/
  ];
  
  return advancedReasoningPatterns.some(pattern => pattern.test(lowerMessage));
}

/**
 * Check if message contains visual analysis request
 * 
 * @param message User message
 * @returns True if visual analysis is needed
 */
export function requiresVisualAnalysis(message: string): boolean {
  // Currently we're not supporting image analysis
  // This is a placeholder for future implementation
  return false;
}

/**
 * Select the optimal model based on message content and complexity
 * 
 * @param message User message
 * @returns Selected AI model
 */
export function selectOptimalModel(message: string): AIModel {
  // Estimate token count
  const estimatedTokens = estimateTokenCount(message);
  
  // Analyze complexity
  const complexity = analyzeMessageComplexity(message);
  
  // Check for special requirements
  const needsAdvancedReasoning = requiresAdvancedReasoning(message);
  const needsVisualAnalysis = requiresVisualAnalysis(message);
  
  // Select model based on requirements
  if (needsVisualAnalysis) {
    return "gpt-4o"; // Visual analysis requires GPT-4 with vision
  }
  
  if (needsAdvancedReasoning || complexity > 70) {
    // Complex queries benefit from GPT-4's advanced reasoning
    return "gpt-4o";
  }
  
  if (estimatedTokens > 1500 || complexity > 40) {
    // Moderate complexity or longer texts
    return "gpt-4o-mini";
  }
  
  // Default for simple queries
  return "gpt-4o-mini";
}
