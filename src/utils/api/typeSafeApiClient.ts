
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { ValidationError } from '../validation/runtimeValidation';
import { toast } from 'sonner';

/**
 * Result type for API operations
 */
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  isError: boolean;
  status: number;
}

/**
 * Error handling options for API calls
 */
export interface ApiErrorHandlingOptions {
  /**
   * Whether to show toast notifications for errors
   */
  showToasts?: boolean;
  
  /**
   * Custom toast message for errors
   */
  errorMessage?: string;
  
  /**
   * Whether to retry the request on certain errors
   */
  retry?: boolean;
  
  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;
}

/**
 * Default error handling options
 */
const defaultErrorOptions: ApiErrorHandlingOptions = {
  showToasts: true,
  retry: false,
  maxRetries: 3
};

/**
 * Type-safe API client for Supabase operations
 */
export const typeSafeApi = {
  /**
   * Fetches data from a table with type safety
   * 
   * @param table - Table name
   * @param query - Query function for filtering, ordering, etc.
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async fetch<T>(
    table: string,
    query: (q: any) => any,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<T[]>> {
    const opts = { ...defaultErrorOptions, ...options };
    let retries = 0;
    
    const doFetch = async (): Promise<ApiResult<T[]>> => {
      try {
        const { data, error, status } = await query(supabase.from(table));
        
        if (error) {
          throw error;
        }
        
        return {
          data: data as T[],
          error: null,
          isError: false,
          status
        };
      } catch (error) {
        console.error(`API error fetching from ${table}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        const status = (error as PostgrestError)?.code ? 400 : 500;
        
        if (opts.showToasts) {
          const toastMessage = opts.errorMessage || `Error fetching data: ${errorMessage}`;
          toast.error(toastMessage);
        }
        
        // Determine if we should retry
        if (opts.retry && retries < (opts.maxRetries || 3)) {
          retries++;
          // Exponential backoff
          const delay = 300 * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          return doFetch();
        }
        
        return {
          data: null,
          error: errorMessage,
          isError: true,
          status
        };
      }
    };
    
    return doFetch();
  },
  
  /**
   * Fetches a single record by ID with type safety
   * 
   * @param table - Table name
   * @param id - Record ID
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async fetchById<T>(
    table: string,
    id: string,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<T>> {
    const result = await this.fetch<T>(
      table,
      (q) => q.select().eq('id', id).single(),
      options
    );
    
    return result;
  },
  
  /**
   * Fetches records by user ID with type safety
   * 
   * @param table - Table name
   * @param userId - User ID
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async fetchByUserId<T>(
    table: string,
    userId: string,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<T[]>> {
    return this.fetch<T>(
      table,
      (q) => q.select().eq('user_id', userId),
      options
    );
  },
  
  /**
   * Creates a new record with type safety and validation
   * 
   * @param table - Table name
   * @param data - Record data
   * @param validator - Optional validator function
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async create<T, U = T>(
    table: string,
    data: U,
    validator?: (data: U) => U,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<T>> {
    const opts = { ...defaultErrorOptions, ...options };
    
    try {
      let validatedData = data;
      
      // Apply validation if provided
      if (validator) {
        try {
          validatedData = validator(data);
        } catch (error) {
          if (error instanceof ValidationError) {
            if (opts.showToasts) {
              toast.error(error.message);
            }
            
            return {
              data: null,
              error: error.message,
              isError: true,
              status: error.statusCode || 400
            };
          }
          throw error;
        }
      }
      
      const { data: result, error, status } = await supabase
        .from(table)
        .insert(validatedData as any)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        data: result as T,
        error: null,
        isError: false,
        status
      };
    } catch (error) {
      console.error(`API error creating record in ${table}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = (error as PostgrestError)?.code ? 400 : 500;
      
      if (opts.showToasts) {
        const toastMessage = opts.errorMessage || `Error creating record: ${errorMessage}`;
        toast.error(toastMessage);
      }
      
      return {
        data: null,
        error: errorMessage,
        isError: true,
        status
      };
    }
  },
  
  /**
   * Updates a record with type safety and validation
   * 
   * @param table - Table name
   * @param id - Record ID
   * @param data - Update data
   * @param validator - Optional validator function
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async update<T, U = Partial<T>>(
    table: string,
    id: string,
    data: U,
    validator?: (data: U) => U,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<T>> {
    const opts = { ...defaultErrorOptions, ...options };
    
    try {
      let validatedData = data;
      
      // Apply validation if provided
      if (validator) {
        try {
          validatedData = validator(data);
        } catch (error) {
          if (error instanceof ValidationError) {
            if (opts.showToasts) {
              toast.error(error.message);
            }
            
            return {
              data: null,
              error: error.message,
              isError: true,
              status: error.statusCode || 400
            };
          }
          throw error;
        }
      }
      
      const { data: result, error, status } = await supabase
        .from(table)
        .update(validatedData as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        data: result as T,
        error: null,
        isError: false,
        status
      };
    } catch (error) {
      console.error(`API error updating record ${id} in ${table}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = (error as PostgrestError)?.code ? 400 : 500;
      
      if (opts.showToasts) {
        const toastMessage = opts.errorMessage || `Error updating record: ${errorMessage}`;
        toast.error(toastMessage);
      }
      
      return {
        data: null,
        error: errorMessage,
        isError: true,
        status
      };
    }
  },
  
  /**
   * Deletes a record with type safety
   * 
   * @param table - Table name
   * @param id - Record ID
   * @param options - Error handling options
   * @returns Promise with typed API result
   */
  async delete(
    table: string,
    id: string,
    options: ApiErrorHandlingOptions = {}
  ): Promise<ApiResult<null>> {
    const opts = { ...defaultErrorOptions, ...options };
    
    try {
      const { error, status } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return {
        data: null,
        error: null,
        isError: false,
        status
      };
    } catch (error) {
      console.error(`API error deleting record ${id} from ${table}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = (error as PostgrestError)?.code ? 400 : 500;
      
      if (opts.showToasts) {
        const toastMessage = opts.errorMessage || `Error deleting record: ${errorMessage}`;
        toast.error(toastMessage);
      }
      
      return {
        data: null,
        error: errorMessage,
        isError: true,
        status
      };
    }
  }
};
