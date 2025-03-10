
/**
 * @deprecated Import from '@/hooks/auth' instead
 * This file is kept for backward compatibility and will be removed in a future version.
 */

import { useAuth as useAuthHook } from './auth/useAuth';
import type { IAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for accessing auth context
 * @deprecated Import from '@/hooks/auth' instead
 */
export function useAuth(): IAuthContext {
  console.warn(
    '[Deprecation Warning] Importing from "useAuth.tsx" is deprecated. ' +
    'Please import from "@/hooks/auth" instead for better organization and type safety.'
  );
  
  return useAuthHook();
}

export default useAuth;
