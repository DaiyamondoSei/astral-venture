
import { HistoricalReflection } from '@/components/reflection/types';

/**
 * Shared types for AI services
 */

export interface AIInsight {
  id?: string;
  content: string;
  category: string;
  confidence?: number;
  relevance?: number;
  created_at?: string;
  reflection_id?: string;
}

export interface AIQuestion {
  question: string;
  context?: string;
  reflectionIds?: string[];
  stream?: boolean;
}

export interface AIResponse {
  answer: string;
  relatedInsights: AIInsight[];
  suggestedPractices?: string[];
  meta?: {
    model?: string;
    tokenUsage?: number;
    processingTime?: number;
    streaming?: boolean;
  };
}

// Supported AI models
export type AIModel = 
  | "gpt-4o"         // High quality, higher cost, slower
  | "gpt-4o-mini";   // Good quality, lower cost, faster

