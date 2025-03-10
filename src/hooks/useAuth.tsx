
import { useAuth as useAuthHook } from '@/hooks/auth/useAuth';
import type { IAuthContext } from '@/hooks/auth/types';

/**
 * @deprecated Import from "@/hooks/auth" instead for better organization and type safety.
 */
export function useAuth(): IAuthContext {
  console.warn(
    '[Deprecation Warning] Importing from "useAuth.tsx" is deprecated. ' +
    'Please import from "@/hooks/auth" instead for better organization and type safety.'
  );
  
  return useAuthHook();
}

export default useAuth;
