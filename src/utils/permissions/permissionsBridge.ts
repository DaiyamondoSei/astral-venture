
/**
 * Permissions Bridge
 * 
 * Provides consistent permission and authorization checking across different environments.
 * This bridge ensures that permission checks are handled the same way in:
 * - Frontend components
 * - Edge functions
 * - Workers
 */

import { User } from '@supabase/supabase-js';
import { handleError } from '../errorPrevention/errorBridge';

/**
 * Permission levels in the application
 */
export type PermissionLevel = 'public' | 'authenticated' | 'owner' | 'admin';

/**
 * Resource types that can have permissions applied to them
 */
export type ResourceType = 
  | 'profile'
  | 'reflection'
  | 'practice'
  | 'achievement'
  | 'chakra'
  | 'dream'
  | 'challenge'
  | 'personalization';

/**
 * Permission check result with metadata
 */
export interface PermissionCheckResult {
  granted: boolean;
  resource: {
    type: ResourceType;
    id?: string;
  };
  user?: {
    id: string;
    role?: string;
  };
  reason?: string;
}

/**
 * Check if a user has permission to access a resource
 */
export function checkPermission(
  user: User | null,
  resourceType: ResourceType,
  resourceOwnerId: string | null,
  requiredLevel: PermissionLevel = 'authenticated'
): PermissionCheckResult {
  // Handle public resources
  if (requiredLevel === 'public') {
    return {
      granted: true,
      resource: { type: resourceType }
    };
  }
  
  // Check authentication
  if (!user) {
    return {
      granted: false,
      resource: { type: resourceType },
      reason: 'User not authenticated'
    };
  }
  
  // Base result for an authenticated user
  const result: PermissionCheckResult = {
    granted: requiredLevel === 'authenticated',
    resource: { type: resourceType },
    user: {
      id: user.id,
      role: user.app_metadata?.role
    }
  };
  
  // Handle owner-level permissions
  if (requiredLevel === 'owner') {
    if (!resourceOwnerId) {
      result.granted = false;
      result.reason = 'Resource has no owner ID';
      return result;
    }
    
    result.granted = user.id === resourceOwnerId;
    if (!result.granted) {
      result.reason = 'User is not the resource owner';
    }
    return result;
  }
  
  // Handle admin-level permissions
  if (requiredLevel === 'admin') {
    const isAdmin = user.app_metadata?.role === 'admin';
    result.granted = isAdmin;
    if (!result.granted) {
      result.reason = 'User does not have admin role';
    }
    return result;
  }
  
  return result;
}

/**
 * Enforce permission check and throw error if not granted
 */
export function enforcePermission(
  user: User | null,
  resourceType: ResourceType,
  resourceOwnerId: string | null,
  requiredLevel: PermissionLevel = 'authenticated'
): PermissionCheckResult {
  const result = checkPermission(user, resourceType, resourceOwnerId, requiredLevel);
  
  if (!result.granted) {
    const error = new Error(
      `Permission denied: ${result.reason || 'Unknown reason'}`
    );
    handleError(error, 'frontend', {
      showToUser: true,
      rethrow: true
    });
  }
  
  return result;
}

/**
 * Check if current user can modify a resource
 */
export function canModifyResource(
  user: User | null,
  resourceType: ResourceType,
  resourceOwnerId: string | null
): boolean {
  // Admins can modify any resource
  if (user?.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Users can only modify their own resources
  return !!user && !!resourceOwnerId && user.id === resourceOwnerId;
}

export default {
  checkPermission,
  enforcePermission,
  canModifyResource
};
