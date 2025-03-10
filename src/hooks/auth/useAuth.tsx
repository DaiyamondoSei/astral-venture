
import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

export interface IAuthContext {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedLoading: boolean;
  profileLoading: boolean;
  userProfile: any;
  userStreak: any;
  todayChallenge: any;
  activatedChakras: string[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoggingOut: boolean;
  handleLogout: (e?: React.MouseEvent) => void;
  updateStreak: () => Promise<void>;
  updateUserProfile: () => Promise<void>;
  updateActivatedChakras: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { recordInteraction } = usePerformanceTracking('AuthProvider', {
    categories: ['auth', 'core'],
    trackRenders: true
  });

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStreak, setUserStreak] = useState<any>(null);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [activatedChakras, setActivatedChakras] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        recordInteraction('auth-state-change', {
          event,
          hasSession: !!session
        });
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          setIsAuthenticated(!!session?.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setUserProfile(null);
          setUserStreak(null);
          setTodayChallenge(null);
          setActivatedChakras([]);
        }
        
        setIsLoading(false);
        setHasCompletedLoading(true);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
        setHasCompletedLoading(true);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
          await fetchUserStreak(session.user.id);
          await fetchActivatedChakras(session.user.id);
          await fetchTodayChallenge(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
        setHasCompletedLoading(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      // Check for user_profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code !== 'PGRST116') { // Not found error
          console.error('Error fetching profile:', profileError);
        }
        setUserProfile(null);
      } else {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch user streak data
  const fetchUserStreak = async (userId: string) => {
    try {
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError) {
        if (streakError.code !== 'PGRST116') {
          console.error('Error fetching user streak:', streakError);
        }
        setUserStreak(null);
      } else {
        setUserStreak(streakData);
      }
    } catch (error) {
      console.error('Error fetching user streak:', error);
    }
  };

  // Fetch activated chakras
  const fetchActivatedChakras = async (userId: string) => {
    try {
      const { data: chakrasData, error: chakrasError } = await supabase
        .from('activated_chakras')
        .select('chakra_id')
        .eq('user_id', userId);

      if (chakrasError) {
        console.error('Error fetching activated chakras:', chakrasError);
        setActivatedChakras([]);
      } else {
        const chakraIds = chakrasData?.map(item => item.chakra_id) || [];
        setActivatedChakras(chakraIds);
      }
    } catch (error) {
      console.error('Error fetching activated chakras:', error);
    }
  };

  // Fetch today's challenge
  const fetchTodayChallenge = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: challengeData, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .eq('user_id', userId)
        .single();

      if (challengeError) {
        if (challengeError.code !== 'PGRST116') {
          console.error('Error fetching today\'s challenge:', challengeError);
        }
        setTodayChallenge(null);
      } else {
        setTodayChallenge(challengeData);
      }
    } catch (error) {
      console.error('Error fetching today\'s challenge:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        await fetchUserProfile(data.user.id);
        await fetchUserStreak(data.user.id);
        await fetchActivatedChakras(data.user.id);
        await fetchTodayChallenge(data.user.id);
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler with additional cleanup
  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setUserProfile(null);
      setUserStreak(null);
      setTodayChallenge(null);
      setActivatedChakras([]);
      
      // Clear local cache
      localStorage.removeItem('userPreferences');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  // Register function
  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return {
        success: false,
        error: "Registration failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An error occurred during registration",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Update functions for refresh data
  const updateUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const updateStreak = async () => {
    if (user?.id) {
      await fetchUserStreak(user.id);
    }
  };

  const updateActivatedChakras = async () => {
    if (user?.id) {
      await fetchActivatedChakras(user.id);
    }
  };

  // Provided context value
  const value: IAuthContext = {
    user,
    isAuthenticated,
    isLoading,
    hasCompletedLoading,
    profileLoading,
    userProfile,
    userStreak,
    todayChallenge,
    activatedChakras,
    login,
    logout,
    register,
    isLoggingOut,
    handleLogout,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
