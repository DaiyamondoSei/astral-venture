
/**
 * Model selection service for optimal AI model choice
 */
import type { AIModel } from "./types.ts";

/**
 * Factors for model selection
 */
interface ModelSelectionFactors {
  messageLength: number;
  complexity: number;
  requiresVision: boolean;
  fastResponseNeeded: boolean;
  costSensitive: boolean;
}

/**
 * Select the optimal AI model based on message characteristics
 * 
 * @param message The user's message
 * @param options Optional factors to consider in model selection
 * @returns The recommended AI model to use
 */
export function selectOptimalModel(
  message: string,
  options?: Partial<ModelSelectionFactors>
): AIModel {
  // Extract or set default selection factors
  const factors = {
    messageLength: message.length,
    complexity: calculateComplexity(message),
    requiresVision: message.includes("http") || 
                    /\.(jpg|jpeg|png|gif|webp)/i.test(message) || 
                    /(image|picture|photo|screenshot)/i.test(message),
    fastResponseNeeded: options?.fastResponseNeeded ?? false,
    costSensitive: options?.costSensitive ?? true
  };
  
  // Default to gpt-4o-mini for best balance of capability and cost
  let selectedModel: AIModel = "gpt-4o-mini";
  
  // For very complex queries, prefer more capable models
  if (factors.complexity > 0.8) {
    selectedModel = "gpt-4o";
  }
  
  // For very simple, short queries, use the smaller model
  else if (factors.complexity < 0.4 && factors.messageLength < 100) {
    selectedModel = "gpt-4o-mini";
  }
  
  // Vision capability needed
  if (factors.requiresVision === true) {
    // Only gpt-4o models support vision currently
    selectedModel = factors.costSensitive ? "gpt-4o-mini" : "gpt-4o";
  }
  
  // If fast response is critical, consider smaller models
  if (factors.fastResponseNeeded === true && selectedModel === "gpt-4o") {
    selectedModel = "gpt-4o-mini";
  }
  
  return selectedModel;
}

/**
 * Calculate message complexity on a scale from 0-1
 * Higher values indicate more complex queries
 * 
 * @param message User message
 * @returns Complexity score from 0-1
 */
function calculateComplexity(message: string): number {
  let complexity = 0;
  
  // Factor 1: Message length
  const normalizedLength = Math.min(message.length / 1000, 1);
  complexity += normalizedLength * 0.3;
  
  // Factor 2: Sentence complexity
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.reduce((acc, s) => {
    return acc + s.split(/\s+/).filter(Boolean).length;
  }, 0) / Math.max(sentences.length, 1);
  
  const sentenceComplexity = Math.min(avgWordsPerSentence / 25, 1);
  complexity += sentenceComplexity * 0.2;
  
  // Factor 3: Presence of technical terminology
  const technicalTerms = [
    'analyze', 'explain', 'complex', 'detailed', 'comprehensive', 
    'research', 'implement', 'algorithm', 'technical', 'scientific',
    'theory', 'principles', 'methods', 'methodology', 'framework',
    'structure', 'architecture', 'design', 'system', 'process'
  ];
  
  const technicalTermsCount = technicalTerms.reduce((count, term) => {
    return count + (message.toLowerCase().includes(term) ? 1 : 0);
  }, 0);
  
  const technicalComplexity = Math.min(technicalTermsCount / 10, 1);
  complexity += technicalComplexity * 0.25;
  
  // Factor 4: Presence of question marks
  const questionCount = (message.match(/\?/g) || []).length;
  const questionComplexity = Math.min(questionCount / 5, 1);
  complexity += questionComplexity * 0.15;
  
  // Factor 5: Presence of code or structured data
  const hasCode = /```|\{\s*["']|\[\s*[{"']|function|const|let|var|import|export|class|=>/.test(message);
  const codeComplexity = hasCode ? 1 : 0;
  complexity += codeComplexity * 0.1;
  
  return complexity;
}
