
import { supabase } from '@/lib/supabaseClient';
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';
import { reportError } from '@/utils/errorHandling/errorReporter';
import { ValidationError } from '@/utils/validation/ValidationError';

/**
 * Processes a database response with proper error handling
 */
function processDbResponse<T>(
  response: PostgrestSingleResponse<T>, 
  entityName: string
): T {
  if (response.error) {
    throw new ValidationError(`Failed to fetch ${entityName}`, {
      field: entityName,
      details: response.error.message,
      originalError: response.error
    });
  }
  
  return response.data as T;
}

/**
 * Type-safe database adapter with consistent error handling
 */
export class DatabaseAdapter<T extends { id: string }> {
  private table: string;
  
  constructor(tableName: string) {
    this.table = tableName;
  }
  
  /**
   * Fetches a single entity by ID
   */
  async getById(id: string): Promise<T> {
    try {
      const response = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();
      
      return processDbResponse<T>(response, this.table);
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'getById', table: this.table, id }
      });
      throw error;
    }
  }
  
  /**
   * Fetches multiple entities with optional filtering
   */
  async getMany(filters?: Record<string, unknown>): Promise<T[]> {
    try {
      let query = supabase
        .from(this.table)
        .select('*');
      
      // Apply filters if provided
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
      }
      
      const response = await query;
      
      return processDbResponse<T[]>(response, `${this.table}[]`);
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'getMany', table: this.table, filters }
      });
      throw error;
    }
  }
  
  /**
   * Creates a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await supabase
        .from(this.table)
        .insert(data as any)
        .select()
        .single();
      
      return processDbResponse<T>(response, this.table);
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'create', table: this.table }
      });
      throw error;
    }
  }
  
  /**
   * Updates an existing entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await supabase
        .from(this.table)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();
      
      return processDbResponse<T>(response, this.table);
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'update', table: this.table, id }
      });
      throw error;
    }
  }
  
  /**
   * Deletes an entity by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new ValidationError(`Failed to delete ${this.table}`, {
          field: this.table,
          details: error.message,
          originalError: error
        });
      }
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'delete', table: this.table, id }
      });
      throw error;
    }
  }
  
  /**
   * Executes a custom query with proper error handling
   */
  async customQuery<R>(
    queryFn: (query: typeof supabase) => Promise<PostgrestSingleResponse<R>>
  ): Promise<R> {
    try {
      const response = await queryFn(supabase);
      
      return processDbResponse<R>(response, `${this.table} (custom)`);
    } catch (error) {
      reportError(error, { 
        source: 'api-error',
        metadata: { operation: 'customQuery', table: this.table }
      });
      throw error;
    }
  }
}

export default DatabaseAdapter;
