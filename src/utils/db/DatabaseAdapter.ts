
import { supabase } from '@/lib/supabaseClient';
import { ValidationError } from '@/utils/validation/ValidationError';
import { captureException } from '@/utils/errorHandling/errorReporter';
import { extractSupabaseData, unwrapSupabaseResult, handleSupabaseError } from '@/utils/supabase/typeUtils';

/**
 * Type-safe database adapter for consistent data access patterns
 * 
 * This adapter provides:
 * 1. Consistent error handling
 * 2. Type safety throughout the data layer 
 * 3. Validation of inputs and outputs
 * 4. Automatic error reporting
 */
export class DatabaseAdapter<T extends { id: string }> {
  private tableName: string;
  private entityName: string;
  
  constructor(tableName: string, entityName: string) {
    this.tableName = tableName;
    this.entityName = entityName;
  }
  
  /**
   * Safely fetch a record by ID with type validation
   */
  async getById(id: string): Promise<T> {
    try {
      if (!id) {
        throw new ValidationError(`${this.entityName} ID is required`, {
          field: 'id',
          rule: 'required'
        });
      }
      
      const result = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      return unwrapSupabaseResult<T>(result, this.entityName);
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'fetch', this.entityName);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
  
  /**
   * Safely fetch all records with type validation
   */
  async getAll(): Promise<T[]> {
    try {
      const result = await supabase
        .from(this.tableName)
        .select('*');
        
      return unwrapSupabaseResult<T[]>(result, `${this.entityName} list`);
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'fetch', `${this.entityName} list`);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
  
  /**
   * Safely create a new record with type validation
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const result = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
        
      return unwrapSupabaseResult<T>(result, this.entityName);
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'create', this.entityName);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
  
  /**
   * Safely update a record with type validation
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      if (!id) {
        throw new ValidationError(`${this.entityName} ID is required`, {
          field: 'id',
          rule: 'required'
        });
      }
      
      const result = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      return unwrapSupabaseResult<T>(result, this.entityName);
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'update', this.entityName);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
  
  /**
   * Safely delete a record
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new ValidationError(`${this.entityName} ID is required`, {
          field: 'id',
          rule: 'required'
        });
      }
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'delete', this.entityName);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
  
  /**
   * Safely query records with filters
   */
  async query(filters: Record<string, unknown>): Promise<T[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*');
        
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const result = await query;
      return unwrapSupabaseResult<T[]>(result, `${this.entityName} list`);
    } catch (error) {
      const enhancedError = handleSupabaseError(error, 'query', this.entityName);
      captureException(enhancedError);
      throw enhancedError;
    }
  }
}

export default DatabaseAdapter;
