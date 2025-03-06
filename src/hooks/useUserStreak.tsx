
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUserStreak = (userId: string | undefined) => {
  const [userStreak, setUserStreak] = useState({ current: 0, longest: 0 });
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserStreak = async () => {
      if (!userId) return;
      
      try {
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (streakError) {
          console.error('Error fetching user streak:', streakError);
          return;
        }
        
        if (streakData) {
          setUserStreak({
            current: streakData.current_streak || 0,
            longest: streakData.longest_streak || 0
          });
          
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
            return;
          }
          
          if (chakraData && chakraData.length > 0) {
            const activatedDays = chakraData.map(item => {
              const date = new Date(item.completed_at);
              return date.getDay();
            });
            
            setActivatedChakras([...new Set(activatedDays)]);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserStreak:', error);
      }
    };
    
    fetchUserStreak();
  }, [userId]);

  const updateStreak = async (newStreak: number) => {
    if (!userId) return;
    
    try {
      const newLongest = Math.max(newStreak, userStreak.longest);
      
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', userId);
        
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
    }
  };
  
  const updateActivatedChakras = (newActivatedChakras: number[]) => {
    setActivatedChakras(prev => [...new Set([...prev, ...newActivatedChakras])]);
  };

  return {
    userStreak,
    activatedChakras,
    updateStreak,
    updateActivatedChakras
  };
};
