
import { ValidationError } from './runtimeValidation';
import { createSchemaValidator } from './schemaValidator';
import { validateObject, validateString, validateArray } from './runtimeValidation';

/**
 * Interface for API request validation
 */
export interface APIRequestValidation<T> {
  /** Validate API request parameters */
  validateRequest: (data: unknown) => T;
  /** Create validation errors for invalid requests */
  createValidationError: (message: string, details?: unknown) => ValidationError;
}

/**
 * Create a validator for API requests
 * 
 * @param endpointName - Name of the API endpoint
 * @param validator - Validation function for the request
 * @returns API request validation object
 */
export function createAPIRequestValidator<T>(
  endpointName: string,
  validator: (data: unknown) => T
): APIRequestValidation<T> {
  const schemaValidator = createSchemaValidator(validator, endpointName);
  
  return {
    validateRequest: (data: unknown): T => {
      try {
        return schemaValidator.parse(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        throw new ValidationError(`Invalid request parameters for ${endpointName}`, {
          code: 'API_VALIDATION_ERROR',
          details: { endpoint: endpointName, error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    },
    
    createValidationError: (message: string, details?: unknown): ValidationError => {
      return new ValidationError(message, {
        code: 'API_VALIDATION_ERROR',
        details: { endpoint: endpointName, ...details }
      });
    }
  };
}

/**
 * Validate pagination parameters
 * 
 * @param params - Pagination parameters
 * @returns Validated pagination parameters
 */
export function validatePaginationParams(params: unknown): { page: number; limit: number } {
  const obj = validateObject(params, 'paginationParams');
  
  let page = 1;
  if ('page' in obj) {
    const pageParam = Number(obj.page);
    if (!isNaN(pageParam) && pageParam > 0) {
      page = pageParam;
    }
  }
  
  let limit = 10;
  if ('limit' in obj) {
    const limitParam = Number(obj.limit);
    if (!isNaN(limitParam) && limitParam > 0 && limitParam <= 100) {
      limit = limitParam;
    }
  }
  
  return { page, limit };
}

/**
 * Validate sorting parameters
 * 
 * @param params - Sorting parameters
 * @param allowedFields - Allowed fields to sort by
 * @returns Validated sorting parameters
 */
export function validateSortingParams(
  params: unknown,
  allowedFields: string[]
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const obj = validateObject(params, 'sortingParams');
  
  let sortBy = allowedFields[0];
  if ('sortBy' in obj && typeof obj.sortBy === 'string') {
    if (allowedFields.includes(obj.sortBy)) {
      sortBy = obj.sortBy;
    } else {
      throw new ValidationError(`Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`, {
        code: 'INVALID_SORT_FIELD',
        details: { provided: obj.sortBy, allowed: allowedFields }
      });
    }
  }
  
  let sortOrder: 'asc' | 'desc' = 'desc';
  if ('sortOrder' in obj && typeof obj.sortOrder === 'string') {
    if (obj.sortOrder === 'asc' || obj.sortOrder === 'desc') {
      sortOrder = obj.sortOrder;
    } else {
      throw new ValidationError('Sort order must be either "asc" or "desc"', {
        code: 'INVALID_SORT_ORDER',
        details: { provided: obj.sortOrder }
      });
    }
  }
  
  return { sortBy, sortOrder };
}

/**
 * Validate filtering parameters
 * 
 * @param params - Filtering parameters
 * @param allowedFilters - Configuration of allowed filters
 * @returns Validated filter object
 */
export function validateFilterParams(
  params: unknown,
  allowedFilters: Record<string, { type: 'string' | 'number' | 'boolean' | 'array' }>
): Record<string, unknown> {
  const obj = validateObject(params, 'filterParams');
  const filters: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key in allowedFilters) {
      const filterConfig = allowedFilters[key];
      
      switch (filterConfig.type) {
        case 'string':
          filters[key] = validateString(value, key);
          break;
        case 'number':
          if (typeof value === 'string') {
            const num = Number(value);
            if (isNaN(num)) {
              throw new ValidationError(`Filter ${key} must be a number`, {
                code: 'INVALID_FILTER_VALUE',
                details: { filter: key, value }
              });
            }
            filters[key] = num;
          } else if (typeof value === 'number') {
            filters[key] = value;
          } else {
            throw new ValidationError(`Filter ${key} must be a number`, {
              code: 'INVALID_FILTER_VALUE',
              details: { filter: key, value }
            });
          }
          break;
        case 'boolean':
          if (typeof value === 'string') {
            if (value === 'true') filters[key] = true;
            else if (value === 'false') filters[key] = false;
            else {
              throw new ValidationError(`Filter ${key} must be a boolean`, {
                code: 'INVALID_FILTER_VALUE',
                details: { filter: key, value }
              });
            }
          } else if (typeof value === 'boolean') {
            filters[key] = value;
          } else {
            throw new ValidationError(`Filter ${key} must be a boolean`, {
              code: 'INVALID_FILTER_VALUE',
              details: { filter: key, value }
            });
          }
          break;
        case 'array':
          if (typeof value === 'string') {
            filters[key] = value.split(',').map(item => item.trim());
          } else if (Array.isArray(value)) {
            filters[key] = validateArray(value, key);
          } else {
            throw new ValidationError(`Filter ${key} must be an array or comma-separated string`, {
              code: 'INVALID_FILTER_VALUE',
              details: { filter: key, value }
            });
          }
          break;
      }
    }
  }
  
  return filters;
}
