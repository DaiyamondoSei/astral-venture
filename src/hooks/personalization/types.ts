
import { 
  UserPreferences,
  ContentRecommendation,
  PersonalizationMetrics
} from '@/services/personalization';

export interface UsePersonalizationResult {
  // User preferences
  preferences: UserPreferences | null;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  updatePrivacySettings: (newSettings: Partial<UserPreferences['privacySettings']>) => Promise<void>;
  
  // Content recommendations
  recommendations: ContentRecommendation[];
  refreshRecommendations: () => Promise<void>;
  
  // Activity tracking
  trackContentView: (contentId: string, duration?: number, completionRate?: number) => Promise<void>;
  trackPracticeCompletion: (
    practiceId: string, 
    practiceType: string, 
    duration: number,
    chakrasActivated?: number[],
    emotionalResponse?: string[]
  ) => Promise<void>;
  trackReflection: (
    reflectionId: string,
    chakrasActivated?: number[],
    emotionalResponse?: string[],
    depth?: number
  ) => Promise<void>;
  
  // Metrics
  metrics: PersonalizationMetrics | null;
  refreshMetrics: () => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
}
