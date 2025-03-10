
import { useContext } from 'react';
import { AuthContext, IAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access authentication context
 * 
 * This is the recommended way to access authentication state
 * and methods throughout the application.
 */
export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
