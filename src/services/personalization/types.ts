
/**
 * Types for personalization service
 */

// User preferences
export interface UserPreferences {
  contentCategories: string[];
  practiceTypes: string[];
  chakraFocus: number[];
  interfaceTheme: 'light' | 'dark' | 'cosmic';
  notificationFrequency: 'daily' | 'weekly' | 'minimal';
  practiceReminders: boolean;
  contentLevel: 'beginner' | 'intermediate' | 'advanced';
  privacySettings: PrivacySettings;
}

// Privacy settings
export interface PrivacySettings {
  shareUsageData: boolean;
  allowRecommendations: boolean;
  storeActivityHistory: boolean;
  dataRetentionPeriod: number; // Days
}

// Content recommendation
export interface ContentRecommendation {
  id: string;
  title: string;
  type: 'practice' | 'meditation' | 'lesson' | 'reflection';
  category: string;
  relevanceScore: number;
  chakraAlignment?: number[];
  emotionalResonance?: string[];
  recommendationReason: string;
}

// User activity for personalization
export interface UserActivity {
  id: string;
  userId: string;
  activityType: string;
  timestamp: string;
  duration?: number;
  chakrasActivated?: number[];
  completionRate?: number;
  emotionalResponse?: string[];
  metadata?: Record<string, any>;
}

// Personalization impact metrics
export interface PersonalizationMetrics {
  engagementScore: number;
  contentRelevanceRating: number;
  chakraBalanceImprovement: number;
  emotionalGrowthRate: number;
  progressAcceleration: number;
  lastUpdated: string;
}

// Personalization service response
export interface PersonalizationResponse {
  recommendations: ContentRecommendation[];
  metrics?: PersonalizationMetrics;
  preferencesUpdated?: boolean;
}
