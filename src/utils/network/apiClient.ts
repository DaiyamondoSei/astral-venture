
/**
 * API client utilities for making consistent network requests
 */
import { AppError, ErrorCategory, ErrorSeverity, createAppError } from "../errorHandling/AppError";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  parseResponse?: boolean;
  withAuth?: boolean;
  authToken?: string;
}

export interface ApiResponseMetadata {
  status: number;
  statusText: string;
  headers: Headers;
  responseType: string;
  timestamp: Date;
  duration: number;
  url: string;
  cached: boolean;
}

export interface ApiResponse<T> {
  data: T;
  metadata: ApiResponseMetadata;
  success: boolean;
}

const DEFAULT_OPTIONS: ApiRequestOptions = {
  timeout: 30000,
  retries: 1,
  retryDelay: 1000,
  cache: 'default',
  credentials: 'same-origin',
  parseResponse: true,
  withAuth: true
};

/**
 * Helper function to handle response parsing
 */
async function parseApiResponse<T>(
  response: Response,
  parseResponse: boolean,
  startTime: number,
  url: string
): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type') || '';
  const duration = Date.now() - startTime;
  const metadata: ApiResponseMetadata = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    responseType: contentType,
    timestamp: new Date(),
    duration,
    url,
    cached: response.headers.get('x-cache') === 'HIT'
  };
  
  let data: T;
  
  if (!parseResponse) {
    return {
      data: response as unknown as T,
      metadata,
      success: response.ok
    };
  }
  
  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text() as unknown as T;
    } else if (contentType.includes('application/octet-stream')) {
      data = await response.arrayBuffer() as unknown as T;
    } else {
      data = await response.blob() as unknown as T;
    }
  } catch (error) {
    throw createAppError(error, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.ERROR,
      userMessage: 'Failed to parse API response',
      context: { url, status: response.status, contentType }
    });
  }
  
  if (!response.ok) {
    throw createApiError(response, data, metadata);
  }
  
  return { data, metadata, success: true };
}

/**
 * Create a standardized API error
 */
function createApiError(
  response: Response,
  data: any,
  metadata: ApiResponseMetadata
): AppError {
  // Try to extract meaningful error details from the response
  const status = response.status;
  let message = `API request failed with status ${status}`;
  let errorDetail = '';
  
  // Attempt to extract error details from common API error formats
  if (data) {
    if (typeof data === 'object') {
      const errorMessage = 
        data.message || 
        data.error?.message || 
        data.error || 
        data.errorMessage;
        
      if (errorMessage && typeof errorMessage === 'string') {
        errorDetail = errorMessage;
      }
    } else if (typeof data === 'string') {
      errorDetail = data;
    }
  }
  
  if (errorDetail) {
    message += `: ${errorDetail}`;
  }
  
  // Determine error severity based on status code
  let severity = ErrorSeverity.ERROR;
  if (status >= 500) {
    severity = ErrorSeverity.CRITICAL;
  } else if (status === 429) {
    severity = ErrorSeverity.WARNING;
  }
  
  // Determine if the error is retryable
  const isRetryable = status === 429 || status >= 500 || status === 408;
  
  return createAppError(message, {
    severity,
    category: ErrorCategory.API,
    code: `HTTP_${status}`,
    context: {
      status,
      url: metadata.url,
      responseData: data,
      headers: Object.fromEntries(metadata.headers.entries())
    },
    userMessage: 'Failed to complete request. Please try again later.',
    isRetryable
  });
}

/**
 * Make an API request with robust error handling and consistent response format
 */
export async function apiRequest<T = any>(
  url: string,
  method: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  // Initialize request headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...opts.headers
  };
  
  // Add content-type for requests with body
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add auth token if required
  if (opts.withAuth && opts.authToken) {
    headers['Authorization'] = `Bearer ${opts.authToken}`;
  }
  
  // Create request init object
  const requestInit: RequestInit = {
    method,
    headers,
    cache: opts.cache,
    credentials: opts.credentials,
    signal: opts.signal
  };
  
  // Add body if provided
  if (body) {
    requestInit.body = body instanceof FormData ? body : JSON.stringify(body);
  }
  
  // Create timeout controller if timeout is specified
  let timeoutId: number | undefined;
  const timeoutController = new AbortController();
  
  if (opts.timeout && !opts.signal) {
    requestInit.signal = timeoutController.signal;
    timeoutId = window.setTimeout(() => {
      timeoutController.abort();
    }, opts.timeout);
  } else if (opts.signal) {
    requestInit.signal = opts.signal;
  }
  
  try {
    // Make the request with retries
    let lastError: Error | null = null;
    let retries = opts.retries || 0;
    
    while (retries >= 0) {
      try {
        const response = await fetch(url, requestInit);
        
        // Clear timeout if set
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        
        return await parseApiResponse<T>(
          response,
          opts.parseResponse !== false,
          startTime,
          url
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry if aborted or if we're out of retries
        if (lastError.name === 'AbortError' || retries <= 0) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
        retries--;
      }
    }
    
    // This should not be reached, but TypeScript requires a return
    throw lastError;
  } catch (error) {
    // Clear timeout if set
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    
    // Handle AbortError due to timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw createAppError('Request timed out', {
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.NETWORK,
        code: 'REQUEST_TIMEOUT',
        userMessage: 'The request took too long to complete. Please try again.',
        context: { url, method, timeout: opts.timeout },
        isRetryable: true
      });
    }
    
    // Re-throw AppError instances
    if (error instanceof AppError) {
      throw error;
    }
    
    // Convert other errors to AppError
    throw createAppError(error, {
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.NETWORK,
      userMessage: 'Failed to complete request. Please check your network connection.',
      context: { url, method }
    });
  }
}

/**
 * Shorthand for GET requests
 */
export function get<T = any>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, 'GET', undefined, options);
}

/**
 * Shorthand for POST requests
 */
export function post<T = any>(
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, 'POST', data, options);
}

/**
 * Shorthand for PUT requests
 */
export function put<T = any>(
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, 'PUT', data, options);
}

/**
 * Shorthand for PATCH requests
 */
export function patch<T = any>(
  url: string,
  data?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, 'PATCH', data, options);
}

/**
 * Shorthand for DELETE requests
 */
export function del<T = any>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, 'DELETE', undefined, options);
}
