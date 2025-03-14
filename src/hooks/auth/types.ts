
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string | null;
  astral_level: number;
  energy_points: number;
  joined_at: string;
  last_active_at: string | null;
}

export interface IAuthContext {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  errorMessage?: string; // Add this to fix component errors
}

export interface UseAuthProps {
  redirectOnAuth?: boolean;
  redirectUrl?: string;
}
