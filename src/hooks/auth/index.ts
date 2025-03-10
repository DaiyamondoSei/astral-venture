
/**
 * Authentication Hooks Module
 * 
 * This module provides a centralized export point for all authentication-related
 * hooks to prevent circular dependencies and ensure consistent usage patterns.
 */

// Export the primary useAuth hook
export { useAuth } from './useAuth';

// Re-export types
export type { 
  IAuthContext, 
  IUserProfile, 
  IUserStreak 
} from '@/contexts/AuthContext';

// Advanced auth hooks
export { default as useAuthSession } from './useAuthSession';
export { default as useAuthState } from './useAuthState';
