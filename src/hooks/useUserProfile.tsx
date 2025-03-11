
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SafeEntity, ensureEntityId } from '@/types/core';

// Define explicit interface for user profile
interface UserProfile extends SafeEntity<{
  id: string;
  user_id?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}> {}

// Define challenge interface
interface Challenge extends SafeEntity<{
  id: string;
  title: string;
  description: string;
  points?: number;
  difficulty?: string;
  created_at?: string;
}> {}

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
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
          
          // Ensure the profile has an id
          setUserProfile(ensureEntityId(data));
          
          const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .limit(1)
            .order('id', { ascending: false });
            
          if (challengeError) throw challengeError;
          
          if (challengeData && challengeData.length > 0) {
            // Ensure the challenge has an id
            setTodayChallenge(ensureEntityId(challengeData[0]));
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

  const updateUserProfile = (newData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? {
      ...prev,
      ...newData,
      // Always ensure id is present
      id: prev.id || newData.id || 'unknown-id'
    } : null);
  };

  return { 
    userProfile, 
    todayChallenge, 
    isLoading, 
    updateUserProfile 
  };
};
