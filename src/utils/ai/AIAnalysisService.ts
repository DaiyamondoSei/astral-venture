
/**
 * AI Analysis Service
 * 
 * Provides capabilities to offload complex analysis to OpenAI's API,
 * including chakra analysis, performance metrics interpretation, and code quality assessment.
 */

import { ValidationError } from '../validation/ValidationError';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

// Cache implementation for analysis results
class AnalysisCache {
  private cache: Map<string, { 
    result: any, 
    timestamp: number, 
    expiry: number 
  }> = new Map();
  
  set(key: string, value: any, ttlMs: number = 1000 * 60 * 30): void {
    this.cache.set(key, {
      result: value,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result as T;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clear expired entries
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    this.cache.forEach((value, key) => {
      if (now > value.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    });
    
    return cleaned;
  }
}

export interface AIAnalysisOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  showMetadata?: boolean;
  cacheResults?: boolean;
  cacheTtlMs?: number;
  forceRefresh?: boolean;
}

export interface AIAnalysisResult<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  metadata?: {
    processingTime: number;
    modelUsed: string;
    tokenUsage: number;
    cached?: boolean;
    completionTimestamp?: string;
  };
}

export type ChakraAnalysisResult = {
  dominantChakras: string[];
  activationLevels: Record<string, number>;
  blockages: string[];
  recommendations: string[];
  overallBalance: number;
  interpretation: string;
};

export type PerformanceAnalysisResult = {
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
  private cache = new AnalysisCache();
  private online = true;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
    
    // Check online status on initialization and update when it changes
    this.online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online = true);
      window.addEventListener('offline', () => this.online = false);
    }
    
    // Set up cache cleanup interval
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.cache.cleanup();
      }, 1000 * 60 * 10); // Clean cache every 10 minutes
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if the service can perform AI analysis
   */
  canPerformAnalysis(): boolean {
    return this.online && !!this.apiKey;
  }

  /**
   * Create a cache key for analysis results
   */
  private createCacheKey(operation: string, data: any, options?: AIAnalysisOptions): string {
    return JSON.stringify({
      operation,
      data,
      model: options?.model,
      temperature: options?.temperature
    });
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
    options: AIAnalysisOptions = {}
  ): Promise<AIAnalysisResult<ChakraAnalysisResult>> {
    // Check if offline
    if (!this.online) {
      return this.getFallbackChakraAnalysis(chakraData);
    }
    
    // Check if API key is set
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
    
    // Generate cache key and check cache
    const cacheKey = this.createCacheKey('chakraAnalysis', chakraData, options);
    const shouldUseCache = options.cacheResults !== false;
    
    if (shouldUseCache && !options.forceRefresh) {
      const cachedResult = this.cache.get<AIAnalysisResult<ChakraAnalysisResult>>(cacheKey);
      if (cachedResult) {
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cached: true
          }
        };
      }
    }
    
    const startTime = Date.now();
    
    try {
      const prompt = `
        Analyze the following chakra system data and provide insights:
        
        Activated Chakras: ${chakraData.activatedChakras.join(', ')}
        ${chakraData.emotionalData ? `Emotional Data: ${JSON.stringify(chakraData.emotionalData)}` : ''}
        ${chakraData.reflectionContent ? `User Reflection: ${chakraData.reflectionContent}` : ''}
        
        Please provide detailed information in the following categories:
        1. Dominant chakras
        2. Activation levels for each chakra (1-10)
        3. Potential blockages
        4. Recommendations for balancing
        5. Overall balance score (1-100)
        6. Brief interpretation of the user's chakra system

        Response should be in JSON format.
      `;
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? 0.3; // Lower temp for more factual analysis
      const maxTokens = options.maxTokens || 1000;
      
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
      
      const result: AIAnalysisResult<ChakraAnalysisResult> = {
        result: analysisResult,
        confidence: 0.85, // Default confidence level
        reasoning: analysisResult.reasoning || 'Analysis based on provided chakra patterns and emotional data',
        metadata: options.showMetadata ? {
          processingTime,
          modelUsed: model,
          tokenUsage: data.usage?.total_tokens || 0,
          completionTimestamp: new Date().toISOString()
        } : undefined
      };
      
      // Cache the result if caching is enabled
      if (shouldUseCache) {
        this.cache.set(cacheKey, result, options.cacheTtlMs || 30 * 60 * 1000); // Default 30 minutes TTL
      }
      
      return result;
    } catch (error) {
      console.error('Error in AI Chakra Analysis:', error);
      
      // Return fallback on error
      return this.getFallbackChakraAnalysis(chakraData);
    }
  }

  /**
   * Fallback for chakra analysis when offline or on error
   */
  private getFallbackChakraAnalysis(chakraData: any): AIAnalysisResult<ChakraAnalysisResult> {
    // Basic algorithm to generate fallback analysis without API
    const activatedChakras = chakraData.activatedChakras || [];
    
    const chakras = [
      'Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'
    ];
    
    // Generate activation levels based on provided data
    const activationLevels: Record<string, number> = {};
    chakras.forEach((chakra, i) => {
      activationLevels[chakra] = activatedChakras.includes(i + 1) ? 8 : 4;
    });
    
    // Determine dominant chakras
    const dominantChakras = chakras.filter((_, i) => activatedChakras.includes(i + 1));
    
    // Calculate overall balance from activated chakras
    const balance = Math.min(100, 40 + activatedChakras.length * 10);
    
    return {
      result: {
        dominantChakras: dominantChakras.length ? dominantChakras : [chakras[3]],
        activationLevels,
        blockages: ['Offline mode - detailed blockage analysis unavailable'],
        recommendations: [
          'Practice balanced meditation focusing on all chakras',
          'Consider journaling your emotions daily',
          'Engage in physical activity to promote energy flow'
        ],
        overallBalance: balance,
        interpretation: 'This is a local fallback analysis generated when offline or when API analysis is unavailable. For more detailed insights, please try again when online or with a valid API key.'
      },
      confidence: 0.4, // Lower confidence for fallback
      reasoning: 'Analysis performed locally due to offline status or API error',
      metadata: {
        processingTime: 5,
        modelUsed: 'local-fallback',
        tokenUsage: 0,
        cached: false,
        completionTimestamp: new Date().toISOString()
      }
    };
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
    options: AIAnalysisOptions = {}
  ): Promise<AIAnalysisResult<PerformanceAnalysisResult>> {
    // Check if offline
    if (!this.online) {
      return this.getFallbackPerformanceAnalysis(metrics);
    }
    
    // Check if API key is set
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
    
    // Generate cache key and check cache
    const cacheKey = this.createCacheKey('performanceAnalysis', metrics, options);
    const shouldUseCache = options.cacheResults !== false;
    
    if (shouldUseCache && !options.forceRefresh) {
      const cachedResult = this.cache.get<AIAnalysisResult<PerformanceAnalysisResult>>(cacheKey);
      if (cachedResult) {
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cached: true
          }
        };
      }
    }
    
    const startTime = Date.now();
    
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

        Response should be in JSON format with these exact fields.
      `;
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature || 0.2; // Lower temp for factual analysis
      const maxTokens = options.maxTokens || 1200;
      
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
      
      const result: AIAnalysisResult<PerformanceAnalysisResult> = {
        result: analysisResult,
        confidence: 0.9, // High confidence for performance analysis
        reasoning: analysisResult.reasoning || 'Analysis based on component render times and performance metrics',
        metadata: options.showMetadata ? {
          processingTime,
          modelUsed: model,
          tokenUsage: data.usage?.total_tokens || 0,
          completionTimestamp: new Date().toISOString()
        } : undefined
      };
      
      // Cache the result if caching is enabled
      if (shouldUseCache) {
        this.cache.set(cacheKey, result, options.cacheTtlMs || 30 * 60 * 1000); // Default 30 minutes TTL
      }
      
      return result;
    } catch (error) {
      console.error('Error in AI Performance Analysis:', error);
      
      // Return fallback on error
      return this.getFallbackPerformanceAnalysis(metrics);
    }
  }

  /**
   * Fallback for performance analysis when offline or on error
   */
  private getFallbackPerformanceAnalysis(metrics: any): AIAnalysisResult<PerformanceAnalysisResult> {
    // Basic algorithm to generate fallback analysis without API
    const componentRenderTimes = metrics.componentRenderTimes || {};
    
    // Find slow components (arbitrary threshold of 100ms)
    const slowComponents = Object.entries(componentRenderTimes)
      .filter(([_, time]) => (time as number) > 100)
      .map(([name]) => name);
    
    // Generate issues based on slow components
    const issues = slowComponents.map(component => ({
      component,
      severity: 'medium' as const,
      description: `Component ${component} has high render time`,
      recommendation: 'Consider optimizing with memoization or reducing re-renders'
    }));
    
    // Calculate optimization score (higher times = lower score)
    const avgRenderTime = Object.values(componentRenderTimes).reduce((sum, time) => sum + (time as number), 0) / 
      (Object.values(componentRenderTimes).length || 1);
    
    const optimizationScore = Math.max(0, Math.min(100, 100 - avgRenderTime / 2));
    
    return {
      result: {
        issues: issues.length ? issues : [{
          component: 'Fallback',
          severity: 'low',
          description: 'Using local fallback analysis - limited insights available',
          recommendation: 'Try again when online or with valid API key for detailed analysis'
        }],
        bottlenecks: slowComponents.length ? slowComponents : ['Offline mode - detailed bottleneck analysis unavailable'],
        optimizationScore,
        recommendations: [
          'Ensure components use React.memo where appropriate',
          'Minimize state updates during render',
          'Check for expensive calculations in render methods'
        ]
      },
      confidence: 0.4, // Lower confidence for fallback
      reasoning: 'Analysis performed locally due to offline status or API error',
      metadata: {
        processingTime: 5,
        modelUsed: 'local-fallback',
        tokenUsage: 0,
        cached: false,
        completionTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Clear the result cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance for app-wide use
export const aiAnalysisService = new AIAnalysisService();

export default aiAnalysisService;
