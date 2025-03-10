
/**
 * Type-safe Supabase client wrapper
 * 
 * This provides consistent, type-safe access to Supabase across different parts of the application.
 * It ensures we have a centralized place to manage authentication, error handling, and type safety.
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { handleError } from '../errorPrevention/errorBridge';

/**
 * Type-safe query result with consistent error handling
 */
export interface TypedQueryResult<T> {
  data: T | null;
  error: any | null;
  status: 'success' | 'error';
}

/**
 * Type-safe wrapper for Supabase tables
 */
class TypeSafeTable<T> {
  private tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Perform a type-safe select query
   */
  async select<R = T>(options?: {
    columns?: string;
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }): Promise<TypedQueryResult<R>> {
    try {
      let query = supabase.from(this.tableName).select(options?.columns || '*');
      
      // Apply filters
      if (options?.match) {
        Object.entries(options.match).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }
      
      // Apply ordering
      if (options?.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      // Get single or multiple results
      const { data, error } = options?.single 
        ? await query.maybeSingle() 
        : await query;
      
      return {
        data: data as R | null,
        error,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      const standardError = handleError(error, 'frontend');
      return {
        data: null,
        error: standardError,
        status: 'error'
      };
    }
  }
  
  /**
   * Insert data into a table with type safety
   */
  async insert<R = T>(
    data: Partial<T> | Partial<T>[],
    options?: { returning?: boolean | string }
  ): Promise<TypedQueryResult<R>> {
    try {
      const query = supabase.from(this.tableName).insert(data);
      
      const { data: result, error } = options?.returning
        ? await query.select(options.returning === true ? '*' : options.returning)
        : await query;
      
      return {
        data: result as R | null,
        error,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      const standardError = handleError(error, 'frontend');
      return {
        data: null,
        error: standardError,
        status: 'error'
      };
    }
  }
  
  /**
   * Update data in a table with type safety
   */
  async update<R = T>(
    data: Partial<T>,
    match: Record<string, any>,
    options?: { returning?: boolean | string }
  ): Promise<TypedQueryResult<R>> {
    try {
      let query = supabase.from(this.tableName).update(data);
      
      // Apply match conditions
      Object.entries(match).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });
      
      const { data: result, error } = options?.returning
        ? await query.select(options.returning === true ? '*' : options.returning)
        : await query;
      
      return {
        data: result as R | null,
        error,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      const standardError = handleError(error, 'frontend');
      return {
        data: null,
        error: standardError,
        status: 'error'
      };
    }
  }
  
  /**
   * Delete data from a table with type safety
   */
  async delete<R = T>(
    match: Record<string, any>,
    options?: { returning?: boolean | string }
  ): Promise<TypedQueryResult<R>> {
    try {
      let query = supabase.from(this.tableName).delete();
      
      // Apply match conditions
      Object.entries(match).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });
      
      const { data: result, error } = options?.returning
        ? await query.select(options.returning === true ? '*' : options.returning)
        : await query;
      
      return {
        data: result as R | null,
        error,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      const standardError = handleError(error, 'frontend');
      return {
        data: null,
        error: standardError,
        status: 'error'
      };
    }
  }
}

/**
 * Enhanced Supabase client with better type safety and error handling
 */
class TypeSafeSupabaseClient {
  /**
   * Get a type-safe table instance
   */
  table<T = any>(tableName: keyof Database['public']['Tables'] | string): TypeSafeTable<T> {
    return new TypeSafeTable<T>(tableName as string);
  }
  
  /**
   * Access the auth API with better error handling
   */
  get auth() {
    return {
      ...supabase.auth,
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        try {
          return await supabase.auth.signInWithPassword(credentials);
        } catch (error) {
          handleError(error, 'frontend');
          throw error;
        }
      },
      signUp: async (credentials: { email: string; password: string }) => {
        try {
          return await supabase.auth.signUp(credentials);
        } catch (error) {
          handleError(error, 'frontend');
          throw error;
        }
      }
    };
  }
  
  /**
   * Access the storage API with better error handling
   */
  get storage() {
    return supabase.storage;
  }
  
  /**
   * Access the functions API with better error handling
   */
  get functions() {
    return {
      ...supabase.functions,
      invoke: async <T = any>(
        functionName: string,
        options?: {
          body?: Record<string, any>;
          headers?: Record<string, string>;
        }
      ): Promise<TypedQueryResult<T>> => {
        try {
          const { data, error } = await supabase.functions.invoke(functionName, options);
          return {
            data: data as T,
            error,
            status: error ? 'error' : 'success'
          };
        } catch (error) {
          const standardError = handleError(error, 'frontend');
          return {
            data: null,
            error: standardError,
            status: 'error'
          };
        }
      }
    };
  }
}

// Create and export a singleton instance
export const typeSafeSupabase = new TypeSafeSupabaseClient();

export default typeSafeSupabase;
