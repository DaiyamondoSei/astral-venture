
/**
 * Type-safe API Response Types
 * 
 * Standardized types for API responses that preserve type information
 * throughout the application data flow.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
  metadata?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiSuccessResponse<T> {
  type: 'success';
  data: T;
  status: number;
  metadata?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  type: 'error';
  error: ApiError;
  status: number;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a success API response
 */
export function createSuccessResponse<T>(
  data: T,
  status = 200,
  metadata?: Record<string, unknown>
): ApiSuccessResponse<T> {
  return {
    type: 'success',
    data,
    status,
    metadata
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
  metadata?: Record<string, unknown>
): ApiErrorResponse {
  return {
    type: 'error',
    error: {
      code,
      message,
      details
    },
    status,
    metadata
  };
}

/**
 * Type guard for checking if an API response is successful
 */
export function isApiSuccess<T>(response: ApiResult<T>): response is ApiSuccessResponse<T> {
  return response.type === 'success';
}

/**
 * Type guard for checking if an API response is an error
 */
export function isApiError<T>(response: ApiResult<T>): response is ApiErrorResponse {
  return response.type === 'error';
}

/**
 * Converts a standard response to a result
 */
export function toApiResult<T>(response: ApiResponse<T>): ApiResult<T> {
  if (response.error !== null) {
    return {
      type: 'error',
      error: response.error,
      status: response.status,
      metadata: response.metadata
    };
  }
  
  // Type assertion is safe here because we've checked for error
  return {
    type: 'success',
    data: response.data as T,
    status: response.status,
    metadata: response.metadata
  };
}
