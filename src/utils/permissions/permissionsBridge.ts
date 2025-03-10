
import { User } from '@supabase/supabase-js';
import { ValidationError } from '../validation/ValidationError';

export type Permission = 
  | 'read:profile'
  | 'write:profile'
  | 'read:reflections'
  | 'write:reflections'
  | 'manage:chakras'
  | 'access:advanced_features';

export type PermissionCheck = (user: User | null) => boolean;

export class PermissionsBridge {
  private static permissionChecks: Map<Permission, PermissionCheck> = new Map();

  static registerPermissionCheck(
    permission: Permission,
    check: PermissionCheck
  ): void {
    this.permissionChecks.set(permission, check);
  }

  static checkPermission(
    user: User | null,
    permission: Permission
  ): boolean {
    const check = this.permissionChecks.get(permission);
    if (!check) {
      throw new ValidationError(`Unknown permission: ${permission}`, {
        field: 'permission',
        rule: 'permission-check'
      });
    }
    return check(user);
  }

  static requirePermission(
    user: User | null,
    permission: Permission
  ): void {
    if (!this.checkPermission(user, permission)) {
      throw new ValidationError(
        `User lacks required permission: ${permission}`,
        {
          field: 'permission',
          rule: 'permission-required',
          statusCode: 403
        }
      );
    }
  }
}

// Register default permission checks
PermissionsBridge.registerPermissionCheck(
  'read:profile',
  (user) => !!user
);

PermissionsBridge.registerPermissionCheck(
  'write:profile',
  (user) => !!user
);

export const checkPermission = PermissionsBridge.checkPermission.bind(PermissionsBridge);
export const requirePermission = PermissionsBridge.requirePermission.bind(PermissionsBridge);
