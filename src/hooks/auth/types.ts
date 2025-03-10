
import type { User } from '@supabase/supabase-js';

export interface IUserProfile {
  id: string;
  email: string;
  displayName?: string;
  full_name?: string;
  avatar?: string;
  avatar_url?: string;
  energy_points?: number;
  astral_level?: number;
  consciousness_level?: number;
  meditation_minutes?: number;
  last_active_at?: string;
  preferences?: Record<string, unknown>;
}

export interface IUserStreak {
  current: number;
  longest: number;
  lastActivity?: string;
}

export interface ITodayChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
}

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
