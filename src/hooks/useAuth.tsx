
/**
 * @deprecated Import from "@/hooks/auth/useAuth" instead for better organization and type safety.
 */

import { useAuth as useAuthHook } from '@/hooks/auth/useAuth';
import type { IAuthContext, UseAuthProps } from '@/hooks/auth/types';

/**
 * @deprecated Import from "@/hooks/auth/useAuth" instead for better organization and type safety.
 */
export function useAuth(options: UseAuthProps = {}): IAuthContext {
  console.warn(
    '[Deprecation Warning] Importing from "useAuth.tsx" is deprecated. ' +
    'Please import from "@/hooks/auth/useAuth" instead for better organization and type safety.'
  );
  
  return useAuthHook(options);
}

export default useAuth;
