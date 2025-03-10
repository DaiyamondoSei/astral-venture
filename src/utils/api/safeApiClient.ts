
import { supabase } from '@/lib/supabaseClient';
import { ValidationError } from '../validation/runtimeValidation';
import { validateSchema, createApiValidator, ValidationResult } from '../validation/schemaValidator';
import { ErrorCategory, ErrorSeverity, handleError } from '../errorHandling';

/**
 * Error specific to API operations
 */
export class ApiError extends Error {
  /** HTTP status code */
  status?: number;
  /** Error category */
  category: ErrorCategory;
  /** Original response data */
  data?: unknown;
  /** Request metadata */
  request?: {
    /** API endpoint */
    endpoint: string;
    /** Request method */
    method: string;
    /** Request parameters */
    params?: Record<string, unknown>;
  };

  constructor(message: string, options: {
    status?: number;
    category?: ErrorCategory;
    data?: unknown;
    request?: {
      endpoint: string;
      method: string;
      params?: Record<string, unknown>;
    };
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.category = options.category || ErrorCategory.NETWORK;
    this.data = options.data;
    this.request = options.request;
  }
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions<T> {
  /** Validator for response data */
  validator?: (data: unknown) => ValidationResult<T>;
  /** Error handling options */
  errorHandling?: {
    /** Show a toast notification on error */
    showToast?: boolean;
    /** Custom error message */
    customMessage?: string;
    /** Error severity */
    severity?: ErrorSeverity;
  };
  /** Request metadata for logging/debugging */
  metadata?: Record<string, unknown>;
}

/**
 * Safe API client that adds validation and error handling
 */
export const safeApi = {
  /**
   * Safely fetch data from the database with validation
   * 
   * @param table - Table name
   * @param validator - Validator function for response data
   * @param options - Request options
   * @returns The validated data
   * @throws ApiError if request fails or validation fails
   * 
   * @example
   * const userValidator = createApiValidator({
   *   id: validateString,
   *   name: validateString,
   *   email: validateEmail
   * });
   * 
   * try {
   *   const users = await safeApi.get('users', userValidator);
   *   // users is typed correctly
   * } catch (error) {
   *   // Handle error
   * }
   */
  async get<T>(
    table: string, 
    validator?: (data: unknown) => ValidationResult<T>,
    options: ApiRequestOptions<T> = {}
  ): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        throw new ApiError(`Failed to fetch ${table}: ${error.message}`, {
          status: error.code === '23505' ? 409 : error.code === '23503' ? 404 : 500,
          category: ErrorCategory.DATA_PROCESSING,
          data: error,
          request: {
            endpoint: table,
            method: 'GET'
          }
        });
      }
      
      // Validate response if validator provided
      if (validator && data) {
        const result = validator(data);
        if (!result.success) {
          const validationErrors = result.errors?.map(e => e.message).join(', ') || 'Validation failed';
          throw new ApiError(`Invalid ${table} data: ${validationErrors}`, {
            category: ErrorCategory.VALIDATION,
            data,
            request: {
              endpoint: table,
              method: 'GET'
            }
          });
        }
        return result.data as T;
      }
      
      return data as T;
    } catch (error) {
      // Handle and rethrow errors
      const isApiError = error instanceof ApiError;
      const apiError = isApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        {
          category: ErrorCategory.UNEXPECTED,
          request: {
            endpoint: table,
            method: 'GET'
          }
        }
      );
      
      // Log and handle error
      handleError(apiError, {
        context: `API - Get ${table}`,
        category: apiError.category,
        severity: options.errorHandling?.severity || ErrorSeverity.ERROR,
        customMessage: options.errorHandling?.customMessage,
        showToast: options.errorHandling?.showToast ?? true,
        metadata: {
          ...options.metadata,
          table,
          operation: 'GET'
        }
      });
      
