
import { 
  Result, 
  success, 
  failure, 
  fromPromise, 
  mapError 
} from '../result/Result';
import { ValidationError } from '../validation/validator';
import { supabase } from '../../integrations/supabase/client';

export interface ResourceService<T, TCreate = Omit<T, 'id'>, TUpdate = Partial<T>> {
  getAll: () => Promise<Result<T[], Error>>;
  getById: (id: string) => Promise<Result<T, Error>>;
  create: (data: TCreate) => Promise<Result<T, Error>>;
  update: (id: string, data: TUpdate) => Promise<Result<T, Error>>;
  remove: (id: string) => Promise<Result<void, Error>>;
}

export class ApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(resourceType: string, id: string | number) {
    super(`${resourceType} with ID ${id} not found`);
    this.name = 'NotFoundError';
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, public readonly operation: string, cause?: unknown) {
    super(`Database error during ${operation}: ${message}`, cause);
    this.name = 'DatabaseError';
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Type guard to check if an error is a NotFoundError
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Type guard to check if an error is a DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Create a type-safe service for interacting with a Supabase resource
 */
export function createResourceService<T extends { id: string }, TCreate = Omit<T, 'id'>, TUpdate = Partial<T>>(
  tableName: string,
  resourceName: string
): ResourceService<T, TCreate, TUpdate> {
  
  return {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) {
          return failure(new DatabaseError(error.message, 'select', error));
        }
        
        return success(data as T[]);
      } catch (error) {
        return failure(new ApiError(`Failed to fetch ${resourceName} list`, error));
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (error) {
          return failure(new DatabaseError(error.message, 'select', error));
        }
        
        if (!data) {
          return failure(new NotFoundError(resourceName, id));
        }
        
        return success(data as T);
      } catch (error) {
        return failure(new ApiError(`Failed to fetch ${resourceName}`, error));
      }
    },
    
    create: async (data: TCreate) => {
      try {
        const { data: newItem, error } = await supabase
          .from(tableName)
          .insert(data)
          .select()
          .single();
          
        if (error) {
          return failure(new DatabaseError(error.message, 'insert', error));
        }
        
        return success(newItem as T);
      } catch (error) {
        return failure(new ApiError(`Failed to create ${resourceName}`, error));
      }
    },
    
    update: async (id: string, data: TUpdate) => {
      try {
        const { data: updatedItem, error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          return failure(new DatabaseError(error.message, 'update', error));
        }
        
        if (!updatedItem) {
          return failure(new NotFoundError(resourceName, id));
        }
        
        return success(updatedItem as T);
      } catch (error) {
        return failure(new ApiError(`Failed to update ${resourceName}`, error));
      }
    },
    
    remove: async (id: string) => {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
          
        if (error) {
          return failure(new DatabaseError(error.message, 'delete', error));
        }
        
        return success(undefined);
      } catch (error) {
        return failure(new ApiError(`Failed to delete ${resourceName}`, error));
      }
    }
  };
}
