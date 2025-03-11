
/**
 * API Client Type Definitions
 * 
 * Provides type-safe interfaces for API operations
 */

import { Result } from '../result/Result';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

/**
 * API error with categorization
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

/**
 * API client interface
 */
export interface ApiClient {
  get<T>(url: string, config?: ApiRequestConfig): Promise<Result<T, ApiError>>;
  post<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>>;
  put<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>>;
  patch<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<Result<T, ApiError>>;
}

/**
 * Resource service interface for type-safe CRUD operations
 */
export interface ResourceService<T, ID = string, CreateDTO = Omit<T, 'id'>, UpdateDTO = Partial<T>> {
  getAll(): Promise<Result<T[], ApiError>>;
  getById(id: ID): Promise<Result<T, ApiError>>;
  create(data: CreateDTO): Promise<Result<T, ApiError>>;
  update(id: ID, data: UpdateDTO): Promise<Result<T, ApiError>>;
  remove(id: ID): Promise<Result<void, ApiError>>;
}

/**
 * API error types for categorization
 */
export enum ApiErrorType {
  NETWORK = 'network_error',
  TIMEOUT = 'timeout_error',
  AUTH = 'authentication_error',
  VALIDATION = 'validation_error',
  SERVER = 'server_error',
  NOT_FOUND = 'not_found_error',
  UNKNOWN = 'unknown_error'
}

/**
 * Function to categorize errors based on status code and error message
 */
export function categorizeError(error: any): ApiError {
  if (!error) {
    return { message: 'Unknown error occurred', code: ApiErrorType.UNKNOWN };
  }
  
  // Network errors
  if (error.message === 'Network Error' || error.name === 'NetworkError') {
    return {
      message: 'Network connection error',
      code: ApiErrorType.NETWORK,
      details: { originalError: error }
    };
  }
  
  // Timeout errors
  if (error.message === 'timeout exceeded' || error.code === 'ECONNABORTED') {
    return {
      message: 'Request timed out',
      code: ApiErrorType.TIMEOUT,
      details: { originalError: error }
    };
  }
  
  // Server response with status code
  if (error.response) {
    const { status } = error.response;
    
    // Authentication errors
    if (status === 401 || status === 403) {
      return {
        message: status === 401 ? 'Authentication required' : 'Access forbidden',
        code: ApiErrorType.AUTH,
        status,
        details: { response: error.response.data }
      };
    }
    
    // Validation errors
    if (status === 400 || status === 422) {
      return {
        message: 'Validation error',
        code: ApiErrorType.VALIDATION,
        status,
        details: { response: error.response.data }
      };
    }
    
    // Not found
    if (status === 404) {
      return {
        message: 'Resource not found',
        code: ApiErrorType.NOT_FOUND,
        status,
        details: { response: error.response.data }
      };
    }
    
    // Server errors
    if (status >= 500) {
      return {
        message: 'Server error',
        code: ApiErrorType.SERVER,
        status,
        details: { response: error.response.data }
      };
    }
  }
  
  // Default unknown error
  return {
    message: error.message || 'Unknown error occurred',
    code: ApiErrorType.UNKNOWN,
    details: { originalError: error }
  };
}
