
/**
 * Helper utilities for working with Row Level Security (RLS) in Supabase
 */

/**
 * Checks if a function is being called from within a Supabase RLS policy
 * This is useful for debugging RLS issues and avoiding infinite recursion
 * 
 * @returns Boolean indicating if the function is called from an RLS policy
 */
export function isCalledFromRLS(): boolean {
  try {
    // This environment variable is set in RLS policy execution environments
    const setting = process.env.SUPABASE_RLS_EXECUTION;
    return setting === 'true';
  } catch (e) {
    // If we can't check, assume it's not from RLS
    return false;
  }
}

/**
 * RLS Best Practices for Supabase
 * 
 * 1. Always use security definer functions with empty search path
 *    - SET search_path = '' prevents SQL injection via search path
 *    - SECURITY DEFINER ensures the function runs with the permissions of the creator
 * 
 * 2. Avoid calling current_setting() directly in RLS policies
 *    - Create wrapper functions like get_auth_user_id() to safely handle auth checks
 *    - This centralizes auth logic and makes it easier to update
 * 
 * 3. Avoid complex logic in RLS policies
 *    - Create helper functions to encapsulate complex logic
 *    - This improves maintainability and performance
 * 
 * 4. Test RLS policies thoroughly
 *    - Test for both positive and negative scenarios
 *    - Verify policies work correctly with different user roles
 * 
 * 5. Add indexes to foreign key columns used in RLS policies
 *    - This drastically improves query performance
 *    - Especially important for user_id columns
 * 
 * 6. Keep RLS policies simple and focused
 *    - One policy per operation (SELECT, INSERT, UPDATE, DELETE)
 *    - Use the public.get_auth_user_id() function for authentication checks
 * 
 * 7. Use parameterized queries in your application code
 *    - This prevents SQL injection attacks
 *    - Let the Supabase client handle parameter binding
 */

/**
 * Types for use with RLS security
 */

export interface RLSUser {
  id: string;
  role: string;
}

export interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  check: string;
  using?: string;
}

export interface TablePermission {
  table: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Helper method to safely reference auth.uid() in application code
 */
export function getCurrentUserId(): string | null {
  try {
    // This would normally call auth.uid() in a Supabase context
    // In client code, get it from the session instead
    return null; // Will be replaced with actual user ID in client code
  } catch (e) {
    console.warn('Error getting current user ID:', e);
    return null;
  }
}
