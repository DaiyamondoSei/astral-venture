
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setUserProfile(data);
          
          const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .limit(1)
            .order('id', { ascending: false });
            
          if (challengeError) throw challengeError;
          
          if (challengeData && challengeData.length > 0) {
            setTodayChallenge(challengeData[0]);
          }
          
          // Ensure user streak record exists
          const { data: streakData, error: streakError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (streakError && streakError.code === 'PGRST116') {
            // Create streak record if it doesn't exist
            await supabase
              .from('user_streaks')
              .insert({
                user_id: user.id,
                current_streak: 0,
                longest_streak: 0
              });
          }
          
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          toast({
            title: "Failed to load profile",
            description: error.message,
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, toast]);

  const updateUserProfile = (newData: any) => {
    setUserProfile(prev => ({
      ...prev,
      ...newData
    }));
  };

  return { 
    userProfile, 
    todayChallenge, 
    isLoading, 
    updateUserProfile 
  };
};
