
// AI Service Types

export interface AIQuestion {
  text?: string;
  question?: string; // Added for backward compatibility
  context?: string;
  userId?: string;
  stream?: boolean;
  reflectionIds?: string[]; // Added to support reflection context
}

export interface AIResponse {
  answer: string;
  text?: string; // Added for backward compatibility
  type: 'text' | 'meditation' | 'reflection' | 'wisdom' | 'error';
  suggestedPractices?: string[];
  sources?: string[];
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

// Define the interface for the options parameter in the askQuestion method
export interface AIQuestionOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
}

// Define assistant suggestion and intent types for AICodeAssistant
export interface AssistantSuggestion {
  id: string;
  type: 'optimization' | 'improvement' | 'warning' | 'error';
  component?: string;
  title: string;
  description: string;
  context?: string;
  codeExample?: string;
  autoFixAvailable?: boolean;
  priority: 'low' | 'medium' | 'high';
}

export type AssistantIntentStatus = 'pending' | 'completed' | 'failed';

export interface AssistantIntent {
  id: string;
  type: string;
  description: string;
  status: AssistantIntentStatus;
  created: Date;
  updated?: Date;
  componentPath?: string;
}

// Add CodeQualityIssue type for CodeQualityDashboard
export interface CodeQualityIssue {
  id: string;
  component: string;
  type: 'security' | 'pattern' | 'complexity' | 'performance';
  description: string;
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  location?: string;
}

export interface CodeQualityStats {
  componentsAnalyzed: number;
  issuesByType: Record<string, number>;
  highPriorityIssues: number;
  lastUpdated: Date;
}
