import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  personalizationService, 
  UserPreferences, 
  ContentRecommendation,
  PersonalizationMetrics
} from '@/services/personalization';
import { toast } from '@/components/ui/use-toast';

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

export function usePersonalization(): UsePersonalizationResult {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [metrics, setMetrics] = useState<PersonalizationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadPersonalizationData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Load preferences
        const userPreferences = await personalizationService.preferences.getUserPreferences(user.id);
        setPreferences(userPreferences);
        
        // Only load recommendations if user allows it
        if (userPreferences.privacySettings.allowRecommendations) {
          const userRecommendations = await personalizationService.recommendations.getRecommendations(user.id);
          setRecommendations(userRecommendations);
        }
        
        // Load metrics
        const userMetrics = await personalizationService.metrics.getMetrics(user.id);
        if (userMetrics) {
          setMetrics(userMetrics);
        }
      } catch (error) {
        console.error('Error loading personalization data:', error);
        toast({
          title: "Personalization error",
          description: "Couldn't load your personalized experience. Using defaults instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPersonalizationData();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    if (!user || !preferences) return;
    
    setIsUpdating(true);
    try {
      const updatedPrefs = await personalizationService.preferences.updateUserPreferences(user.id, newPrefs);
      setPreferences(updatedPrefs);
      
      // Track preference change
      await personalizationService.activity.trackPreferenceChange(
        user.id, 
        'general', 
        newPrefs
      );
      
      // Refresh recommendations after preference change
      if (updatedPrefs.privacySettings.allowRecommendations) {
        const userRecommendations = await personalizationService.recommendations.getRecommendations(user.id);
        setRecommendations(userRecommendations);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, preferences]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (newSettings: Partial<UserPreferences['privacySettings']>) => {
    if (!user || !preferences) return;
    
    setIsUpdating(true);
    try {
      const updatedPrefs = await personalizationService.preferences.updatePrivacySettings(user.id, newSettings);
      setPreferences(updatedPrefs);
      
      // Track preference change
      await personalizationService.activity.trackPreferenceChange(
        user.id, 
        'privacy', 
        newSettings
      );
      
      // If user has opted out of recommendations, clear them
      if (!updatedPrefs.privacySettings.allowRecommendations) {
        setRecommendations([]);
      } else {
        // Otherwise refresh them
        const userRecommendations = await personalizationService.recommendations.getRecommendations(user.id);
        setRecommendations(userRecommendations);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, preferences]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!user || !preferences || !preferences.privacySettings.allowRecommendations) return;
    
    setIsUpdating(true);
    try {
      const userRecommendations = await personalizationService.recommendations.getRecommendations(user.id);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, preferences]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const userMetrics = await personalizationService.metrics.calculateMetrics(user.id);
      setMetrics(userMetrics);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  // Activity tracking functions
  const trackContentView = useCallback(async (
    contentId: string, 
    duration?: number, 
    completionRate?: number
  ) => {
    if (!user) return;
    
    try {
      await personalizationService.activity.trackContentView(
        user.id,
        contentId,
        duration,
        completionRate
      );
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }, [user]);

  const trackPracticeCompletion = useCallback(async (
    practiceId: string, 
    practiceType: string, 
    duration: number,
    chakrasActivated?: number[],
    emotionalResponse?: string[]
  ) => {
    if (!user) return;
    
    try {
      await personalizationService.activity.trackPracticeCompletion(
        user.id,
        practiceId,
        practiceType,
        duration,
        chakrasActivated,
        emotionalResponse
      );
    } catch (error) {
      console.error('Error tracking practice completion:', error);
    }
  }, [user]);

  const trackReflection = useCallback(async (
    reflectionId: string,
    chakrasActivated?: number[],
    emotionalResponse?: string[],
    depth?: number
  ) => {
    if (!user) return;
    
    try {
      await personalizationService.activity.trackReflection(
        user.id,
        reflectionId,
        chakrasActivated,
        emotionalResponse,
        depth
      );
    } catch (error) {
      console.error('Error tracking reflection:', error);
    }
  }, [user]);

  return {
    preferences,
    updatePreferences,
    updatePrivacySettings,
    recommendations,
    refreshRecommendations,
    trackContentView,
    trackPracticeCompletion,
    trackReflection,
    metrics,
    refreshMetrics,
    isLoading,
    isUpdating
  };
}
