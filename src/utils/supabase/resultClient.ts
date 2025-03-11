
import { 
  PostgrestError, 
  SupabaseClient 
} from '@supabase/supabase-js';
import { 
  Result, 
  success, 
  failure, 
  fromPromise 
} from '../result/Result';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string | null,
    public readonly details: string | null,
    public readonly hint: string | null
  ) {
    super(message);
    this.name = 'SupabaseError';
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, SupabaseError.prototype);
  }
}

/**
 * Create a new SupabaseError from a PostgrestError
 */
export function createSupabaseError(pgError: PostgrestError): SupabaseError {
  return new SupabaseError(
    pgError.message,
    pgError.code,
    pgError.details,
    pgError.hint
  );
}

/**
 * Type-safe wrapper around Supabase client
 */
export const resultClient = {
  /**
   * Perform a select query with Result error handling
   */
  async select<T = any>(
    tableName: string,
    columns: string = '*',
    queryBuilder?: (query: any) => any
  ): Promise<Result<T[], SupabaseError>> {
    try {
      let query = supabase.from(tableName).select(columns);
      
      if (queryBuilder) {
        query = queryBuilder(query);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(data as T[]);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  },
  
  /**
   * Get a single record with Result error handling
   */
  async getById<T = any>(
    tableName: string,
    id: string,
    columns: string = '*'
  ): Promise<Result<T | null, SupabaseError>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(columns)
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(data as T);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  },
  
  /**
   * Insert a record with Result error handling
   */
  async insert<T = any>(
    tableName: string,
    data: Record<string, any>
  ): Promise<Result<T, SupabaseError>> {
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(insertedData as T);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  },
  
  /**
   * Update a record with Result error handling
   */
  async update<T = any>(
    tableName: string,
    id: string,
    data: Record<string, any>
  ): Promise<Result<T, SupabaseError>> {
    try {
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(updatedData as T);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  },
  
  /**
   * Delete a record with Result error handling
   */
  async delete(
    tableName: string,
    id: string
  ): Promise<Result<void, SupabaseError>> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(undefined);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  },
  
  /**
   * Run an RPC function with Result error handling
   */
  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<Result<T, SupabaseError>> {
    try {
      const { data, error } = await supabase.rpc(functionName, params);
      
      if (error) {
        return failure(createSupabaseError(error));
      }
      
      return success(data as T);
    } catch (error) {
      return failure(new SupabaseError(
        error instanceof Error ? error.message : String(error),
        null,
        null,
        null
      ));
    }
  }
};

export default resultClient;
