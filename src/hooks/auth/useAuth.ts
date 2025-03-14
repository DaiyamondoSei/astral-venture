
import { createContext, useContext } from 'react';
import { IAuthContext } from './types';

// Create default empty context
const defaultContext: IAuthContext = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
};

export const AuthContext = createContext<IAuthContext>(defaultContext);

// Export both a hook and the context
export const useAuth = () => useContext(AuthContext);
export default useAuth;
