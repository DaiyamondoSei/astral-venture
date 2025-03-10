
import { AIModel } from "./types.ts";

/**
 * Model selection criteria
 */
interface ModelSelectionCriteria {
  textLength?: number;
  complexity?: 'low' | 'medium' | 'high';
  priority?: 'speed' | 'quality' | 'balanced';
  maxContextSize?: number;
  costConstraint?: 'low' | 'medium' | 'high';
}

/**
 * Model with its characteristics for selection
 */
interface ModelCharacteristics {
  name: AIModel;
  contextSize: number;
  complexity: number; // 0-10 scale
  speed: number; // 0-10 scale, 10 being fastest
  quality: number; // 0-10 scale, 10 being highest quality
  costFactor: number; // Relative cost, 1.0 as baseline
}

/**
 * Available models with their characteristics
 */
const models: ModelCharacteristics[] = [
  {
    name: "gpt-3.5-turbo",
    contextSize: 16000,
    complexity: 6,
    speed: 9,
    quality: 6,
    costFactor: 0.2
  },
  {
    name: "gpt-4o-mini",
    contextSize: 128000,
    complexity: 8,
    speed: 7,
    quality: 8,
    costFactor: 1.0
  },
  {
    name: "gpt-4o",
    contextSize: 128000,
    complexity: 10,
    speed: 5,
    quality: 10,
    costFactor: 5.0
  }
];

/**
 * Analyze text complexity based on various factors
 */
function analyzeTextComplexity(text: string): 'low' | 'medium' | 'high' {
  // Count various complexity indicators
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const technicalTerms = (text.match(/\b(algorithm|function|implementation|quantum|neural|framework|architecture|integration|middleware|database|asynchronous|concurrency|blockchain|encryption)\b/gi) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  const questionComplexity = (text.match(/\b(how|why|explain|describe|compare|analyze|define|evaluate|what is|difference between)\b/gi) || []).length;
  
  // Average words per sentence (a measure of complexity)
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Calculate complexity score
  let complexityScore = 0;
  
  // Base on length
  if (wordCount < 30) complexityScore += 1;
  else if (wordCount < 100) complexityScore += 2;
  else complexityScore += 3;
  
  // Add for technical terms
  complexityScore += Math.min(3, technicalTerms / 2);
  
  // Add for code blocks
  complexityScore += Math.min(3, codeBlocks * 1.5);
  
  // Add for question complexity
  complexityScore += Math.min(2, questionComplexity / 2);
  
  // Add for sentence complexity
  if (avgWordsPerSentence > 20) complexityScore += 2;
  else if (avgWordsPerSentence > 15) complexityScore += 1;
  
  // Determine final complexity level
  if (complexityScore < 4) return 'low';
  if (complexityScore < 7) return 'medium';
  return 'high';
}

/**
 * Select the optimal model based on input and criteria
 */
export function selectOptimalModel(
  input: string, 
  criteria: ModelSelectionCriteria = {}
): AIModel {
  // Analyze input if complexity isn't provided
  const complexity = criteria.complexity || analyzeTextComplexity(input);
  
  // Set default priority if not provided
  const priority = criteria.priority || 'balanced';
  
  // Set cost constraint if not provided
  const costConstraint = criteria.costConstraint || 'medium';
  
  // Calculate text length
  const textLength = criteria.textLength || input.length;
  
  // Map complexity to numerical value
  const complexityValue = complexity === 'low' ? 3 : complexity === 'medium' ? 6 : 9;
  
  // Filter models by context size constraint
  let eligibleModels = [...models];
  if (criteria.maxContextSize) {
    eligibleModels = eligibleModels.filter(m => m.contextSize <= criteria.maxContextSize);
  }
  
  // Filter models by cost constraint
  if (costConstraint === 'low') {
    eligibleModels = eligibleModels.filter(m => m.costFactor <= 1.0);
  } else if (costConstraint === 'medium') {
    eligibleModels = eligibleModels.filter(m => m.costFactor <= 3.0);
  }
  
  // If no eligible models, fall back to the cheapest one
  if (eligibleModels.length === 0) {
    return "gpt-3.5-turbo";
  }
  
  // Calculate a score for each model based on criteria
  const scoredModels = eligibleModels.map(model => {
    let score = 0;
    
    // Different scoring weights based on priority
    if (priority === 'speed') {
      score += model.speed * 2;
      score += model.quality * 0.5;
      // Penalize if the model is overkill for simple questions
      if (complexity === 'low' && model.complexity > 7) {
        score -= 3;
      }
    } else if (priority === 'quality') {
      score += model.quality * 2;
      score += model.speed * 0.3;
      // Bonus for complex questions with high-powered models
      if (complexity === 'high' && model.complexity > 8) {
        score += 3;
      }
    } else { // balanced
      score += model.quality * 1;
      score += model.speed * 1;
      
      // Match complexity better in balanced mode
      score -= Math.abs(model.complexity - complexityValue) * 0.5;
    }
    
    // Apply cost penalty
    score -= model.costFactor * 0.4;
    
    // Length consideration
    if (textLength > 1000 && model.contextSize < 32000) {
      score -= 2;
    }
    
    return { model: model.name, score };
  });
  
  // Sort by score
  scoredModels.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring model
  return scoredModels[0].model;
}

/**
 * Simple model selection from input complexity
 */
export function selectModelFromInput(input: string): AIModel {
  // Very simple model selection based on message length and complexity
  if (input.length > 1000 || /\b(complex|explain in detail|comprehensive|analyze|compare|evaluate)\b/i.test(input)) {
    return "gpt-4o-mini";
  }
  
  // Detect if the request likely involves code or technical concepts
  if (/\b(code|function|program|algorithm|implement|bug|error|refactor|optimize)\b/i.test(input)) {
    return "gpt-4o-mini";
  }
  
  // Default to the more affordable model for simple queries
  return "gpt-3.5-turbo";
}
