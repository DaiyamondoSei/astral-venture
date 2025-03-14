
/**
 * AI Service Types
 */

/**
 * AI response type options
 */
export type AIResponseType = 'text' | 'markdown' | 'html' | 'json';

/**
 * Configuration options for AI service requests
 */
export interface AIServiceOptions {
  /** Whether to use caching for this request */
  useCache: boolean;
  /** Whether to show a loading toast during processing */
  showLoadingToast: boolean;
  /** Whether to show error toasts */
  showErrorToast: boolean;
  /** OpenAI model to use */
  model: string;
  /** Temperature setting for response randomness */
  temperature: number;
  /** Maximum tokens to generate */
  maxTokens: number;
}

/**
 * Metadata about the AI response
 */
export interface AIResponseMeta {
  /** Model used to generate the response */
  model: string;
  /** Number of tokens used */
  tokenUsage: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Whether the response came from cache */
  cached?: boolean;
}

/**
 * Structured AI response
 */
export interface AIResponse {
  /** The main response text */
  answer: string;
  /** The format of the response */
  type: AIResponseType;
  /** Optional list of suggested practices */
  suggestedPractices?: string[];
  /** Metadata about the response */
  meta: AIResponseMeta;
}

/**
 * Emotional analysis result for reflection entries
 */
export interface EmotionalAnalysisResult {
  /** Detected emotions */
  emotions: Array<{
    name: string;
    intensity: number;
  }>;
  /** Detected chakra activations */
  chakras: Array<{
    name: string;
    activation: number;
  }>;
  /** AI-generated insights */
  insights: string[];
  /** Recommended practices based on analysis */
  recommendedPractices: string[];
  /** Raw analysis text */
  rawAnalysis: string;
}

/**
 * AI-generated chakra prediction
 */
export interface ChakraPrediction {
  /** Chakra name */
  name: string;
  /** Activation level (0-100) */
  activation: number;
  /** Growth potential (0-100) */
  growthPotential: number;
  /** Personalized guidance */
  guidance: string;
}

/**
 * Achievement recommendation from AI
 */
export interface AchievementRecommendation {
  /** Title of the recommended achievement */
  title: string;
  /** Description of the achievement */
  description: string;
  /** Estimated difficulty (1-5) */
  difficulty: number;
  /** Expected growth areas */
  growthAreas: string[];
}
