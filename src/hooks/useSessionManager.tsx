
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/utils/apiClient';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface SessionState {
  isValid: boolean;
  expiresAt: number | null;
  lastChecked: number;
}

/**
 * Custom hook for managing session state and refresh
 * Automatically refreshes tokens before they expire
 */
export function useSessionManager() {
  const { user, session, updateSession } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>({
    isValid: !!session,
    expiresAt: session?.expires_at ? new Date(session.expires_at).getTime() : null,
    lastChecked: Date.now()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  /**
   * Refresh the session token
   */
  const refreshSession = useCallback(async () => {
    if (!user || isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setRefreshError(null);
      
      console.log('Refreshing session token...');
      
      // Call the refresh-session edge function
      const refreshData = await api.refreshSession();
      
      // Use the refreshed token
      if (refreshData.token) {
        // Update the session on the client side
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Failed to get updated session: ${sessionError.message}`);
        }
        
        // Update the session in the auth context
        if (sessionData.session) {
          updateSession(sessionData.session);
          
          setSessionState({
            isValid: true,
            expiresAt: refreshData.expiresAt,
            lastChecked: Date.now()
          });
          
          console.log('Session refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      
      const errorMessage = error instanceof ApiError
        ? `Session refresh failed: ${error.message}`
        : 'Session refresh failed';
      
      setRefreshError(errorMessage);
      
      toast({
        title: "Session Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      
      // Force logout on critical session errors
      if (error instanceof ApiError && error.code === 'auth/unauthorized') {
        supabase.auth.signOut();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [user, isRefreshing, updateSession]);

  /**
   * Check if the session needs to be refreshed
   */
  const checkSessionValidity = useCallback(() => {
    if (!sessionState.expiresAt || !user) return;
    
    const now = Date.now();
    const timeUntilExpiry = sessionState.expiresAt - now;
    
    // If session expires within the next hour (3600000 ms), refresh it
    if (timeUntilExpiry < 3600000 && timeUntilExpiry > 0) {
      refreshSession();
    }
    
    // If session is expired, handle logout
    if (timeUntilExpiry <= 0) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      
      supabase.auth.signOut();
    }
  }, [sessionState.expiresAt, user, refreshSession]);

  // Initial check when the component mounts
  useEffect(() => {
    if (session) {
      setSessionState({
        isValid: true,
        expiresAt: session.expires_at ? new Date(session.expires_at).getTime() : null,
        lastChecked: Date.now()
      });
    }
  }, [session]);

  // Set up periodic session check
  useEffect(() => {
    // Check validity immediately
    checkSessionValidity();
    
    // Set up interval to check session every 15 minutes
    const intervalId = setInterval(() => {
      checkSessionValidity();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [checkSessionValidity]);

  return {
    isSessionValid: sessionState.isValid,
    isRefreshing,
    refreshError,
    refreshSession,
    sessionExpiresAt: sessionState.expiresAt
  };
}
