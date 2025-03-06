
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export function useUserStreak(userId: string | undefined) {
  const [userStreak, setUserStreak] = useState<{ current: number; longest: number }>({ 
    current: 0, 
    longest: 0 
  });
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user streak data
  useEffect(() => {
    const fetchUserStreak = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (streakError) {
          console.error('Error fetching user streak:', streakError);
          // Set fallback values instead of throwing
          setUserStreak({ current: 0, longest: 0 });
        } else if (streakData) {
          setUserStreak({
            current: streakData.current_streak || 0,
            longest: streakData.longest_streak || 0
          });
        }

        // Fetch user progress to determine activated chakras
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .gte('completed_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())
          .order('completed_at', { ascending: false });

        if (progressError) {
          console.error('Error fetching user progress:', progressError);
        } else {
          // Extract chakra activation information from progress data
          const chakraActivations = progressData
            ?.filter(item => item.category === 'chakra_activation' || item.category === 'chakra_recalibration')
            ?.map(item => {
              const match = item.challenge_id.match(/chakra_(\d+)/);
              return match ? parseInt(match[1], 10) : null;
            })
            .filter((chakraIndex): chakraIndex is number => chakraIndex !== null && !isNaN(chakraIndex));

          setActivatedChakras(chakraActivations || []);
        }
      } catch (err) {
        console.error('Error in useUserStreak:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        // Set fallback values
        setUserStreak({ current: 0, longest: 0 });
        setActivatedChakras([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStreak();
  }, [userId]);

  // Update user streak
  const updateStreak = async (newStreak: number): Promise<number | undefined> => {
    if (!userId) {
      toast({
        title: "Error updating streak",
        description: "User ID is missing.",
        variant: "destructive"
      });
      return undefined;
    }

    try {
      const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Calculate longest streak
      const longestStreak = existingStreak 
        ? Math.max(existingStreak.longest_streak || 0, newStreak) 
        : newStreak;

      if (existingStreak) {
        // Update existing streak
        const { data, error } = await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId)
          .select('*')
          .single();

        if (error) throw error;

        setUserStreak({
          current: data?.current_streak || newStreak,
          longest: data?.longest_streak || longestStreak
        });
        
        return data?.current_streak;
      } else {
        // Create new streak record
        const { data, error } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: newStreak,
            longest_streak: newStreak,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .select('*')
          .single();

        if (error) throw error;

        setUserStreak({
          current: data?.current_streak || newStreak,
          longest: data?.longest_streak || newStreak
        });
        
        return data?.current_streak;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        title: "Failed to update streak",
        description: "Please try again later.",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const updateActivatedChakras = (newActivatedChakras: number[]) => {
    setActivatedChakras(newActivatedChakras);
  };

  return {
    userStreak,
    activatedChakras,
    isLoading,
    error, 
    updateStreak,
    updateActivatedChakras
  };
}
