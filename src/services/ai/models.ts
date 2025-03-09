
/**
 * AI Model Definitions
 * Contains information about available AI models and their capabilities
 */

import { AIModel } from './types';

// Define available AI models
export const AI_MODELS: Record<string, AIModel> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    contextSize: 8192,
    costPer1KTokens: 0.06
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    contextSize: 4096,
    costPer1KTokens: 0.002
  },
  'claude-2': {
    id: 'claude-2',
    name: 'Claude 2',
    contextSize: 100000,
    costPer1KTokens: 0.08
  }
};

// Default model to use if not specified
export const DEFAULT_MODEL: AIModel = AI_MODELS['gpt-3.5-turbo'];

// Available capabilities and their required models
export const CAPABILITIES = {
  basicQA: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'],
  deepReflection: ['gpt-4', 'claude-2'],
  emotionalAnalysis: ['gpt-4', 'claude-2'],
  philosophicalDiscussion: ['gpt-4', 'claude-2'],
  creativeInsights: ['gpt-4', 'claude-2']
};

// Model selection helper
export function selectModelForCapability(capability: string): AIModel {
  const supportedModels = CAPABILITIES[capability as keyof typeof CAPABILITIES] || CAPABILITIES.basicQA;
  const modelId = supportedModels[0] || 'gpt-3.5-turbo';
  return AI_MODELS[modelId] || DEFAULT_MODEL;
}

// Get token usage estimate for a text
export function estimateTokens(text: string): number {
  // Very rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}
