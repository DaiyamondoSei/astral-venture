/**
 * Model selection and optimization for OpenAI requests
 */
import type { AIModel } from "./types.ts";

// Default model fallback
const DEFAULT_MODEL: AIModel = "gpt-4o-mini";

// Model capability tiers
const MODEL_TIERS = {
  basic: ["gpt-3.5-turbo"],
  standard: ["gpt-4o-mini"],
  advanced: ["gpt-4o", "gpt-4-turbo"],
  specialized: ["gpt-4-vision-preview"] 
};

// Token limits by model (approximate)
const MODEL_TOKEN_LIMITS: Record<AIModel, number> = {
  "gpt-3.5-turbo": 16000,
  "gpt-4o-mini": 16000,
  "gpt-4o": 32000,
  "gpt-4-turbo": 128000,
  "gpt-4-1106-preview": 128000,
  "gpt-4-vision-preview": 128000
};

// Cost tiers (relative cost multipliers)
const MODEL_COST_TIERS: Record<AIModel, number> = {
  "gpt-3.5-turbo": 1,
  "gpt-4o-mini": 3,
  "gpt-4o": 10,
  "gpt-4-turbo": 10,
  "gpt-4-1106-preview": 10,
  "gpt-4-vision-preview": 12
};

// Capability flags
const MODEL_CAPABILITIES: Record<AIModel, {
  vision: boolean;
  functionCalling: boolean;
  longContext: boolean;
}> = {
  "gpt-3.5-turbo": {
    vision: false,
    functionCalling: true,
    longContext: false
  },
  "gpt-4o-mini": {
    vision: true,
    functionCalling: true,
    longContext: false
  },
  "gpt-4o": {
    vision: true,
    functionCalling: true,
    longContext: true
  },
  "gpt-4-turbo": {
    vision: false,
    functionCalling: true,
    longContext: true
  },
  "gpt-4-1106-preview": {
    vision: false,
    functionCalling: true,
    longContext: true
  },
  "gpt-4-vision-preview": {
    vision: true,
    functionCalling: true,
    longContext: true
  }
};

/**
 * Select the optimal model based on message content and requirements
 * 
 * @param message - User message to analyze
 * @param options - Selection options including requirements
 * @returns Optimal model for the request
 */
export function selectOptimalModel(
  message: string,
  options?: {
    preferredModel?: AIModel;
    requiresVision?: boolean;
    requiresFunctions?: boolean;
    estimatedTokens?: number;
    costSensitive?: boolean;
  }
): AIModel {
  // Use preferred model if specified
  if (options?.preferredModel) {
    return options.preferredModel;
  }

  // Set default requirements
  const requiresVision = options?.requiresVision === true;
  const requiresFunctions = options?.requiresFunctions === true;
  const costSensitive = options?.costSensitive !== false; // Default to cost-sensitive
  
  // Estimate tokens if not provided
  const estimatedTokens = options?.estimatedTokens || estimateTokenCount(message);
  
  // Filter models that meet requirements
  const validModels = Object.keys(MODEL_CAPABILITIES).filter(model => {
    const capabilities = MODEL_CAPABILITIES[model as AIModel];
    const tokenLimit = MODEL_TOKEN_LIMITS[model as AIModel];
    
    // Check if model meets all requirements
    return (
      (!requiresVision || capabilities.vision) &&
      (!requiresFunctions || capabilities.functionCalling) &&
      estimatedTokens < tokenLimit * 0.8 // Allow 80% of token limit
    );
  }) as AIModel[];
  
  if (validModels.length === 0) {
    // No models meet requirements, use default
    return DEFAULT_MODEL;
  }
  
  // If cost-sensitive, find the cheapest valid model
  if (costSensitive) {
    return validModels.reduce((cheapest, model) => {
      return MODEL_COST_TIERS[model] < MODEL_COST_TIERS[cheapest] ? model : cheapest;
    });
  }
  
  // Otherwise, use the most capable model
  return validModels.reduce((mostCapable, model) => {
    return MODEL_COST_TIERS[model] > MODEL_COST_TIERS[mostCapable] ? model : mostCapable;
  });
}

/**
 * Analyze message complexity to determine appropriate model
 * 
 * @param message - Message to analyze
 * @returns Complexity score
 */
export function analyzeMessageComplexity(message: string): number {
  // Simple complexity heuristics
  const wordCount = message.split(/\s+/).length;
  const sentenceCount = message.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / Math.max(1, sentenceCount);
  
  // Calculate base complexity score
  let complexity = 0;
  
  // Factor 1: Message length
  if (wordCount < 10) complexity += 1;
  else if (wordCount < 50) complexity += 2;
  else if (wordCount < 200) complexity += 3;
  else complexity += 4;
  
  // Factor 2: Sentence complexity
  if (avgSentenceLength < 8) complexity += 1;
  else if (avgSentenceLength < 15) complexity += 2;
  else complexity += 3;
  
  // Factor 3: Special content indicators
  const containsCode = /```[\s\S]+```/.test(message) || /`[\w\s(){}[\].,;:+=<>!@#$%^&*-]+`/.test(message);
  const containsUrls = /https?:\/\/\S+/.test(message);
  const containsNumbers = /\d+\.\d+/.test(message);
  const containsSpecialChars = /[^\w\s]/.test(message);
  
  if (containsCode) complexity += 2;
  if (containsUrls) complexity += 1;
  if (containsNumbers) complexity += 1;
  if (containsSpecialChars) complexity += 1;
  
  return complexity;
}

/**
 * Estimate token count for a given message
 * 
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Simple token estimation heuristic
  // GPT tokenization is complex, but words/4 gives a reasonable approximation
  const wordCount = text.split(/\s+/).length;
  const characterCount = text.length;
  
  // Estimate tokens using average of word and character heuristics
  const wordBasedEstimate = Math.ceil(wordCount * 1.4);
  const charBasedEstimate = Math.ceil(characterCount / 4);
  
  return Math.max(wordBasedEstimate, charBasedEstimate);
}
