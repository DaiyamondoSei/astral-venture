
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
  
  // Analysis options by type
  analysisDefaults: {
    chakra: {
      temperature: 0.3,
      maxTokens: 1000,
      cacheTtlMs: 30 * 60 * 1000, // 30 minutes cache
    },
    performance: {
      temperature: 0.2,
      maxTokens: 1200,
      cacheTtlMs: 60 * 60 * 1000, // 1 hour cache
    },
    visual: {
      temperature: 0.4,
      maxTokens: 1500,
      cacheTtlMs: 12 * 60 * 60 * 1000, // 12 hour cache
      preferCaching: true,
    },
    content: {
      temperature: 0.5,
      maxTokens: 2000,
      cacheTtlMs: 3 * 60 * 60 * 1000, // 3 hour cache
      streamingEnabled: false,
    }
  },
  
  // API endpoints
  apiEndpoints: {
    chakraAnalysis: '/api/ai/analyze-chakra',
    performanceAnalysis: '/api/ai/analyze-performance',
    visualProcessing: '/api/ai/process-visual',
    contentAnalysis: '/api/ai/analyze-content',
    geometryGeneration: '/api/ai/generate-geometry',
  },
  
  // Feature flags
  features: {
    enableEdgeFunctions: true,
    enableLocalFallbacks: true,
    enableCaching: true,
    showMetadata: false,
    enableStreaming: false,
    enableVisualProcessing: true,
    enableContentAnalysis: true,
    preferLocalGeometry: true,
  },
  
  // Usage limits
  usageLimits: {
    maxRequestsPerHour: 20,
    maxTokensPerDay: 10000,
    maxVisualRequestsPerHour: 5,
    maxContentAnalysisPerDay: 10,
  },
  
  // Edge function names
  edgeFunctions: {
    aiProcessor: 'ai-processor-enhanced',
    analyzeChakra: 'analyze-chakra',
    analyzePerformance: 'analyze-performance',
    processVisual: 'process-visual',
    analyzeContent: 'analyze-content',
    generateGeometry: 'generate-geometry',
  },
  
  // UI messaging
  messages: {
    offlineNotice: "You're currently offline. AI analysis will use local fallbacks until you're back online.",
    apiKeyMissing: "OpenAI API key is required for enhanced AI analysis.",
    analysisError: "An error occurred during analysis. Please try again later.",
    streamingNotice: "Streaming responses may increase API usage. Use selectively for best experience.",
  }
};

export default AI_CONFIG;
