
import { supabase } from '@/lib/supabaseClient';
import { Achievement } from '@/types/achievement';
import { queryClient } from '@/App';
import { handleError, ErrorCategory } from './errorHandling';

/**
 * Preloads achievement data and stores it in the query cache
 */
async function preloadAchievementData(): Promise<void> {
  try {
    // Check if there's already cached data
    const existingData = queryClient.getQueryData(['achievements']);
    if (existingData) return;

    // Fetch achievements
    const { data, error } = await supabase.functions.invoke('get_user_achievements');
    
    if (error) {
      throw error;
    }
    
    // Cache achievements data
    if (data) {
      queryClient.setQueryData(['achievements'], data);
      console.info(`Preloaded ${data.length} achievements`);
    }
  } catch (error) {
    handleError(error, {
      context: 'Achievement preloading',
      category: ErrorCategory.DATA_PROCESSING,
      showToast: false
    });
  }
}

/**
 * Preloads user portal state data and stores it in the query cache
 */
async function preloadPortalState(): Promise<void> {
  try {
    // Check if there's already cached data
    const existingData = queryClient.getQueryData(['portal-state']);
    if (existingData) return;

    // For now, we'll handle this as an unsupported operation since
    // the get_user_portal_state function doesn't exist yet
    console.info('Portal state preloading is not currently supported');
    
    // When the function is implemented, we would use:
    /*
    const { data, error } = await supabase.functions.invoke('get_user_portal_state');
    
    if (error) {
      throw error;
    }
    
    // Cache portal state data
    if (data) {
      queryClient.setQueryData(['portal-state'], data);
      console.info('Preloaded portal state data');
    }
    */
  } catch (error) {
    handleError(error, {
      context: 'Portal state preloading',
      category: ErrorCategory.DATA_PROCESSING,
      showToast: false
    });
  }
}

/**
 * Preloads essential panel data to improve user experience
 */
export async function preloadPanelData(): Promise<void> {
  // Start all preloading tasks concurrently
  await Promise.all([
    preloadAchievementData(),
    // We'll comment this out until the function is implemented
    // preloadPortalState()
  ]);
}

export default {
  preloadPanelData,
  preloadAchievementData
};
