
import { supabase } from '@/lib/supabaseUnified';
import { TableName, Row, Insert, Update, Tables } from '@/types/database';

/**
 * Type-safe wrapper for database operations
 */
export class DatabaseUtils {
  /**
   * Type-safe select operation
   * @param table The table to select from
   * @returns A builder for the select operation
   */
  static select<T extends TableName>(table: T) {
    return supabase.from(table).select() as any;
  }

  /**
   * Type-safe insert operation
   * @param table The table to insert into
   * @param data The data to insert
   * @returns A builder for the insert operation
   */
  static insert<T extends TableName>(table: T, data: Insert<T> | Insert<T>[]) {
    return supabase.from(table).insert(data as any);
  }

  /**
   * Type-safe update operation
   * @param table The table to update
   * @param data The data to update
   * @returns A builder for the update operation
   */
  static update<T extends TableName>(table: T, data: Update<T>) {
    return supabase.from(table).update(data as any);
  }

  /**
   * Type-safe delete operation
   * @param table The table to delete from
   * @returns A builder for the delete operation
   */
  static delete<T extends TableName>(table: T) {
    return supabase.from(table).delete();
  }

  /**
   * Type-safe RPC function call
   * @param fn The function to call
   * @param params The parameters to pass to the function
   * @returns A promise with the result of the function call
   */
  static rpc<T = any>(fn: 'increment_points' | 'get_total_points' | 'get_auth_user_id', params?: any) {
    return supabase.rpc(fn, params) as Promise<{ data: T; error: any }>;
  }
}

// Export utility functions for common operations
export const selectFrom = DatabaseUtils.select;
export const insertInto = DatabaseUtils.insert;
export const updateIn = DatabaseUtils.update;
export const deleteFrom = DatabaseUtils.delete;
export const callRPC = DatabaseUtils.rpc;
