
import { supabase } from '@/integrations/supabase/client';
import { ContentRecommendation } from '../types';

/**
 * Repository for content data
 */
export const contentRepository = {
  /**
   * Get all available content
   */
  async getAllContent(): Promise<any[]> {
    try {
      // Note: In a production app, this should be updated to use proper types from the Supabase schema
      const { data, error } = await supabase
        .from('content_library')
        .select('*');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching content library:', error);
      return [];
    }
  }
};
