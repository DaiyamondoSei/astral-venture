
import { supabase } from '@/integrations/supabase/client';

export const getTodaysChallenge = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }
};
