
/**
 * Custom hook for accessing authentication context
 * 
 * Provides access to user authentication state and methods for login, logout, etc.
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { IAuthContext, UseAuthProps } from './types';

/**
 * Custom hook for accessing authentication context
 * 
 * @param options - Configuration options for authentication behavior
 * @returns The authentication context with user state and authentication methods
 * @throws Error if used outside an AuthProvider
 */
export function useAuth(options: UseAuthProps = {}): IAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
