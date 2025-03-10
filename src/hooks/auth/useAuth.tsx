
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { handleError } from '@/utils/errorHandling/handleError';

// Define interface for auth context
export interface IAuthContext {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create auth context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Computed property for authentication status
  const isAuthenticated = !!session && !!user;
  
  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't set error state here as it's not critical
    }
  };
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Fetch user profile if we have a user
          if (initialSession.user) {
            await fetchUserProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize authentication'));
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch user profile on auth change if we have a user
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      toast.success('Signed in successfully!');
      
      // Profile will be set by the auth state change listener
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'sign_in', email }
      });
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (signUpError) throw signUpError;
      
      toast.success('Account created successfully!');
      
      // Profile will be created via database trigger
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'sign_up', email }
      });
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) throw signOutError;
      
      toast.success('Signed out successfully!');
      
      // Auth state change listener will clear session and user
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'sign_out' }
      });
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (resetError) throw resetError;
      
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'reset_password', email }
      });
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update password
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) throw updateError;
      
      toast.success('Password updated successfully!');
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'update_password' }
      });
      setError(err instanceof Error ? err : new Error('Failed to update password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send magic link
  const sendMagicLink = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (magicLinkError) throw magicLinkError;
      
      toast.success('Magic link sent to your email!');
    } catch (err) {
      handleError(err, {
        showToast: true,
        context: { action: 'send_magic_link', email }
      });
      setError(err instanceof Error ? err : new Error('Failed to send magic link'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Refresh user profile
        if (data.session.user) {
          await fetchUserProfile(data.session.user.id);
        }
      }
    } catch (err) {
      handleError(err, {
        showToast: false, // Don't show toast for refresh failures
        context: { action: 'refresh_session' }
      });
      setError(err instanceof Error ? err : new Error('Failed to refresh session'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auth context value
  const value: IAuthContext = {
    session,
    user,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    sendMagicLink,
    refreshSession,
    isAuthenticated
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
