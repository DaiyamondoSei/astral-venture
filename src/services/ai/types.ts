
/**
 * AI Service Type Definitions
 */

// AI Question Options
export interface AIQuestionOptions {
  /** Whether to use cached responses */
  useCache?: boolean;
  
  /** Whether to show loading toast notifications */
  showLoadingToast?: boolean;
  
  /** Whether to show error toast notifications */
  showErrorToast?: boolean;
  
  /** The model to use for the request */
  model?: string;
  
  /** Whether to stream the response */
  streaming?: boolean;
  
  /** User ID for the request */
  userId?: string;
  
  /** Context for the request (e.g., "reflection", "practice") */
  context?: string;
  
  /** IDs of relevant reflections */
  reflectionIds?: string[];
  
  /** Custom cache key for the request */
  cacheKey?: string;
  
  /** Whether to perform detailed analysis */
  detailedAnalysis?: boolean;
}

// AI Question structure
export interface AIQuestion {
  /** The full text of the question */
  text: string;
  
  /** The question itself (may be the same as text) */
  question: string;
  
  /** User ID for the request */
  userId: string;
  
  /** Optional context for the question */
  context?: string;
  
  /** Optional reflection IDs related to the question */
  reflectionIds?: string[];
}

// AI Response metadata
export interface AIResponseMeta {
  /** The model used for the response */
  model: string;
  
  /** Total token usage for the request and response */
  tokenUsage: number;
  
  /** Time taken to process the request in milliseconds */
  processingTime: number;
  
  /** Whether the response was cached */
  cached?: boolean;
}

// AI Response types
export type AIResponseType = 'text' | 'markdown' | 'code' | 'error';

// AI Response structure
export interface AIResponse {
  /** The answer text */
  answer: string;
  
  /** The type of the response */
  type: AIResponseType;
  
  /** Suggested practices based on the response */
  suggestedPractices?: string[];
  
  /** Response metadata */
  meta: AIResponseMeta;
}

// AI Service response with additional information
export interface AIServiceResponse {
  /** The result text */
  result: string;
  
  /** Metrics about the request */
  metrics: {
    tokenUsage: number;
    processingTime: number;
  };
  
  /** Whether the response was cached */
  cached?: boolean;
}

// AI Model information
export interface AIModelInfo {
  /** The model name */
  model: string;
  
  /** Token count used */
  tokenCount: number;
  
  /** Processing time in milliseconds */
  processingTime: number;
}
