
/**
 * Authentication Types
 * 
 * These types define the structure and behavior of the authentication system.
 */

import type { User } from '@supabase/supabase-js';

/**
 * User profile information
 */
export interface IUserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

/**
 * User streak information
 */
export interface IUserStreak {
  current: number;
  longest: number;
  lastActivity?: string;
}

/**
 * Authentication hook options
 */
export interface UseAuthProps {
  /**
   * Whether to redirect on authentication state changes
   */
  redirect?: boolean;
  
  /**
   * Path to redirect to after successful login
   */
  redirectTo?: string;
  
  /**
   * Whether to store session in localStorage
   */
  persistSession?: boolean;
  
  /**
   * Whether to automatically refresh the session
   */
  autoRefresh?: boolean;
}

/**
 * Authentication context interface
 */
export interface IAuthContext {
  /**
   * Current authenticated user or null if not authenticated
   */
  user: User | null;
  
  /**
   * User profile information
   */
  userProfile: IUserProfile | null;
  
  /**
   * User streak information
   */
  userStreak: IUserStreak | null;
  
  /**
   * Activated chakras for the current user
   */
  activatedChakras: number[];
  
  /**
   * Today's challenge for the user
   */
  todayChallenge: any; // Will be typed properly in next iteration
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether authentication is currently loading
   */
  isLoading: boolean;
  
  /**
   * Whether the initial authentication check has completed
   */
  hasCompletedLoading: boolean;
  
  /**
   * Whether the profile is currently loading
   */
  profileLoading: boolean;
  
  /**
   * Login with email and password
   */
  login: (email: string, password: string) => Promise<boolean>;
  
  /**
   * Logout the current user
   */
  logout: () => Promise<void>;
  
  /**
   * Register a new user with email and password
   */
  register: (email: string, password: string) => Promise<boolean>;
  
  /**
   * Alias for logout with consistent naming
   */
  handleLogout: () => Promise<void>;
  
  /**
   * Whether logout is in progress
   */
  isLoggingOut: boolean;
  
  /**
   * Update the user's streak information
   */
  updateStreak: (streak: IUserStreak) => void;
  
  /**
   * Update the user's activated chakras
   */
  updateActivatedChakras: (chakras: number[]) => void;
  
  /**
   * Update the user's profile information
   */
  updateUserProfile: (profile: Partial<IUserProfile>) => void;
  
  /**
   * Error message from last authentication operation
   */
  errorMessage: string;
}
