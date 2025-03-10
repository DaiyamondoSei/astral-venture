
import { useContext } from 'react';
import AuthContext, { IAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to access the authentication context
 * 
 * @returns Authentication context with user data and auth methods
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
