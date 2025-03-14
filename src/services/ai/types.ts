
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

/**
 * AI Assistant suggestion for code improvements
 */
export interface AssistantSuggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** Type of suggestion (performance, quality, security, etc.) */
  type: 'performance' | 'quality' | 'security' | 'pattern';
  /** Component the suggestion applies to */
  component: string;
  /** Short title for the suggestion */
  title: string;
  /** Detailed description of the issue and recommendation */
  description: string;
  /** Priority level of the suggestion */
  priority: 'low' | 'medium' | 'high';
  /** Whether an automatic fix is available */
  autoFixAvailable: boolean;
}

/**
 * Status of an AI assistant intent
 */
export type AssistantIntentStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * An intent registered with the AI assistant
 */
export interface AssistantIntent {
  /** Unique identifier for the intent */
  id: string;
  /** Type of intent (refactor, optimize, etc.) */
  type: 'refactor' | 'optimize' | 'document' | 'fix';
  /** Target component or file */
  target: string;
  /** Description of the intent */
  description: string;
  /** Status of the intent */
  status: AssistantIntentStatus;
  /** When the intent was created */
  created: Date;
  /** When the intent was last updated */
  updated?: Date;
}

/**
 * AI question for assistant
 */
export interface AIQuestion {
  /** The question text */
  text: string;
  /** The main question */
  question: string;
  /** Optional context for the question */
  context?: string;
  /** Related reflection IDs */
  reflectionIds?: string[];
  /** User ID asking the question */
  userId: string;
}

/**
 * Options for AI question processing
 */
export interface AIQuestionOptions {
  /** Whether to use streaming response */
  streaming?: boolean;
  /** Whether to use caching */
  useCache?: boolean;
  /** Detailed analysis requested */
  detailedAnalysis?: boolean;
  /** Related categories */
  categories?: string[];
  /** Custom model to use */
  model?: string;
}

/**
 * AI insight from analysis
 */
export interface AIInsight {
  /** Insight type */
  type: string;
  /** Insight content */
  content: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Related themes */
  themes: string[];
  /** Source of the insight */
  source: 'reflection' | 'practice' | 'meditation' | 'system';
}
