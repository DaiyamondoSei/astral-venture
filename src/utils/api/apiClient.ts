
import { handleApiResponse, processApiError } from './apiErrorHandler';
import { supabase } from '@/lib/supabaseClient';

/**
 * Options for making API requests
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  showToasts?: boolean;
  throwError?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Default request options
 */
const defaultOptions: Partial<ApiRequestOptions> = {
  headers: {
    'Content-Type': 'application/json'
  },
  showToasts: true,
  throwError: true,
  timeout: 30000, // 30 seconds
  retries: 1,
  retryDelay: 1000
};

/**
 * Make an API request with consistent error handling
 */
export async function makeRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  const { 
    params, 
    queryParams, 
    showToasts, 
    throwError, 
    timeout,
    retries,
    retryDelay,
    ...fetchOptions 
  } = opts;

  // Add query parameters to URL if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value != null) {
        searchParams.append(key, String(value));
      }
    });
    
    url = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
  }

  // Add body parameters for non-GET requests
  if (params && fetchOptions.method && fetchOptions.method !== 'GET') {
    fetchOptions.body = JSON.stringify(params);
  }

  // Set up timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  fetchOptions.signal = controller.signal;

  // Implement retry logic
  let attemptCount = 0;
  let lastError: unknown;

  while (attemptCount <= retries!) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      return await handleApiResponse<T>(response, {
        endpoint: url,
        method: fetchOptions.method || 'GET',
        showToasts,
        throwError
      });
    } catch (error) {
      lastError = error;
      attemptCount++;
      
      // Don't retry if we've reached the max attempts
      if (attemptCount > retries!) {
        break;
      }
      
      // Don't retry certain errors
      if (
        error instanceof Error && 
        (
          // Don't retry user-specific errors
          error.name === 'ValidationError' ||
          // Don't retry aborted requests
          error.name === 'AbortError' ||
          // Don't retry if the browser is offline
          !navigator.onLine
        )
      ) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Clean up timeout
  clearTimeout(timeoutId);
  
  // Process the final error
  return processApiError(lastError, {
    endpoint: url,
    method: fetchOptions.method || 'GET',
    showToasts,
    throwError
  });
}

/**
 * Make a GET request
 */
export function get<T = any>(
  url: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return makeRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 */
export function post<T = any>(
  url: string,
  data?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return makeRequest<T>(url, { ...options, method: 'POST', params: data });
}

/**
 * Make a PUT request
 */
export function put<T = any>(
  url: string,
  data?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return makeRequest<T>(url, { ...options, method: 'PUT', params: data });
}

/**
 * Make a PATCH request
 */
export function patch<T = any>(
  url: string,
  data?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return makeRequest<T>(url, { ...options, method: 'PATCH', params: data });
}

/**
 * Make a DELETE request
 */
export function del<T = any>(
  url: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return makeRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Helper to invoke a Supabase Edge Function with proper error handling
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  payload?: Record<string, any>,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(
      functionName,
      {
        body: payload
      }
    );
    
    if (error) {
      return processApiError(error, {
        endpoint: `Edge Function: ${functionName}`,
        method: 'POST',
        ...options
      });
    }
    
    return data;
  } catch (error) {
    return processApiError(error, {
      endpoint: `Edge Function: ${functionName}`,
      method: 'POST',
      ...options
    });
  }
}
