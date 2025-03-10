
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { IAuthContext } from './types';

/**
 * Custom hook for accessing authentication context
 * 
 * Provides access to user authentication state and methods for login, logout, etc.
 * 
 * @returns The authentication context with user state and authentication methods
 */
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
