
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useLatestPractice() {
  const [latestPractice, setLatestPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLatestPractice = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('challenge_id, completed_at, category')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data && !error) {
          // Get the challenge details to get the title
          const { data: challengeData } = await supabase
            .from('challenges')
            .select('title')
            .eq('id', data.challenge_id)
            .single();
          
          setLatestPractice({
            title: challengeData?.title || 'Unknown practice',
            completedAt: data.completed_at,
            category: data.category
          });
        }
      } catch (error) {
        console.error('Error fetching latest practice:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestPractice();
  }, [user]);

  return {
    latestPractice,
    loading
  };
}
