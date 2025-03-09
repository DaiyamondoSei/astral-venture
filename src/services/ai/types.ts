
/**
 * AIQuestion interface for structured AI requests
 */
export interface AIQuestion {
  text: string;
  question?: string;
  context?: string;
  reflectionIds?: string[];
  userId?: string;
  stream?: boolean;
}

/**
 * AIQuestionOptions interface for configuring AI requests
 */
export interface AIQuestionOptions {
  cacheResults?: boolean;
  stream?: boolean;
  priority?: 'low' | 'medium' | 'high';
  maxTokens?: number;
  cacheKey?: string;
}

/**
 * AIResponse interface for structured AI responses
 */
export interface AIResponse {
  answer: string;
  insights?: string[];
  suggestedPractices?: string[];
  relatedInsights?: string[];
  reflectionId?: string;
  type?: 'text' | 'error' | 'stream';
  meta?: {
    processingTime?: number;
    tokenUsage?: number;
    model?: string;
  };
  sources?: any[];
  response?: string;  // Added for compatibility
}

/**
 * AIInsight interface for structured insights
 */
export interface AIInsight {
  id: string;
  type: 'chakra' | 'emotion' | 'practice' | 'wisdom';
  text: string;
  content?: string;
  confidence: number;
  relevance: number;
  title: string;
}

/**
 * AssistantSuggestion interface for code-related suggestions
 */
export interface AssistantSuggestion {
  id: string;
  type: 'performance' | 'quality' | 'security' | 'accessibility';
  component: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  autoFixAvailable: boolean;
  created: string;
  status: 'pending' | 'applied' | 'dismissed';
  context?: string;
  codeExample?: string;
}

/**
 * AssistantIntent interface for code assistant intents
 */
export interface AssistantIntent {
  id: string;
  type: 'fix' | 'optimize' | 'refactor';
  description: string;
  componentId: string;
  status: 'pending' | 'completed' | 'failed';
  created: string;
  relatedComponents?: string[];
}

/**
 * Types for AI Code Assistant
 */
export interface UseAICodeAssistantProps {
  component?: string;
  initialComponents?: string[];
  options?: {
    autoAnalyze?: boolean;
    analysisDepth?: 'simple' | 'detailed';
  };
}

/**
 * ChakraInsightsOptions interface for chakra-specific insights
 */
export interface ChakraInsightsOptions {
  includeRecommendations?: boolean;
  detailLevel?: 'basic' | 'detailed';
  timeframe?: 'recent' | 'all';
}

/**
 * CodeQualityStats interface for code quality metrics
 */
export interface CodeQualityStats {
  issueCount: number;
  componentsAnalyzed: number;
  highPriorityIssues: number;
  lastUpdated: Date;
}

/**
 * CodeQualityIssue interface for code quality issues
 */
export interface CodeQualityIssue {
  id: string;
  component: string;
  type: 'security' | 'pattern' | 'complexity' | 'performance' | 'architecture' | 'render';
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
}

/**
 * ComponentMetrics interface for component performance metrics
 */
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  totalRenderTime: number;
  lastRenderTime: number;
  firstRenderTime: number;
}

/**
 * Achievement data interface
 */
export interface IAchievementData {
  id: string;
  title: string;
  description: string;
  type?: 'discovery' | 'completion' | 'interaction' | 'streak' | 'progressive' | 'milestone';
  category?: string;
  icon?: string;
  progress: number;
  maxProgress?: number;
  completed: boolean;
  completedAt?: string;
  tier?: number;
  points?: number;
}

/**
 * Feature tooltip data interface
 */
export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  element: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  priority: number;
  dismissible: boolean;
}
