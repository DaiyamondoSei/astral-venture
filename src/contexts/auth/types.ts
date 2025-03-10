
import { User } from '@supabase/supabase-js';
import type { IUserProfile } from '@/types/user';

export interface IAuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedLoading: boolean;
  profileLoading: boolean;
  isLoggingOut: boolean;
  userProfile: IUserProfile | null;
  userStreak: number;
  todayChallenge: any; // TODO: Add proper challenge type
  activatedChakras: string[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  handleLogout: () => Promise<void>;
  updateStreak: () => Promise<void>;
  updateActivatedChakras: (chakras: string[]) => Promise<void>;
  updateUserProfile: (profile: Partial<IUserProfile>) => Promise<void>;
}

export interface IUserProfileUpdateParams {
  id?: string;
  email?: string;
  username?: string;
  astralLevel?: number;
  energyPoints?: number;
  preferences?: Record<string, unknown>;
  lastActive?: Date;
}
