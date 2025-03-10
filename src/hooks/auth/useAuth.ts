
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { IAuthContext } from './types';

/**
 * Hook for accessing authentication context
 * This is the recommended way to access authentication state and methods.
 */
export function useAuth(): IAuthContext {
  const authContext = useContext(AuthContext);
  
  if (authContext === null) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Ensure the component is wrapped in an AuthProvider component.'
    );
  }
  
  return authContext;
}

export default useAuth;
