
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences, PrivacySettings } from './types';
import { toast } from '@/components/ui/use-toast';

/**
 * Service for managing user preferences
 */
export const preferencesService = {
  /**
   * Get user preferences
   * @param userId User ID
   * @returns User preferences or default preferences if not set
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      console.log(`Getting preferences for user ${userId}`);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.log('No preferences found, using defaults');
        
        // Create default preferences for this user
        const defaultPrefs = getDefaultPreferences();
        await this.updateUserPreferences(userId, defaultPrefs);
        
        return defaultPrefs;
      }
      
      return data.preferences as UserPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast({
        title: "Couldn't load preferences",
        description: "Using default preferences instead.",
        variant: "destructive"
      });
      return getDefaultPreferences();
    }
  },
  
  /**
   * Update user preferences
   * @param userId User ID
   * @param preferences New preferences
   * @returns Updated preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      console.log(`Updating preferences for user ${userId}`, preferences);
      
      // First get current preferences
      let currentPrefs: UserPreferences;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', userId)
          .single();
          
        if (error) {
          currentPrefs = getDefaultPreferences();
        } else {
          currentPrefs = data.preferences as UserPreferences;
        }
      } catch (e) {
        currentPrefs = getDefaultPreferences();
      }
      
      // Merge with new preferences
      const updatedPrefs = {
        ...currentPrefs,
        ...preferences,
        // Ensure privacy settings are properly merged
        privacySettings: {
          ...currentPrefs.privacySettings,
          ...(preferences.privacySettings || {})
        }
      };
      
      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Preferences updated",
        description: "Your personalized experience has been updated.",
      });
      
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      toast({
        title: "Couldn't update preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  /**
   * Update privacy settings only
   * @param userId User ID
   * @param settings New privacy settings
   * @returns Updated preferences
   */
  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<UserPreferences> {
    console.log(`Updating privacy settings for user ${userId}`, settings);
    const currentPrefs = await this.getUserPreferences(userId);
    
    return this.updateUserPreferences(userId, {
      privacySettings: {
        ...currentPrefs.privacySettings,
        ...settings
      }
    });
  },
  
  /**
   * Delete user preferences (for account deletion/GDPR compliance)
   * @param userId User ID
   */
  async deleteUserPreferences(userId: string): Promise<void> {
    try {
      console.log(`Deleting preferences for user ${userId}`);
      
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      console.log('User preferences deleted for GDPR compliance');
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }
};

/**
 * Get default user preferences
 * @returns Default user preferences
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    contentCategories: ['meditation', 'chakras', 'reflection'],
    practiceTypes: ['guided-meditation', 'breathing'],
    chakraFocus: [3], // Heart chakra by default
    interfaceTheme: 'cosmic',
    notificationFrequency: 'daily',
    practiceReminders: true,
    contentLevel: 'beginner',
    privacySettings: {
      shareUsageData: true,
      allowRecommendations: true,
      storeActivityHistory: true,
      dataRetentionPeriod: 90 // 3 months
    }
  };
}
