
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { usePerfConfig } from './usePerfConfig';

// Interface for the synchronization state
interface SyncState {
  isLoading: boolean;
  lastSyncTime: string | null;
  syncErrors: Record<string, string>;
  syncInProgress: boolean;
}

// Available data sections to sync
type DataSection = 'user_profile' | 'achievements' | 'energy_reflections' | 'activity' | 'streak' | 'all';

/**
 * Hook for synchronizing data between client and backend
 * 
 * This hook manages bidirectional data synchronization:
 * 1. Pull: Fetches updated data from the server
 * 2. Push: Sends locally modified data to the server
 */
export function useDataSync() {
  const { user } = useAuth();
  const config = usePerfConfig();
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSyncTime: null,
    syncErrors: {},
    syncInProgress: false
  });

  // Synchronize data from the backend
  const syncFromBackend = useCallback(async (section: DataSection = 'all') => {
    if (!user) return null;
    
    try {
      setSyncState(prev => ({
        ...prev,
        isLoading: true,
        syncInProgress: true
      }));
      
      // Get the last sync timestamp for this section
      const lastSyncTimestamp = localStorage.getItem(`last_sync_${section}`) || null;
      
      // Call the edge function to get updated data
      const { data, error } = await supabase.functions.invoke('sync-user-data', {
        body: { 
          section, 
          lastSyncTimestamp
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        // Store the sync timestamp
        const newSyncTime = data.data.syncTimestamp;
        localStorage.setItem(`last_sync_${section}`, newSyncTime);
        
        // Update the sync state
        setSyncState(prev => ({
          ...prev,
          isLoading: false,
          lastSyncTime: newSyncTime,
          syncInProgress: false,
          syncErrors: { ...prev.syncErrors, [section]: null }
        }));
        
        return data.data;
      }
      
      throw new Error('Sync response was not successful');
    } catch (error) {
      console.error(`Error syncing ${section} from backend:`, error);
      
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        syncInProgress: false,
        syncErrors: { 
          ...prev.syncErrors, 
          [section]: error.message || 'Unknown error during sync'
        }
      }));
      
      return null;
    }
  }, [user]);
  
  // Periodically synchronize based on config settings
  useEffect(() => {
    if (!user || !config.enableBackendIntegration) return;
    
    // Set up polling intervals for different sections based on their update frequency
    const intervals = [
      setInterval(() => syncFromBackend('user_profile'), 5 * 60 * 1000), // Every 5 minutes
      setInterval(() => syncFromBackend('achievements'), 2 * 60 * 1000),  // Every 2 minutes
      setInterval(() => syncFromBackend('streak'), 10 * 60 * 1000),       // Every 10 minutes
    ];
    
    // Initial sync when component mounts
    syncFromBackend('all');
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [user, syncFromBackend, config.enableBackendIntegration]);
  
  return {
    ...syncState,
    syncFromBackend,
    isSyncing: syncState.syncInProgress
  };
}
