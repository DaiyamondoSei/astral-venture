
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize auth state on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          isLoading: false,
          error: null
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: false,
        error: error ? new Error(error.message) : null
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: new Error(error.message) 
      }));
    }
  }, []);

  return {
    ...authState,
    signOut
  };
};
