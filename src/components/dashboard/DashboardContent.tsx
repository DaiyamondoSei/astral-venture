import React, { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStreak } from '@/hooks/useUserStreak';
import { useDashboardContext } from './DashboardContext';
import { calculateAstralLevel } from '@/utils/calculations';
import { calculateNextLevelXP } from '@/utils/calculations';
import { calculateLevelProgress } from '@/utils/calculations';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from '@/utils/apiClient';

const DashboardContent = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { onOpenAIAssistant } = useDashboardContext();
  const { userStreak, activatedChakras, isLoading: isStreakLoading, error: streakError } = useUserStreak(userId);
  const [levelInfo, setLevelInfo] = useState({ level: 1, nextLevelXP: 100, progress: 0 });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setError(error);
          toast({
            title: "Error fetching profile",
            description: "Could not load your profile data.",
            variant: "destructive"
          });
        } else {
          setProfile(data);
          const level = calculateAstralLevel(data.energy_points || 0);
          const nextLevelXP = calculateNextLevelXP(level);
          const progress = calculateLevelProgress(data.energy_points || 0, level);
          setLevelInfo({ level, nextLevelXP, progress });
        }
      } catch (err) {
        console.error('Error in fetchUserProfile:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        toast({
          title: "Unexpected error",
          description: "An unexpected error occurred while loading your profile.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, supabaseClient]);
  
  const handleOpenAIAssistant = () => {
    onOpenAIAssistant(); // Removed the incorrect argument
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      ) : error ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{profile?.full_name || 'Loading...'}</h2>
                <p className="text-gray-500">Astral Level: {levelInfo.level}</p>
              </div>
            </div>
            <div className="mb-2">
              <p>Energy Points: {profile?.energy_points || 0}</p>
              <p>Next Level XP: {levelInfo.nextLevelXP}</p>
              <p>Progress: {levelInfo.progress}%</p>
            </div>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleOpenAIAssistant}
            >
              Ask AI Assistant
            </button>
          </div>

          {/* Streak Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">Your Streak</h2>
            {isStreakLoading ? (
              <p>Loading streak...</p>
            ) : streakError ? (
              <p className="text-red-500">Error: {streakError.message}</p>
            ) : (
              <>
                <p>Current Streak: {userStreak.current} days</p>
                <p>Longest Streak: {userStreak.longest} days</p>
                <p>Activated Chakras: {activatedChakras.length > 0 ? activatedChakras.join(', ') : 'None'}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
