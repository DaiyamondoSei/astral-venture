
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabase/client';

export interface UserProfileData {
  id: string;
  username: string;
  astral_level: number;
  energy_points: number;
  joined_at: string;
  last_active_at: string | null;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setStreak(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) {
      setError('No authenticated user');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch user streak
      try {
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!streakError && streakData) {
          setStreak(streakData as UserStreak);
        }
      } catch (streakErr) {
        console.warn('Failed to fetch user streak:', streakErr);
        // Don't fail the whole operation if streak fetch fails
      }

      setProfile(profileData as UserProfileData);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user) {
      setError('No authenticated user');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return data;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    streak,
    isLoading,
    error,
    fetchUserProfile,
    updateProfile
  };
}
