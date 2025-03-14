
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { IAuthContext, UserProfile } from '@/hooks/auth/types';

// Re-export the hook from the hooks/auth folder
export { useAuth } from '@/hooks/auth/useAuth';

// Create the authentication context with a default empty state
const defaultContext: IAuthContext = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
};

export const AuthContext = createContext<IAuthContext>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for active session on mount
    checkSession();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setIsAuthenticated = (state: boolean) => {
    // This function exists just to make the context definition cleaner
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
      setError('Failed to verify authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      setUser(data.user);
      setIsAuthenticated(!!data.user);
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;
      
      setUser(data.user);
      setIsAuthenticated(!!data.user);
      
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to log out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh profile after update
      await fetchUserProfile(user.id);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) throw new Error('No authenticated user');
      
      await fetchUserProfile(user.id);
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      setError(error.message || 'Failed to refresh profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: IAuthContext = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
