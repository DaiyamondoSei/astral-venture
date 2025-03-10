
/**
 * Authentication hooks for managing user state and authentication
 * 
 * These hooks provide type-safe access to authentication state and operations.
 */

export { useAuth } from './useAuth';
export { useAuthState } from './useAuthState';

// For backward compatibility with existing code
import { useAuth } from './useAuth';
import { useAuthState } from './useAuthState';

export default useAuth;
