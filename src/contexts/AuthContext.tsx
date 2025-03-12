
import { createContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase, getSupabaseSync } from '@/lib/supabase/client';

// Get the supabase client
const supabase = getSupabaseSync();

export interface IUserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

export interface IUserStreak {
  current: number;
  longest: number;
  lastActivity?: string;
}

export interface IAuthContext {
  user: User | null;
  userProfile: IUserProfile | null;
  userStreak: IUserStreak | null;
  activatedChakras: number[];
  todayChallenge: any; // Will be typed properly in next iteration
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedLoading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  handleLogout: () => Promise<void>;
  isLoggingOut: boolean;
  updateStreak: (streak: IUserStreak) => void;
  updateActivatedChakras: (chakras: number[]) => void;
  updateUserProfile: (profile: Partial<IUserProfile>) => void;
  errorMessage: string;
}

/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the application.
 * Use the useAuth() hook from '@/hooks/auth' to consume this context.
 */
export const AuthContext = createContext<IAuthContext | null>(null);

// Export for backward compatibility, but mark as deprecated
// In the future, importing from '@/hooks/auth' should be preferred
/**
 * @deprecated Import from '@/hooks/auth' instead
 */
export const useAuth = () => {
  throw new Error('Direct import of useAuth from AuthContext is deprecated. Import from "@/hooks/auth" instead.');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [userStreak, setUserStreak] = useState<IUserStreak | null>(null);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const client = await getSupabase();
      const { data: { user }, error } = await client.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        setErrorMessage(error.message);
        return false;
      }

      setUser(user);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Unexpected login error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const client = await getSupabase();
      const { data: { user }, error } = await client.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Registration error:', error);
        setErrorMessage(error.message);
        return false;
      }

      setUser(user);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Unexpected registration error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      const client = await getSupabase();
      const { error } = await client.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setErrorMessage(error.message);
      }
      setUser(null);
      setUserProfile(null);
      setActivatedChakras([]);
      setTodayChallenge(null);
    } catch (err) {
      const error = err as Error;
      console.error('Unexpected logout error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred during logout');
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
  }, [logout]);

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      setProfileLoading(true);
      try {
        const client = await getSupabase();
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setErrorMessage(error.message);
        }

        if (data) {
          setUserProfile(data as IUserProfile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Unexpected error fetching user profile:', error);
        setErrorMessage(error.message || 'Error fetching user profile');
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchUserStreak = async (userId: string) => {
      try {
        const client = await getSupabase();
        const { data, error } = await client
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching streak:', error);
        }

        if (data) {
          setUserStreak({
            current: data.current_streak || 0,
            longest: data.longest_streak || 0,
            lastActivity: data.last_activity_date
          });
        } else {
          setUserStreak(null);
        }
      } catch (err) {
        console.error("Unexpected error fetching user streak:", err);
      }
    };

    const fetchActivatedChakras = async (userId: string) => {
      try {
        const client = await getSupabase();
        const { data, error } = await client
          .from('activated_chakras')
          .select('chakra_id')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching activated chakras:', error);
        }

        const chakraIds = data ? data.map(item => item.chakra_id) : [];
        setActivatedChakras(chakraIds);
      } catch (err) {
        console.error("Unexpected error fetching activated chakras:", err);
      }
    };

    const fetchTodayChallenge = async (userId: string) => {
      try {
        const client = await getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await client
          .from('daily_challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single();

        if (error) {
          console.error('Error fetching today\'s challenge:', error);
        }

        setTodayChallenge(data || null);
      } catch (err) {
        console.error("Unexpected error fetching today's challenge:", err);
      }
    };

    // Reset error message when auth state changes
    setErrorMessage('');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
      setHasCompletedLoading(true);

      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserStreak(session.user.id);
        fetchActivatedChakras(session.user.id);
        fetchTodayChallenge(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserStreak(session.user.id);
        fetchActivatedChakras(session.user.id);
        fetchTodayChallenge(session.user.id);
      } else {
        setUserProfile(null);
        setUserStreak(null);
        setActivatedChakras([]);
        setTodayChallenge(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateStreak = useCallback((streak: IUserStreak) => {
    setUserStreak(streak);
  }, []);

  const updateActivatedChakras = useCallback((chakras: number[]) => {
    setActivatedChakras(chakras);
  }, []);

  const updateUserProfile = useCallback((profile: Partial<IUserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...profile } as IUserProfile : { ...profile } as IUserProfile);
  }, []);

  const value: IAuthContext = {
    user,
    userProfile,
    userStreak,
    activatedChakras,
    todayChallenge,
    isAuthenticated: !!user,
    isLoading,
    hasCompletedLoading,
    profileLoading,
    login,
    logout,
    register,
    handleLogout,
    isLoggingOut,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile,
    errorMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
