
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // This should be the supabase client
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setErrorMessage(error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Unexpected error during session fetch:', error);
        setErrorMessage('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setErrorMessage(null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      toast.success('Successfully logged in!');
      return data;
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMessage('An unexpected error occurred during login');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('Registration error:', error);
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      if (data.user && !data.user.identities?.length) {
        setErrorMessage('Email already registered');
        toast.error('This email is already registered');
        return;
      }
      
      toast.success('Registration successful! Please check your email for verification.');
      return data;
    } catch (error) {
      console.error('Unexpected registration error:', error);
      setErrorMessage('An unexpected error occurred during registration');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        setErrorMessage(error.message);
        toast.error(error.message);
        return;
      }
      
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      setErrorMessage('An unexpected error occurred during logout');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    login,
    register,
    logout,
    isLoading,
    errorMessage,
    isAuthenticated: !!user
  };
}