      throw apiError;
    }
  },
  
  /**
   * Safely insert data into the database with validation
   * 
   * @param table - Table name
   * @param data - Data to insert
   * @param validator - Validator function for response data
   * @param options - Request options
   * @returns The inserted data
   * @throws ApiError if request fails or validation fails
   */
  async insert<T>(
    table: string,
    data: Record<string, unknown>,
    validator?: (data: unknown) => ValidationResult<T>,
    options: ApiRequestOptions<T> = {}
  ): Promise<T> {
    try {
      const { data: responseData, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        throw new ApiError(`Failed to insert into ${table}: ${error.message}`, {
          status: error.code === '23505' ? 409 : error.code === '23503' ? 404 : 500,
          category: ErrorCategory.DATA_PROCESSING,
          data: error,
          request: {
            endpoint: table,
            method: 'POST',
            params: data
          }
        });
      }
      
      // Validate response if validator provided
      if (validator && responseData) {
        const result = validator(responseData);
        if (!result.success) {
          const validationErrors = result.errors?.map(e => e.message).join(', ') || 'Validation failed';
          throw new ApiError(`Invalid ${table} response: ${validationErrors}`, {
            category: ErrorCategory.VALIDATION,
            data: responseData,
            request: {
              endpoint: table,
              method: 'POST',
              params: data
            }
          });
        }
        return result.data as T;
      }
      
      return responseData as T;
    } catch (error) {
      // Handle and rethrow errors
      const isApiError = error instanceof ApiError;
      const apiError = isApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        {
          category: ErrorCategory.UNEXPECTED,
          request: {
            endpoint: table,
            method: 'POST',
            params: data
          }
        }
      );
      
      // Log and handle error
      handleError(apiError, {
        context: `API - Insert ${table}`,
        category: apiError.category,
        severity: options.errorHandling?.severity || ErrorSeverity.ERROR,
        customMessage: options.errorHandling?.customMessage,
        showToast: options.errorHandling?.showToast ?? true,
        metadata: {
          ...options.metadata,
          table,
          operation: 'INSERT',
          data
        }
      });
      
      throw apiError;
    }
  },
  
  /**
   * Safely update data in the database with validation
   * 
   * @param table - Table name
   * @param query - Query parameters (e.g., { id: 'xyz' })
   * @param data - Data to update
   * @param validator - Validator function for response data
   * @param options - Request options
   * @returns The updated data
   * @throws ApiError if request fails or validation fails
   */
  async update<T>(
    table: string,
    query: Record<string, unknown>,
    data: Record<string, unknown>,
    validator?: (data: unknown) => ValidationResult<T>,
    options: ApiRequestOptions<T> = {}
  ): Promise<T> {
    try {
      let queryBuilder = supabase
        .from(table)
        .update(data);
      
      // Apply all query constraints
      for (const [key, value] of Object.entries(query)) {
        queryBuilder = queryBuilder.eq(key, value);
      }
      
      const { data: responseData, error } = await queryBuilder.select();
      
      if (error) {
        throw new ApiError(`Failed to update ${table}: ${error.message}`, {
          status: error.code === '23505' ? 409 : error.code === '23503' ? 404 : 500,
          category: ErrorCategory.DATA_PROCESSING,
          data: error,
          request: {
            endpoint: table,
            method: 'PATCH',
            params: { query, data }
          }
        });
      }
      
      // Validate response if validator provided
      if (validator && responseData) {
        const result = validator(responseData);
        if (!result.success) {
          const validationErrors = result.errors?.map(e => e.message).join(', ') || 'Validation failed';
          throw new ApiError(`Invalid ${table} response: ${validationErrors}`, {
            category: ErrorCategory.VALIDATION,
            data: responseData,
            request: {
              endpoint: table,
              method: 'PATCH',
              params: { query, data }
            }
          });
        }
        return result.data as T;
      }
      
      return responseData as T;
    } catch (error) {
      // Handle and rethrow errors
      const isApiError = error instanceof ApiError;
      const apiError = isApiError ? error : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        {
          category: ErrorCategory.UNEXPECTED,
          request: {
            endpoint: table,
            method: 'PATCH',
            params: { query, data }
          }
        }
      );
      
      // Log and handle error
      handleError(apiError, {
        context: `API - Update ${table}`,
        category: apiError.category,
        severity: options.errorHandling?.severity || ErrorSeverity.ERROR,
        customMessage: options.errorHandling?.customMessage,
        showToast: options.errorHandling?.showToast ?? true,
        metadata: {
          ...options.metadata,
          table,
          operation: 'UPDATE',
          query,
          data
        }
      });
      
      throw apiError;
    }
  }
};

/**
 * Create a type-safe validator for API responses
 * 
 * @param validators - Schema of validators for the response shape
 * @returns A validator function for the given schema
 * 
 * @example
 * const userValidator = createResponseValidator({
 *   id: validateString,
 *   name: validateString,
 *   email: validateEmail,
 *   age: optional((v) => validateMin(validateNumber(v, 'age'), 0, 'age'))
 * });
 * 
 * const users = await safeApi.get('users', userValidator);
 * // users is now properly typed
 */
export function createResponseValidator<T extends Record<string, unknown>>(
  validators: Record<keyof T, (value: unknown, name: string) => unknown>
) {
  return createApiValidator<T>(validators);
}
