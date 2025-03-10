
/**
 * Authentication Context - Re-Export
 * 
 * This file provides backward compatibility for imports while directing
 * developers to use the new unified auth hooks pattern.
 */

import AuthContext, { 
  type IAuthContext, 
  type IUserProfile, 
  type IUserStreak,
  AuthProvider
} from '../AuthContext';

// Re-export the context and provider
export { AuthContext, AuthProvider };

// Re-export types
export type { IAuthContext, IUserProfile, IUserStreak };

// Import the hook from the new location
import { useAuth } from '@/hooks/auth';

// Re-export the hook for backward compatibility
export { useAuth };

// Add deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[Deprecation Warning] Importing from "@/contexts/auth" is deprecated. ' +
    'Please import hooks from "@/hooks/auth" instead.'
  );
}

export default AuthContext;
