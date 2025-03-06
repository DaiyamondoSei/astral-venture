
import { useState, useCallback } from 'react';
import { UserPreferences } from '@/services/personalization';
import { personalizationService } from '@/services/personalization';
import { toast } from '@/components/ui/use-toast';

export function usePreferences(userId: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return null;
    }
    
    try {
      const userPreferences = await personalizationService.preferences.getUserPreferences(userId);
      setPreferences(userPreferences);
      return userPreferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Preferences error",
        description: "Couldn't load your preferences. Using defaults instead.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    if (!userId || !preferences) return;
    
    setIsUpdating(true);
    try {
      const updatedPrefs = await personalizationService.preferences.updateUserPreferences(userId, newPrefs);
      setPreferences(updatedPrefs);
      
      // Track preference change
      await personalizationService.activity.trackPreferenceChange(
        userId, 
        'general', 
        newPrefs
      );
      
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [userId, preferences]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (newSettings: Partial<UserPreferences['privacySettings']>) => {
    if (!userId || !preferences) return;
    
    setIsUpdating(true);
    try {
      const updatedPrefs = await personalizationService.preferences.updatePrivacySettings(userId, newSettings);
      setPreferences(updatedPrefs);
      
      // Track preference change
      await personalizationService.activity.trackPreferenceChange(
        userId, 
        'privacy', 
        newSettings
      );
      
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [userId, preferences]);

  return {
    preferences,
    loadPreferences,
    updatePreferences,
    updatePrivacySettings,
    isLoading,
    isUpdating
  };
}
