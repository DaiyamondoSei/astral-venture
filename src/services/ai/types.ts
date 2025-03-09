
// AI Service Types

export interface AIResponse {
  answer: string;
  type: 'text' | 'meditation' | 'reflection' | 'wisdom';
  suggestedPractices?: string[];
  meta?: {
    model?: string;
    tokenUsage?: number;
    processingTime?: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'meditation' | 'reflection' | 'practice' | 'wisdom' | 'energy';
  title: string;
  content: string;
  createdAt: string;
  relevanceScore?: number;
  tags?: string[];
}

export interface AIQueryParams {
  text?: string;
  userId?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  includeHistory?: boolean;
}

export enum AIModel {
  DEFAULT = 'gpt-3.5-turbo',
  ADVANCED = 'gpt-4',
  ADVANCED_16K = 'gpt-4-32k',
  EMBEDDING = 'text-embedding-ada-002'
}

export interface AIServiceConfig {
  defaultModel: AIModel;
  fallbackToLocalModels: boolean;
  streamingEnabled: boolean;
  personalizedResponses: boolean;
  maxHistoryItems: number;
}
