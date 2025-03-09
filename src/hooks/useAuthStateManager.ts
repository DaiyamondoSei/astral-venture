
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLogout } from '@/hooks/useLogout';

// Hook to manage authentication state and actions
export function useAuthStateManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, isLoggingOut } = useLogout();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        // Get current session
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Auth state will update via the listener, which will redirect to dashboard
      toast({
        title: 'Login Successful',
        description: 'Welcome back to your journey.',
      });
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Check your credentials and try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
    return true;
  }, [toast]);

  // Register function
  const register = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Registration Successful',
        description: 'Please check your email to verify your account.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again with a different email.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    isLoggingOut
  };
}

export default useAuthStateManager;
