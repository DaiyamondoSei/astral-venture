
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useLatestPractice(userId: string | undefined) {
  const [latestPractice, setLatestPractice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLatestPractice = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First get the latest user_progress to find what they completed
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('challenge_id, completed_at, category')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (progressError) {
          throw progressError;
        }

        if (!progressData || progressData.length === 0) {
          setLatestPractice(null);
          setIsLoading(false);
          return;
        }

        const latestProgress = progressData[0];
        const challengeId = latestProgress.challenge_id;
        const category = latestProgress.category || 'unknown';

        // Check if the challenge_id is a UUID or a special ID like "chakra_5"
        if (challengeId.includes('chakra_') || challengeId.includes('_')) {
          // For special IDs, create a simplified practice object
          setLatestPractice({
            title: `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Practice`,
            category: category,
            completedAt: latestProgress.completed_at
          });
          setIsLoading(false);
          return;
        }

        // For regular UUID challenges, fetch the challenge details
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeError) {
          console.error('Error fetching challenge data:', challengeError);
          // Instead of throwing, create a fallback object
          setLatestPractice({
            title: `${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Practice`,
            category: category,
            completedAt: latestProgress.completed_at
          });
        } else {
          setLatestPractice({
            ...challengeData,
            completedAt: latestProgress.completed_at
          });
        }
      } catch (err) {
        console.error('Error in useLatestPractice:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPractice();
  }, [userId]);

  return { latestPractice, isLoading, error };
}
