
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

/**
 * Hook for tracking the current authenticated user
 * @returns Current authenticated user or null if not authenticated
 */
export function useUser(): User | null {
  // Get session data
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getInitialSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user || null);
      }
    );
    
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  return user;
}
