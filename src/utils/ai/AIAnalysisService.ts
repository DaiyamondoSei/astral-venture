
/**
 * AI Analysis Service
 * 
 * This service provides capabilities to offload complex analysis tasks to OpenAI's API,
 * such as chakra analysis, performance metrics interpretation, and code quality assessment.
 */

import { ValidationError } from '../validation/ValidationError';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

interface AIAnalysisOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  showMetadata?: boolean;
}

interface AIAnalysisResult<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  metadata?: {
    processingTime: number;
    modelUsed: string;
    tokenUsage: number;
  };
}

type ChakraAnalysisResult = {
  dominantChakras: string[];
  activationLevels: Record<string, number>;
  blockages: string[];
  recommendations: string[];
  overallBalance: number;
  interpretation: string;
};

type PerformanceAnalysisResult = {
  issues: Array<{
    component: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  bottlenecks: string[];
  optimizationScore: number;
  recommendations: string[];
};

export class AIAnalysisService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';
  private defaultModel = 'gpt-4o-mini';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Analyze chakra activation patterns and provide insights
   */
  async analyzeChakraSystem(
    chakraData: {
      activatedChakras: number[];
      emotionalData?: Record<string, number>;
      reflectionContent?: string;
      userHistory?: any;
    },
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<ChakraAnalysisResult>> {
    const startTime = Date.now();
    
    if (!this.apiKey) {
      throw new ValidationError({
        code: ValidationErrorCodes.VALIDATION_FAILED,
        message: 'API key is required for AI analysis',
        details: [{
          path: 'apiKey',
          message: 'API key is required for AI analysis',
          code: ValidationErrorCodes.REQUIRED,
          severity: ErrorSeverities.ERROR
        }]
      });
    }
    
    try {
      const prompt = `
        Analyze the following chakra system data and provide insights:
        
        Activated Chakras: ${chakraData.activatedChakras.join(', ')}
        ${chakraData.emotionalData ? `Emotional Data: ${JSON.stringify(chakraData.emotionalData)}` : ''}
        ${chakraData.reflectionContent ? `User Reflection: ${chakraData.reflectionContent}` : ''}
        
        Please provide:
        1. Dominant chakras
        2. Activation levels for each chakra (1-10)
        3. Potential blockages
        4. Recommendations for balancing
        5. Overall balance score (1-100)
        6. Brief interpretation

        Response should be in JSON format.
      `;
      
      const model = options?.model || this.defaultModel;
      const temperature = options?.temperature || 0.3; // Lower temp for more factual analysis
      const maxTokens = options?.maxTokens || 1000;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert chakra system analyzer that provides insights into chakra activations, blockages, and balance. You respond with accurate, detailed JSON data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling OpenAI API');
      }
      
      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Extract the JSON content from the response
      const content = data.choices[0].message.content;
      const analysisResult = JSON.parse(content);
      
      return {
        result: analysisResult,
        confidence: 0.85, // Default confidence level
        reasoning: analysisResult.reasoning || 'Analysis based on provided chakra patterns and emotional data',
        metadata: options?.showMetadata ? {
          processingTime,
          modelUsed: model,
          tokenUsage: data.usage?.total_tokens || 0
        } : undefined
      };
    } catch (error) {
      console.error('Error in AI Chakra Analysis:', error);
      throw error;
    }
  }

  /**
   * Analyze performance metrics and identify optimization opportunities
   */
  async analyzePerformanceMetrics(
    metrics: {
      componentRenderTimes: Record<string, number>;
      memoryUsage?: number;
      fps?: number;
      networkRequests?: { url: string; time: number; size: number }[];
      errorRates?: Record<string, number>;
    },
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<PerformanceAnalysisResult>> {
    const startTime = Date.now();
    
    if (!this.apiKey) {
      throw new ValidationError({
        code: ValidationErrorCodes.VALIDATION_FAILED,
        message: 'API key is required for AI analysis',
        details: [{
          path: 'apiKey',
          message: 'API key is required for AI analysis',
          code: ValidationErrorCodes.REQUIRED,
          severity: ErrorSeverities.ERROR
        }]
      });
    }
    
    try {
      const prompt = `
        Analyze the following performance metrics and provide optimization insights:
        
        Component Render Times: ${JSON.stringify(metrics.componentRenderTimes)}
        ${metrics.memoryUsage ? `Memory Usage: ${metrics.memoryUsage} MB` : ''}
        ${metrics.fps ? `Frames Per Second: ${metrics.fps}` : ''}
        ${metrics.networkRequests ? `Network Requests: ${JSON.stringify(metrics.networkRequests)}` : ''}
        ${metrics.errorRates ? `Error Rates: ${JSON.stringify(metrics.errorRates)}` : ''}
        
        Please provide:
        1. Performance issues identified, with component name, severity, description and recommendation
        2. Major bottlenecks
        3. Optimization score (1-100)
        4. Specific recommendations for improvement

        Response should be in JSON format.
      `;
      
      const model = options?.model || this.defaultModel;
      const temperature = options?.temperature || 0.2; // Lower temp for factual analysis
      const maxTokens = options?.maxTokens || 1200;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert performance optimization analyst that provides insights into web application performance. You respond with accurate, detailed JSON data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling OpenAI API');
      }
      
      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Extract the JSON content from the response
      const content = data.choices[0].message.content;
      const analysisResult = JSON.parse(content);
      
      return {
        result: analysisResult,
        confidence: 0.9, // High confidence for performance analysis
        reasoning: analysisResult.reasoning || 'Analysis based on component render times and performance metrics',
        metadata: options?.showMetadata ? {
          processingTime,
          modelUsed: model,
          tokenUsage: data.usage?.total_tokens || 0
        } : undefined
      };
    } catch (error) {
      console.error('Error in AI Performance Analysis:', error);
      throw error;
    }
  }
}

// Export a singleton instance for app-wide use
export const aiAnalysisService = new AIAnalysisService();

export default aiAnalysisService;
