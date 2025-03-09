
/**
 * AI model definitions and selection utilities
 */

// AI model types
export enum AIModel {
  BASIC = 'basic',
  STANDARD = 'standard',
  ADVANCED = 'advanced'
}

// Model configuration
export interface AIModelConfig {
  name: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number;
}

// Model configurations
const modelConfigs: Record<AIModel, AIModelConfig> = {
  [AIModel.BASIC]: {
    name: 'gpt-3.5-turbo',
    maxTokens: 1024,
    temperature: 0.7,
    costPerToken: 0.000002
  },
  [AIModel.STANDARD]: {
    name: 'gpt-3.5-turbo-16k',
    maxTokens: 4096,
    temperature: 0.5,
    costPerToken: 0.000004
  },
  [AIModel.ADVANCED]: {
    name: 'gpt-4',
    maxTokens: 8192,
    temperature: 0.3,
    costPerToken: 0.00006
  }
};

/**
 * Select the optimal AI model based on question complexity and length
 * 
 * @param question The user's question text
 * @returns The appropriate AI model to use
 */
export function selectOptimalModel(question: string): AIModel {
  // Analyze question complexity
  const wordCount = question.split(/\s+/).length;
  const containsComplexTerms = /quantum|consciousness|spirituality|meditation|chakra|energy/i.test(question);
  const containsFollowUp = /previous|earlier|last time|you said|follow up|elaborate/i.test(question);
  
  // Select model based on criteria
  if (wordCount > 50 || containsComplexTerms || containsFollowUp) {
    return AIModel.ADVANCED;
  } else if (wordCount > 20) {
    return AIModel.STANDARD;
  } else {
    return AIModel.BASIC;
  }
}

// Export default configuration
export const defaultModel = AIModel.STANDARD;
