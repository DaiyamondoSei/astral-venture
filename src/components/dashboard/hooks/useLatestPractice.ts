
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLatestPractice = (userId: string | undefined) => {
  const [latestPractice, setLatestPractice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLatestPractice = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get the latest user progress entry
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('challenge_id, completed_at, category')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
          
        if (progressError) {
          throw progressError;
        }

        if (!progressData) {
          setLatestPractice(null);
          setIsLoading(false);
          return;
        }

        // Check if the challenge_id is a valid UUID before querying challenges table
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(progressData.challenge_id);
        
        let title = '';
        if (isValidUuid) {
          // Only query the challenges table if we have a valid UUID
          const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('title')
            .eq('id', progressData.challenge_id)
            .single();
            
          if (challengeError && !challengeError.message.includes('No rows found')) {
            throw challengeError;
          }
          
          title = challengeData?.title || '';
        } else {
          // Handle non-UUID challenge IDs (like "chakra_5")
          if (progressData.challenge_id.startsWith('chakra_')) {
            const chakraNumber = progressData.challenge_id.split('_')[1];
            title = `Chakra ${chakraNumber} Activation`;
          } else {
            title = progressData.challenge_id;
          }
        }

        setLatestPractice({
          title,
          completedAt: progressData.completed_at,
          category: progressData.category
        });
      } catch (error) {
        console.error('Error fetching latest practice:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPractice();
  }, [userId]);

  return { latestPractice, isLoading, error };
};

export default useLatestPractice;
