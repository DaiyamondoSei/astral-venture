
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/apiClient';

// Session refresh interval - check every 10 minutes
const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000;

export function useSessionManager() {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  
  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    if (!user) return;
    
    try {
      // Call our refresh-session edge function
      const sessionInfo = await api.refreshSession();
      
      console.log('Session refreshed successfully, expires at:', new Date(sessionInfo.expiresAt));
      setIsSessionValid(true);
      
      // Calculate time until session expiry (minus 5 minutes buffer)
      const timeUntilExpiry = sessionInfo.expiresAt - Date.now() - (5 * 60 * 1000);
      
      // Schedule next refresh just before expiry
      setTimeout(refreshSession, Math.min(timeUntilExpiry, SESSION_REFRESH_INTERVAL));
      
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      
      // Only show toast for authentication errors, not network issues
      if (error.code?.startsWith('auth/')) {
        toast({
          title: "Session expired",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
        
        setIsSessionValid(false);
        
        // Force logout on auth errors
        supabase.auth.signOut();
        setUser(null);
      } else {
        // For non-auth errors, try again later
        setTimeout(refreshSession, 60 * 1000); // Try again in 1 minute
      }
    }
  }, [user, setUser, toast]);
  
  // Set up session refresh on component mount
  useEffect(() => {
    if (!user) return;
    
    // Initial session refresh
    refreshSession();
    
    // Set up regular interval refresh as a fallback
    const intervalId = setInterval(refreshSession, SESSION_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user, refreshSession]);
  
  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsSessionValid(true);
        // Refresh immediately on sign in
        refreshSession();
      } else if (event === 'SIGNED_OUT') {
        setIsSessionValid(false);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshSession]);
  
  return { isSessionValid };
}
