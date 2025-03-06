
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUserStreak = (userId: string | undefined) => {
  const [userStreak, setUserStreak] = useState({ current: 0, longest: 0 });
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserStreak = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Fetch streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (streakError) {
          if (streakError.code === 'PGRST116') {
            // No streak record found, create one
            try {
              await supabase
                .from('user_streaks')
                .insert({
                  user_id: userId,
                  current_streak: 0,
                  longest_streak: 0,
                  last_activity_date: new Date().toISOString()
                });
                
              setUserStreak({ current: 0, longest: 0 });
            } catch (insertError) {
              console.error('Error creating user streak record:', insertError);
            }
          } else {
            console.error('Error fetching user streak:', streakError);
            setError(streakError);
          }
        } else if (streakData) {
          setUserStreak({
            current: streakData.current_streak || 0,
            longest: streakData.longest_streak || 0
          });
        }
        
        // Fetch activated chakras from the past week
        try {
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const { data: chakraData, error: chakraError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_at', startOfWeek.toISOString())
            .order('completed_at', { ascending: false });
            
          if (chakraError) {
            console.error('Error fetching chakra data:', chakraError);
            setError(chakraError);
          } else if (chakraData && chakraData.length > 0) {
            const activatedDays = chakraData.map(item => {
              const date = new Date(item.completed_at);
              return date.getDay();
            });
            
            setActivatedChakras([...new Set(activatedDays)]);
          }
        } catch (chakraError) {
          console.error('Error processing chakra data:', chakraError);
          setError(chakraError as Error);
        }
      } catch (error) {
        console.error('Error in fetchUserStreak:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStreak();
  }, [userId, toast]);

  const updateStreak = async (newStreak: number) => {
    if (!userId) return undefined;
    
    try {
      const newLongest = Math.max(newStreak, userStreak.longest);
      
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) throw error;
        
      setUserStreak({
        current: newStreak,
        longest: newLongest
      });
      
      return newLongest;
    } catch (error: any) {
      console.error('Error updating streak:', error);
      toast({
        title: "Failed to update streak",
        description: error.message,
        variant: "destructive"
      });
      return undefined;
    }
  };
  
  const updateActivatedChakras = (newActivatedChakras: number[]) => {
    if (!newActivatedChakras || !Array.isArray(newActivatedChakras)) {
      console.error('Invalid activatedChakras data:', newActivatedChakras);
      return;
    }
    
    setActivatedChakras(prev => {
      const uniqueChakras = [...new Set([...(prev || []), ...newActivatedChakras])];
      return uniqueChakras;
    });
  };

  return {
    userStreak,
    activatedChakras,
    updateStreak,
    updateActivatedChakras,
    isLoading,
    error
  };
};
