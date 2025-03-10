
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { validateDefined } from '@/utils/validation/runtimeValidation';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoggingOut: boolean;
  // Extended auth properties
  hasCompletedLoading: boolean;
  userProfile: any;
  todayChallenge: any;
  userStreak: any;
  activatedChakras: any[];
  profileLoading: boolean;
  handleLogout: (redirectPath?: string) => Promise<void>;
  updateStreak: (streak: any) => void;
  updateActivatedChakras: (chakras: any[]) => void;
  updateUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  
  // Additional user data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStreak, setUserStreak] = useState<any>({ current: 0, longest: 0 });
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [activatedChakras, setActivatedChakras] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserProfile(null);
        }
        
        setIsLoading(false);
        setHasCompletedLoading(true);
      }
    );
    
    // Initial session check
    checkCurrentSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
    } finally {
      setIsLoading(false);
      setHasCompletedLoading(true);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (!userId) return;
    
    setProfileLoading(true);
    setLoadAttempts(prev => prev + 1);
    
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error loading user profile:', profileError);
      } else if (profile) {
        setUserProfile(profile);
      }
      
      // Fetch user streak
      const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (streakError) {
        console.error('Error loading user streak:', streakError);
      } else if (streak) {
        setUserStreak(streak);
      }
      
      // Fetch activated chakras
      const { data: chakras, error: chakraError } = await supabase
        .from('chakra_systems')
        .select('chakras')
        .eq('user_id', userId)
        .single();
      
      if (chakraError) {
        console.error('Error loading chakra system:', chakraError);
      } else if (chakras && chakras.chakras) {
        // Extract activated chakras (those with value > 0)
        const activated = Object.entries(chakras.chakras)
          .filter(([_, value]: [string, any]) => value > 0)
          .map(([key]: [string, any]) => key);
        
        setActivatedChakras(activated);
      }
      
      // Fetch today's challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (challengeError) {
        console.error('Error loading today\'s challenge:', challengeError);
      } else if (challenge) {
        setTodayChallenge(challenge);
      }
    } catch (error) {
      console.error('Error in profile loading process:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      validateDefined(email, 'email');
      validateDefined(password, 'password');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        await loadUserProfile(data.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login process error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserProfile(null);
        setUserStreak({ current: 0, longest: 0 });
        setActivatedChakras([]);
      }
    } catch (error) {
      console.error('Logout process error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = async (redirectPath?: string): Promise<void> => {
    await logout();
    // No navigate calls here - should be handled by the component
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      validateDefined(email, 'email');
      validateDefined(password, 'password');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (data?.user) {
        // Create initial user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: data.user.id,
              email: data.user.email,
              created_at: new Date().toISOString(),
              energy_points: 0,
              level: 1
            }
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Failed to create account' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during registration';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = (streak: any) => {
    setUserStreak(streak);
  };

  const updateActivatedChakras = (chakras: any[]) => {
    setActivatedChakras(chakras);
  };

  const updateUserProfile = (profile: any) => {
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      isLoggingOut,
      hasCompletedLoading,
      userProfile,
      todayChallenge,
      userStreak,
      activatedChakras,
      profileLoading,
      handleLogout,
      updateStreak,
      updateActivatedChakras,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
