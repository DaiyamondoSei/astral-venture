
import { UserPreferences, ContentRecommendation, UserActivity } from '../types';

export interface ScoredContent extends ContentRecommendation {
  // Additional properties for internal scoring
  rawScore?: number;
}

export interface ActivityAnalysisResult {
  recentlyViewedContentIds: string[];
  userEmotions: string[];
  chakraActivationCount: Record<number, number>;
  completionRates: Record<string, number>;
}
