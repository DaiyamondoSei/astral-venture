
/**
 * Compatibility layer for auth context to ensure consistent interfaces across the application.
 * This module bridges any gaps between the AuthContext interface and components that use it.
 */
import type { IAuthContext, IUserProfile, IUserStreak } from '@/contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

/**
 * Interface for components that only need basic authentication state
 */
export interface BasicAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  isLoggingOut: boolean;
}

/**
 * Interface for components that need user profile information
 */
export interface UserProfileState extends BasicAuthState {
  userProfile: IUserProfile | null;
  profileLoading: boolean;
  updateUserProfile: (profile: Partial<IUserProfile>) => void;
}

/**
 * Interface for components that need user streak information
 */
export interface UserStreakState extends BasicAuthState {
  userStreak: IUserStreak | null;
  updateStreak: (streak: IUserStreak) => void;
}

/**
 * Interface for components that need chakra information
 */
export interface ChakraState extends BasicAuthState {
  activatedChakras: number[];
  updateActivatedChakras: (chakras: number[]) => void;
}

/**
 * Extract just the basic auth state from the full auth context
 * @param authContext Full auth context
 * @returns Basic auth state
 */
export function extractBasicAuth(authContext: IAuthContext): BasicAuthState {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    register, 
    isLoggingOut 
  } = authContext;
  
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

/**
 * Extract user profile state from the full auth context
 * @param authContext Full auth context
 * @returns User profile state
 */
export function extractUserProfileState(authContext: IAuthContext): UserProfileState {
  return {
    ...extractBasicAuth(authContext),
    userProfile: authContext.userProfile,
    profileLoading: authContext.profileLoading,
    updateUserProfile: authContext.updateUserProfile
  };
}

/**
 * Extract user streak state from the full auth context
 * @param authContext Full auth context
 * @returns User streak state
 */
export function extractUserStreakState(authContext: IAuthContext): UserStreakState {
  return {
    ...extractBasicAuth(authContext),
    userStreak: authContext.userStreak,
    updateStreak: authContext.updateStreak
  };
}

/**
 * Extract chakra state from the full auth context
 * @param authContext Full auth context
 * @returns Chakra state
 */
export function extractChakraState(authContext: IAuthContext): ChakraState {
  return {
    ...extractBasicAuth(authContext),
    activatedChakras: authContext.activatedChakras,
    updateActivatedChakras: authContext.updateActivatedChakras
  };
}

export default {
  extractBasicAuth,
  extractUserProfileState,
  extractUserStreakState,
  extractChakraState
};
