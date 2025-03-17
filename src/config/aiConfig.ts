
/**
 * AI System Configuration
 * 
 * Central configuration for AI features across the application.
 */

export const AI_CONFIG = {
  // OpenAI models
  models: {
    DEFAULT: 'gpt-4o-mini',
    ENHANCED: 'gpt-4o'
  },
  
  // Default analysis options
  analysisDefaults: {
    // Chakra analysis
    chakra: {
      temperature: 0.3,
      maxTokens: 1000,
      cacheTtlMs: 30 * 60 * 1000, // 30 minutes cache
    },
    
    // Performance analysis
    performance: {
      temperature: 0.2,
      maxTokens: 1200,
      cacheTtlMs: 60 * 60 * 1000, // 1 hour cache
    }
  },
  
  // API URLs - when not using edge functions
  apiEndpoints: {
    chakraAnalysis: '/api/ai/analyze-chakra',
    performanceAnalysis: '/api/ai/analyze-performance',
  },
  
  // Feature flags for AI capabilities
  features: {
    enableEdgeFunctions: true,
    enableLocalFallbacks: true,
    enableCaching: true,
    showMetadata: false, // Set to true for debugging
  },
  
  // Usage limits to prevent excessive API calls
  usageLimits: {
    maxRequestsPerHour: 20,
    maxTokensPerDay: 10000,
  },
  
  // Edge function names
  edgeFunctions: {
    aiProcessor: 'ai-processor-enhanced',
    analyzeChakra: 'analyze-chakra',
    analyzePerformance: 'analyze-performance',
  },
  
  // UI messaging
  messages: {
    offlineNotice: "You're currently offline. AI analysis will use local fallbacks until you're back online.",
    apiKeyMissing: "OpenAI API key is required for enhanced AI analysis.",
    analysisError: "An error occurred during analysis. Please try again later.",
  }
};

export default AI_CONFIG;
