
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export function useDataSync() {
  const { user } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    achievements: [],
    userStats: null,
    streak: null,
    preferences: null
  });

  const syncData = useCallback(async (force = false) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: syncResponse, error: syncError } = await supabase.functions.invoke('sync-user-data', {
        body: { lastSyncTime: force ? null : lastSyncTime }
      });

      if (syncError) {
        console.error('Error syncing data:', syncError);
        setError(syncError.message);
        return null;
      }

      if (syncResponse) {
        setData({
          achievements: syncResponse.achievements || [],
          userStats: syncResponse.userStats,
          streak: syncResponse.streak,
          preferences: syncResponse.preferences
        });
        setLastSyncTime(syncResponse.timestamp);
        return syncResponse;
      }

      return null;
    } catch (err: any) {
      console.error('Data sync error:', err);
      setError(err.message || 'Failed to sync data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, lastSyncTime]);

  // Initial sync on component mount
  useEffect(() => {
    if (user && !lastSyncTime) {
      syncData();
    }
  }, [user]);

  return {
    syncData,
    forceSync: () => syncData(true),
    lastSyncTime,
    isLoading,
    error,
    data
  };
}
