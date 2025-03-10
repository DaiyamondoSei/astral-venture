
/**
 * API middleware for standardized request/response handling
 */
import { ValidationError } from '../validation/ValidationError';
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';

/**
 * Options for API request middleware
 */
export interface ApiRequestOptions {
  /** Base URL for the API */
  baseUrl?: string;
  /** Default headers to include with all requests */
  defaultHeaders?: Record<string, string>;
  /** Whether to include credentials with requests */
  withCredentials?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to retry failed requests */
  retry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Whether to show toast messages for errors */
  showToastOnError?: boolean;
  /** Whether to track request metrics */
  trackMetrics?: boolean;
}

/**
 * Default API request options
 */
const defaultOptions: ApiRequestOptions = {
  withCredentials: true,
  timeout: 30000,
  retry: true,
  maxRetries: 2,
  showToastOnError: true,
  trackMetrics: true
};

/**
 * Process API response with standardized error handling
 * 
 * @param response - Fetch response object
 * @param options - Additional processing options
 * @returns Parsed response data
 * @throws ValidationError if response is not OK
 */
export async function processApiResponse<T>(
  response: Response,
  options: {
    context?: string;
    showToast?: boolean;
    rethrow?: boolean;
  } = {}
): Promise<T> {
  const { context = 'API request', showToast = true, rethrow = true } = options;
  
  if (!response.ok) {
    let errorData;
    let errorMessage: string;
    
    try {
      errorData = await response.json();
      errorMessage = errorData?.error?.message || 
                    errorData?.message || 
                    `API error: ${response.status} ${response.statusText}`;
    } catch (e) {
      // If we can't parse JSON, just use status text
      errorData = { error: response.statusText };
      errorMessage = `API error: ${response.status} ${response.statusText}`;
    }
    
    // Create validation error with API details
    const error = ValidationError.fromApiError(
      errorMessage,
      response.status,
      errorData
    );
    
    // Handle the error with our error handling system
    handleError(error, {
      context,
      category: ErrorCategory.NETWORK,
      severity: response.status >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      showToast,
      metadata: {
        status: response.status,
        url: response.url,
        errorData
      },
      rethrow
    });
    
    // This will execute if rethrow is false
    throw error;
  }
  
  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * Create a fetch request with standardized error handling and options
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param apiOptions - Additional API options
 * @returns Fetch response
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  apiOptions: ApiRequestOptions = {}
): Promise<T> {
  const mergedOptions: ApiRequestOptions = { ...defaultOptions, ...apiOptions };
  const { baseUrl, defaultHeaders, withCredentials, timeout, retry, maxRetries, showToastOnError } = mergedOptions;
  
  // Construct full URL
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;
  
  // Merge headers
  const headers = {
    'Content-Type': 'application/json',
    ...(defaultHeaders || {}),
    ...(options.headers || {})
  };
  
  // Create fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: withCredentials ? 'include' : undefined
  };
  
  // Track metrics if enabled
  const startTime = mergedOptions.trackMetrics ? performance.now() : 0;
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    let timeoutId: number | undefined;
    
    if (timeout) {
      timeoutId = window.setTimeout(() => controller.abort(), timeout);
      fetchOptions.signal = controller.signal;
    }
    
    // Perform fetch with retry logic
    let response: Response;
    let retryCount = 0;
    let lastError: unknown;
    
    while (true) {
      try {
        response = await fetch(fullUrl, fetchOptions);
        break;
      } catch (error) {
        lastError = error;
        
        if (retry && retryCount < (maxRetries || 0) && 
            !(error instanceof DOMException && error.name === 'AbortError')) {
          retryCount++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 2 ** retryCount * 100));
          continue;
        }
        
        // Cleanup timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        throw error;
      }
    }
    
    // Cleanup timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Record metrics if enabled
    if (mergedOptions.trackMetrics) {
      const duration = performance.now() - startTime;
      console.debug(`[API] ${options.method || 'GET'} ${url} - ${duration.toFixed(2)}ms`);
    }
    
    // Process the response
    return await processApiResponse<T>(response, {
      context: `${options.method || 'GET'} ${url}`,
      showToast: showToastOnError,
      rethrow: true
    });
  } catch (error) {
    // Record metrics for failed requests
    if (mergedOptions.trackMetrics) {
      const duration = performance.now() - startTime;
      console.error(`[API] ${options.method || 'GET'} ${url} - FAILED after ${duration.toFixed(2)}ms`);
    }
    
    // Handle network errors
    if (error instanceof Error && ('TypeError' === error.name || error.message.includes('network'))) {
      handleError(error, {
        context: `${options.method || 'GET'} ${url}`,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        showToast: showToastOnError,
        customMessage: 'Network error - please check your connection',
        rethrow: true
      });
    }
    
    // Handle timeouts
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeout}ms`);
      handleError(timeoutError, {
        context: `${options.method || 'GET'} ${url}`,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.ERROR,
        showToast: showToastOnError,
        customMessage: 'Request timed out - please try again later',
        rethrow: true
      });
    }
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Create an API client with predefined options
 * 
 * @param baseOptions - Base options for all requests
 * @returns API client functions
 */
export function createApiClient(baseOptions: ApiRequestOptions = {}) {
  return {
    /**
     * Perform a GET request
     */
    get<T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> {
      return apiFetch<T>(url, { method: 'GET' }, { ...baseOptions, ...options });
    },
    
    /**
     * Perform a POST request
     */
    post<T = any>(url: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
      return apiFetch<T>(
        url, 
        { 
          method: 'POST',
          body: JSON.stringify(data)
        }, 
        { ...baseOptions, ...options }
      );
    },
    
    /**
     * Perform a PUT request
     */
    put<T = any>(url: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
      return apiFetch<T>(
        url, 
        { 
          method: 'PUT',
          body: JSON.stringify(data)
        }, 
        { ...baseOptions, ...options }
      );
    },
    
    /**
     * Perform a PATCH request
     */
    patch<T = any>(url: string, data: any, options: ApiRequestOptions = {}): Promise<T> {
      return apiFetch<T>(
        url, 
        { 
          method: 'PATCH',
          body: JSON.stringify(data)
        }, 
        { ...baseOptions, ...options }
      );
    },
    
    /**
     * Perform a DELETE request
     */
    delete<T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> {
      return apiFetch<T>(url, { method: 'DELETE' }, { ...baseOptions, ...options });
    }
  };
}

export default {
  apiFetch,
  processApiResponse,
  createApiClient
};
