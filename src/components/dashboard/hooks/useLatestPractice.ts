
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LatestPractice {
  title: string;
  completedAt: string;
  category: string;
}

interface UseLatestPracticeResult {
  latestPractice: LatestPractice | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch the latest practice completed by the user
 */
export function useLatestPractice(): UseLatestPracticeResult {
  const [latestPractice, setLatestPractice] = useState<LatestPractice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchLatestPractice = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_progress')
        .select('challenge_id, completed_at, category')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No data found
          setLatestPractice(null);
          setLoading(false);
          return;
        }
        throw new Error(fetchError.message);
      }
      
      if (data) {
        // Get the challenge details to get the title
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('title')
          .eq('id', data.challenge_id)
          .single();
        
        if (challengeError) {
          throw new Error(challengeError.message);
        }
        
        setLatestPractice({
          title: challengeData?.title || 'Unknown practice',
          completedAt: data.completed_at,
          category: data.category
        });
      } else {
        setLatestPractice(null);
      }
    } catch (err) {
      console.error('Error fetching latest practice:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLatestPractice();
  }, [user]);

  return {
    latestPractice,
    loading,
    error,
    refetch: fetchLatestPractice
  };
}
