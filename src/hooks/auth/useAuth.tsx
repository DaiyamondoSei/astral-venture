
import { useContext } from 'react';
import AuthContext, { IAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for consuming the AuthContext throughout the application
 * 
 * @returns The auth context containing user state and authentication methods
 */
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
