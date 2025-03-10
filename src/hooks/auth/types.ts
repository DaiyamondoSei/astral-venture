
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
 * Authentication context interface
 */
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
