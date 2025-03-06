import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { UsePersonalizationResult } from './personalization/types';
import { usePreferences } from './personalization/usePreferences';
import { useRecommendations } from './personalization/useRecommendations';
import { useActivityTracking } from './personalization/useActivityTracking';
import { useMetrics } from './personalization/useMetrics';

export function usePersonalization(): UsePersonalizationResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize sub-hooks
  const {
    preferences,
    loadPreferences,
    updatePreferences,
    updatePrivacySettings,
    isLoading: preferencesLoading,
    isUpdating: preferencesUpdating
  } = usePreferences(user?.id);
  
  const {
    recommendations,
    loadRecommendations,
    refreshRecommendations,
    isUpdating: recommendationsUpdating
  } = useRecommendations(user?.id);
  
  const {
    trackContentView,
    trackPracticeCompletion,
    trackReflection
  } = useActivityTracking(user?.id);
  
  const {
    metrics,
    loadMetrics,
    refreshMetrics,
    isUpdating: metricsUpdating
  } = useMetrics(user?.id);

  // Combined loading and updating states
  const isUpdating = preferencesUpdating || recommendationsUpdating || metricsUpdating;

  // Load initial data
  useEffect(() => {
    const loadPersonalizationData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Load preferences first
        const userPreferences = await loadPreferences();
        
        // Then load recommendations if allowed
        if (userPreferences?.privacySettings.allowRecommendations) {
          await loadRecommendations(true);
        }
        
        // Load metrics
        await loadMetrics();
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
  }, [user, loadPreferences, loadRecommendations, loadMetrics]);

  // Create a wrapper for updatePreferences that also refreshes recommendations
  const updatePreferencesWithRefresh = async (newPrefs: any) => {
    try {
      const updatedPrefs = await updatePreferences(newPrefs);
      
      // Refresh recommendations after preference change if they're allowed
      if (updatedPrefs?.privacySettings.allowRecommendations) {
        await loadRecommendations(true);
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Create a wrapper for updatePrivacySettings that handles recommendation updates
  const updatePrivacySettingsWithRefresh = async (newSettings: any) => {
    try {
      const updatedPrefs = await updatePrivacySettings(newSettings);
      
      // If user has opted out of recommendations, clear them
      if (!updatedPrefs?.privacySettings.allowRecommendations) {
        loadRecommendations(false);
      } else {
        // Otherwise refresh them
        await loadRecommendations(true);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    preferences,
    updatePreferences: updatePreferencesWithRefresh,
    updatePrivacySettings: updatePrivacySettingsWithRefresh,
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
