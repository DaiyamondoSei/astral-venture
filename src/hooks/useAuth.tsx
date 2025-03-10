
import { useContext } from 'react';
import AuthContext, { IAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for accessing auth context with type safety
 * @returns Auth context with full typing
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
