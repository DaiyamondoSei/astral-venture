
import type { User } from '@supabase/supabase-js';

/**
 * User profile interface
 */
export interface IUserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

/**
 * User streak tracking interface
 */
export interface IUserStreak {
  current: number;
  longest: number;
  lastActivity?: string;
}

/**
 * Today's challenge interface
 */
export interface ITodayChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  energy_points: number;
  category: string;
}

/**
 * Auth context interface
 */
export interface IAuthContext {
  user: User | null;
  userProfile: IUserProfile | null;
  userStreak: IUserStreak | null;
  activatedChakras: number[];
  todayChallenge: ITodayChallenge | null;
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
