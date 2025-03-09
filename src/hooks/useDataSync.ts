
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface DataSyncOptions {
  syncInterval?: number;
  autoSync?: boolean;
  showToasts?: boolean;
  onSyncComplete?: (data: any) => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Hook for syncing user data with the server
 */
export function useDataSync(options: DataSyncOptions = {}) {
  const { 
    syncInterval = 300000, // 5 minutes
    autoSync = true,
    showToasts = false,
    onSyncComplete,
    onSyncError
  } = options;
  
  const { user, isAuthenticated } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [syncData, setSyncData] = useState<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to sync data with the server
  const syncData = async () => {
    if (!isAuthenticated || !user) {
      setError(new Error('User not authenticated'));
      return;
    }

    try {
      setIsSyncing(true);
      setError(null);

      // Call the sync-user-data edge function
      const { data, error } = await supabase.functions.invoke('sync-user-data', {
        body: {
          lastSyncTime: lastSyncTime?.toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update the last sync time
      setLastSyncTime(new Date());
      setSyncData(data);

      // Call the onSyncComplete callback
      if (onSyncComplete) {
        onSyncComplete(data);
      }

      // Show success toast if enabled
      if (showToasts) {
        toast({
          title: 'Data synced',
          description: 'Your data has been successfully synchronized',
          duration: 3000
        });
      }

      return data;
    } catch (err: any) {
      const errorObj = new Error(err.message || 'Error syncing data');
      setError(errorObj);
      
      // Call the onSyncError callback
      if (onSyncError) {
        onSyncError(errorObj);
      }

      // Show error toast if enabled
      if (showToasts) {
        toast({
          title: 'Sync error',
          description: errorObj.message,
          variant: 'destructive',
          duration: 5000
        });
      }

      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Set up automatic sync interval
  useEffect(() => {
    if (autoSync && isAuthenticated) {
      // Initial sync
      syncData();

      // Set up interval
      syncIntervalRef.current = setInterval(syncData, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, isAuthenticated, syncInterval]);

  return {
    syncData,
    lastSyncTime,
    isSyncing,
    error,
    data: syncData
  };
}
