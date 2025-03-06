
import { UserPreferences, PrivacySettings } from './types';
import { toast } from '@/components/ui/use-toast';

// Cache for user preferences (in-memory substitute for database)
const userPreferencesCache = new Map<string, UserPreferences>();

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
      
      // Check if we have cached preferences for this user
      if (userPreferencesCache.has(userId)) {
        return userPreferencesCache.get(userId) || getDefaultPreferences();
      }
      
      // In a real implementation, we would fetch from the database
      // For now, return default preferences and store in cache
      const defaultPrefs = getDefaultPreferences();
      userPreferencesCache.set(userId, defaultPrefs);
      return defaultPrefs;
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
      const currentPrefs = await this.getUserPreferences(userId);
      
      // Merge with new preferences
      const updatedPrefs = {
        ...currentPrefs,
        ...preferences
      };
      
      // In a real implementation, we would save to the database
      // For now, just update the cache
      userPreferencesCache.set(userId, updatedPrefs);
      
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
      
      // In a real implementation, we would delete from the database
      // For now, just remove from cache
      userPreferencesCache.delete(userId);
      
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
