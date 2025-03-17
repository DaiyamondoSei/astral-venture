
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
    },
    
    // Visual processing (Phase 2)
    visual: {
      temperature: 0.4,
      maxTokens: 1500,
      cacheTtlMs: 12 * 60 * 60 * 1000, // 12 hour cache for visual elements
      preferCaching: true, // Prefer cached results for visual elements to reduce API costs
    },
    
    // Content analysis (Phase 3)
    content: {
      temperature: 0.5,
      maxTokens: 2000,
      cacheTtlMs: 3 * 60 * 60 * 1000, // 3 hour cache
      streamingEnabled: false, // Default to non-streaming to manage API costs
    }
  },
  
  // API URLs - when not using edge functions
  apiEndpoints: {
    chakraAnalysis: '/api/ai/analyze-chakra',
    performanceAnalysis: '/api/ai/analyze-performance',
    visualProcessing: '/api/ai/process-visual',
    contentAnalysis: '/api/ai/analyze-content',
    geometryGeneration: '/api/ai/generate-geometry',
  },
  
  // Feature flags for AI capabilities
  features: {
    enableEdgeFunctions: true,
    enableLocalFallbacks: true,
    enableCaching: true,
    showMetadata: false, // Set to true for debugging
    enableStreaming: false, // Control streaming responses globally
    enableVisualProcessing: true, // Phase 2 feature flag
    enableContentAnalysis: true, // Phase 3 feature flag
    preferLocalGeometry: true, // Use local geometry generation when possible to save API costs
  },
  
  // Usage limits to prevent excessive API calls
  usageLimits: {
    maxRequestsPerHour: 20,
    maxTokensPerDay: 10000,
    maxVisualRequestsPerHour: 5, // Lower limit for more expensive visual processing
    maxContentAnalysisPerDay: 10, // Limit for content analysis
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
