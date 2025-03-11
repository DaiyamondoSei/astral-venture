
/**
 * Type-safe API client for handling API requests with consistent error handling
 */

import { Result, success, failure } from '../utils/result/Result';
import { AsyncResult } from '../utils/result/AsyncResult';
import { ValidationError } from '../utils/validation/ValidationError';

/**
 * API error types for better error categorization
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  SERVER_ERROR = 'server_error',
  NOT_FOUND_ERROR = 'not_found_error',
  TIMEOUT_ERROR = 'timeout_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * API error with enhanced properties and type information
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly status?: number;
  public readonly data?: unknown;
  public readonly validationErrors?: ValidationError;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN_ERROR,
    status?: number,
    data?: unknown,
    validationErrors?: ValidationError
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.data = data;
    this.validationErrors = validationErrors;
    this.isOperational = true; // Errors we expect and can handle

    // For proper instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Factory method to create ApiError from response
   */
  static fromResponse(response: Response, data?: any): ApiError {
    const status = response.status;
    const message = data?.message || response.statusText || 'API error';
    
    let type = ApiErrorType.UNKNOWN_ERROR;
    
    // Determine error type based on status code
    if (status >= 500) {
      type = ApiErrorType.SERVER_ERROR;
    } else if (status === 404) {
      type = ApiErrorType.NOT_FOUND_ERROR;
    } else if (status === 401) {
      type = ApiErrorType.AUTHENTICATION_ERROR;
    } else if (status === 403) {
      type = ApiErrorType.AUTHORIZATION_ERROR;
    } else if (status === 422 || status === 400) {
      type = ApiErrorType.VALIDATION_ERROR;
    } else if (status === 429) {
      type = ApiErrorType.RATE_LIMIT_ERROR;
    }
    
    // Create validation error if applicable
    let validationError: ValidationError | undefined;
    if (type === ApiErrorType.VALIDATION_ERROR && data?.errors) {
      validationError = ValidationError.fromApiError(data, message, status);
    }
    
    return new ApiError(message, type, status, data, validationError);
  }

  /**
   * Factory method to create a network error
   */
  static networkError(error: Error): ApiError {
    return new ApiError(
      `Network error: ${error.message}`,
      ApiErrorType.NETWORK_ERROR,
      undefined,
      { originalError: error }
    );
  }

  /**
   * Factory method to create a timeout error
   */
  static timeoutError(timeoutMs: number): ApiError {
    return new ApiError(
      `Request timed out after ${timeoutMs}ms`,
      ApiErrorType.TIMEOUT_ERROR
    );
  }
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  signal?: AbortSignal;
}

/**
 * Default configuration for requests
 */
const defaultConfig: RequestConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  cache: 'default',
  credentials: 'same-origin',
  mode: 'cors'
};

/**
 * API client for making type-safe API requests
 */
export class ApiClient {
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  constructor(baseUrl: string, config: RequestConfig = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultConfig = { ...defaultConfig, ...config };
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, config: RequestConfig = {}): AsyncResult<T, ApiError> {
    return this.request<T>('GET', path, undefined, config);
  }

  /**
   * Make a POST request
   */
  async post<T, D = any>(path: string, data?: D, config: RequestConfig = {}): AsyncResult<T, ApiError> {
    return this.request<T>('POST', path, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T, D = any>(path: string, data?: D, config: RequestConfig = {}): AsyncResult<T, ApiError> {
    return this.request<T>('PUT', path, data, config);
  }

  /**
   * Make a PATCH request
   */
  async patch<T, D = any>(path: string, data?: D, config: RequestConfig = {}): AsyncResult<T, ApiError> {
    return this.request<T>('PATCH', path, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, config: RequestConfig = {}): AsyncResult<T, ApiError> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  /**
   * Make a request with the specified method
   */
  private async request<T>(
    method: string,
    path: string,
    data?: any,
    config: RequestConfig = {}
  ): AsyncResult<T, ApiError> {
    try {
      const mergedConfig = this.mergeConfig(config);
      const url = this.resolveUrl(path);
      
      // Create abort controller for timeout if needed
      let abortController: AbortController | undefined;
      if (mergedConfig.timeout && !mergedConfig.signal) {
        abortController = new AbortController();
        mergedConfig.signal = abortController.signal;
        
        setTimeout(() => {
          abortController?.abort();
        }, mergedConfig.timeout);
      }
      
      // Create request init object
      const requestInit: RequestInit = {
        method,
        headers: mergedConfig.headers,
        cache: mergedConfig.cache,
        credentials: mergedConfig.credentials,
        mode: mergedConfig.mode,
        signal: mergedConfig.signal,
        body: data ? JSON.stringify(data) : undefined
      };
      
      // Make the request
      const response = await fetch(url, requestInit);
      
      // Handle successful response
      if (response.ok) {
        // Handle no content responses
        if (response.status === 204) {
          return success({} as T);
        }
        
        // Parse response as JSON
        const responseData = await response.json();
        return success(responseData as T);
      }
      
      // Handle error response
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      const apiError = ApiError.fromResponse(response, errorData);
      return failure(apiError);
    } catch (error) {
      // Handle network errors or aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        return failure(ApiError.timeoutError(config.timeout || defaultConfig.timeout || 30000));
      }
      
      return failure(ApiError.networkError(error instanceof Error ? error : new Error(String(error))));
    }
  }

  /**
   * Merge request config with defaults
   */
  private mergeConfig(config: RequestConfig): RequestConfig {
    return {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers
      }
    };
  }

  /**
   * Resolve URL from path
   */
  private resolveUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }
}

export default ApiClient;
