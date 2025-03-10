
/**
 * Authentication Hooks - Central Export
 * 
 * This file provides a unified entry point for all authentication-related hooks,
 * ensuring consistent import patterns across the application.
 * 
 * USAGE:
 * import { useAuth, useLogout } from '@/hooks/auth';
 */

export { useAuth } from './useAuth';
export { useLogout } from './useLogout';
export { useUser } from './useUser';

// Re-export types for easier access
export type { IAuthContext, IUserProfile, IUserStreak } from '@/contexts/AuthContext';
