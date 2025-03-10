
/**
 * API Client
 * 
 * Provides a standard interface for making API requests with consistent
 * error handling, caching, and type validation.
 */

import { ValidationError } from '@/utils/validation/ValidationError';
import { handleError } from '@/utils/errorHandling/handleError';

/**
 * API fetch configuration options
 */
export interface ApiFetchOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  cache?: RequestCache;
  validateStatus?: boolean;
  retries?: number;
  retryDelay?: number;
  abortOnTimeout?: boolean;
}

/**
 * Error handling options
 */
export interface ApiErrorOptions {
  showToast?: boolean;
  context?: string;
  customErrorMessage?: string;
  fallbackMessage?: string;
}

/**
 * Default API options
 */
const defaultApiOptions: ApiFetchOptions = {
  baseUrl: '/api',
  timeout: 30000,
  cache: 'default',
  validateStatus: true,
  retries: 0,
  retryDelay: 1000,
  abortOnTimeout: true,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Create a specialized API client with custom base options
 */
export function createApiClient(baseOptions: Partial<ApiFetchOptions> = {}) {
  const options = { ...defaultApiOptions, ...baseOptions };
  
  /**
   * Make an API request
   */
  async function fetchApi<T>(
    endpoint: string,
    requestOptions: Partial<ApiFetchOptions> = {},
    errorOptions: ApiErrorOptions = {}
  ): Promise<T> {
    const mergedOptions = { ...options, ...requestOptions };
    const {
      baseUrl,
      timeout,
      validateStatus,
      retries,
      retryDelay,
      abortOnTimeout,
      ...fetchOptions
    } = mergedOptions;
    
    // Create an abort controller for timeout handling
    const controller = new AbortController();
    let timeoutId: number | undefined;
    
    if (abortOnTimeout && timeout) {
      timeoutId = window.setTimeout(() => {
        controller.abort();
      }, timeout);
    }
    
    try {
      // Add the signal to the fetch options
      const finalOptions = {
        ...fetchOptions,
        signal: controller.signal
      };
      
      const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
      const response = await fetch(url, finalOptions);
      
      // Clear the timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Validate the response status
      if (validateStatus && !response.ok) {
        let errorData: any;
        
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText };
        }
        
        const errorMessage = errorData?.error || errorData?.message || `Error ${response.status}: ${response.statusText}`;
        
        throw new ValidationError(errorMessage, {
          code: `api_error_${response.status}`,
          statusCode: response.status,
          details: errorData
        });
      }
      
      // Parse the response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Clear the timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle aborted requests separately
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ValidationError('Request timed out', {
          code: 'request_timeout',
          statusCode: 408,
          details: { endpoint }
        });
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ValidationError('Network error', {
          code: 'network_error',
          statusCode: 0,
          details: { endpoint }
        });
      }
      
      // Handle validation errors
      if (error instanceof ValidationError) {
        // If retry logic is enabled and there are retries left
        if (retries && retries > 0) {
          console.warn(`Retrying request to ${endpoint}. Retries left: ${retries - 1}`);
          
          // Wait for the retry delay
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Make the request again with one less retry
          return fetchApi<T>(
            endpoint, 
            { ...requestOptions, retries: retries - 1 },
            errorOptions
          );
        }
        
        // No retries left or retries disabled, propagate the error
        throw error;
      }
      
      // Handle unknown errors
      throw new ValidationError(
        (error as Error)?.message || errorOptions.fallbackMessage || 'An unknown error occurred',
        {
          code: 'unknown_error',
          statusCode: 500,
          details: { endpoint }
        }
      );
    }
  }
  
  /**
   * Make a GET request
   */
  async function get<T>(
    endpoint: string,
    params: Record<string, any> = {},
    requestOptions: Partial<ApiFetchOptions> = {},
    errorOptions: ApiErrorOptions = {}
  ): Promise<T> {
    try {
      // Build the URL with query parameters
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      
      return await fetchApi<T>(
        url.pathname + url.search,
        { ...requestOptions, method: 'GET' },
        errorOptions
      );
    } catch (error) {
      // Handle errors
      await handleError(error, {
        context: `GET ${endpoint}`,
        customMessage: errorOptions.customErrorMessage,
        showToast: errorOptions.showToast
      });
      
      throw error;
    }
  }
  
  /**
   * Make a POST request
   */
  async function post<T>(
    endpoint: string,
    data: any = {},
    requestOptions: Partial<ApiFetchOptions> = {},
    errorOptions: ApiErrorOptions = {}
  ): Promise<T> {
    try {
      return await fetchApi<T>(
        endpoint,
        {
          ...requestOptions,
          method: 'POST',
          body: JSON.stringify(data)
        },
        errorOptions
      );
    } catch (error) {
      // Handle errors
      await handleError(error, {
        context: `POST ${endpoint}`,
        customMessage: errorOptions.customErrorMessage,
        showToast: errorOptions.showToast
      });
      
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   */
  async function put<T>(
    endpoint: string,
    data: any = {},
    requestOptions: Partial<ApiFetchOptions> = {},
    errorOptions: ApiErrorOptions = {}
  ): Promise<T> {
    try {
      return await fetchApi<T>(
        endpoint,
        {
          ...requestOptions,
          method: 'PUT',
          body: JSON.stringify(data)
        },
        errorOptions
      );
    } catch (error) {
      // Handle errors
      await handleError(error, {
        context: `PUT ${endpoint}`,
        customMessage: errorOptions.customErrorMessage,
        showToast: errorOptions.showToast
      });
      
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   */
  async function del<T>(
    endpoint: string,
    params: Record<string, any> = {},
    requestOptions: Partial<ApiFetchOptions> = {},
    errorOptions: ApiErrorOptions = {}
  ): Promise<T> {
    try {
      // Build the URL with query parameters
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      
      return await fetchApi<T>(
        url.pathname + url.search,
        { ...requestOptions, method: 'DELETE' },
        errorOptions
      );
    } catch (error) {
      // Handle errors
      await handleError(error, {
        context: `DELETE ${endpoint}`,
        customMessage: errorOptions.customErrorMessage,
        showToast: errorOptions.showToast
      });
      
      throw error;
    }
  }
  
  // Return the API client interface
  return {
    get,
    post,
    put,
    delete: del,
    request: fetchApi
  };
}

// Export a default API client
export const apiClient = createApiClient();

export default apiClient;
