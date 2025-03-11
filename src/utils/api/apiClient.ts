
/**
 * Type-safe API client
 * 
 * Provides standardized API access with consistent error handling,
 * leveraging the Result pattern for type-safe error management.
 */

import { Result, success, failure } from '../result/Result';
import { fromPromise } from '../result/AsyncResult';
import { ApiClient, ApiRequestConfig, ApiError, categorizeError } from './types';

/**
 * Create a type-safe API client
 * 
 * @param baseUrl - The base URL for API requests
 * @param defaultConfig - Default configuration for all requests
 * @returns A type-safe API client instance
 */
export function createApiClient(
  baseUrl: string,
  defaultConfig: ApiRequestConfig = {}
): ApiClient {
  const combinedConfig = (config: ApiRequestConfig = {}): ApiRequestConfig => ({
    ...defaultConfig,
    ...config,
    headers: {
      ...defaultConfig.headers,
      ...config.headers
    }
  });

  const handleResponse = async <T>(response: Response): Promise<Result<T, ApiError>> => {
    if (!response.ok) {
      try {
        const errorData = await response.json();
        return failure({
          message: errorData.message || `Error: ${response.status} ${response.statusText}`,
          code: errorData.code || `HTTP_${response.status}`,
          status: response.status,
          details: errorData
        });
      } catch (error) {
        return failure({
          message: `Error: ${response.status} ${response.statusText}`,
          code: `HTTP_${response.status}`,
          status: response.status
        });
      }
    }

    try {
      // Handle empty responses (like for DELETE operations)
      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return success({} as T);
      }
      
      const contentType = response.headers.get('Content-Type');
      
      // Handle JSON responses
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return success(data as T);
      }
      
      // Handle text responses
      if (contentType && contentType.includes('text/')) {
        const text = await response.text();
        return success(text as unknown as T);
      }
      
      // Handle other response types (blob, etc.)
      const blob = await response.blob();
      return success(blob as unknown as T);
    } catch (error) {
      return failure({
        message: 'Error parsing response',
        code: 'PARSE_ERROR',
        details: { error }
      });
    }
  };

  const executeRequest = async <T>(
    url: string,
    method: string,
    config: ApiRequestConfig = {},
    body?: any
  ): Promise<Result<T, ApiError>> => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const mergedConfig = combinedConfig(config);
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...mergedConfig.headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: mergedConfig.signal
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      return failure(categorizeError(error));
    }
  };

  return {
    async get<T>(url: string, config?: ApiRequestConfig): Promise<Result<T, ApiError>> {
      return executeRequest<T>(url, 'GET', config);
    },
    
    async post<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>> {
      return executeRequest<T>(url, 'POST', config, data);
    },
    
    async put<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>> {
      return executeRequest<T>(url, 'PUT', config, data);
    },
    
    async patch<T, D = any>(url: string, data?: D, config?: ApiRequestConfig): Promise<Result<T, ApiError>> {
      return executeRequest<T>(url, 'PATCH', config, data);
    },
    
    async delete<T>(url: string, config?: ApiRequestConfig): Promise<Result<T, ApiError>> {
      return executeRequest<T>(url, 'DELETE', config);
    }
  };
}

/**
 * Default API client instance
 */
export const apiClient = createApiClient(import.meta.env.VITE_API_URL || '/api');
