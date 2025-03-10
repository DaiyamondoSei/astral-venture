
import { toast } from '@/components/ui/use-toast';

export enum ErrorCode {
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
  AUTHENTICATION_ERROR = 'authentication_error',
  VALIDATION_FAILED = 'validation_failed',
  CONTENT_POLICY_VIOLATION = 'content_policy_violation',
  DATABASE_ERROR = 'database_error',
  INTERNAL_ERROR = 'internal_error',
  EXTERNAL_API_ERROR = 'external_api_error',
  UNDEFINED = 'undefined'
}

export class ApiError extends Error {
  code: ErrorCode;
  statusCode?: number;
  details?: any;
  shouldRetry: boolean;

  constructor(message: string, code: ErrorCode, options: {
    statusCode?: number;
    details?: any;
    shouldRetry?: boolean;
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.shouldRetry = options.shouldRetry || false;
  }

  static network(message: string = 'Network connection error', details?: any): ApiError {
    return new ApiError(message, ErrorCode.NETWORK_ERROR, {
      details,
      shouldRetry: true,
      statusCode: 0
    });
  }

  static timeout(message: string = 'Request timed out', details?: any): ApiError {
    return new ApiError(message, ErrorCode.TIMEOUT, {
      details,
      shouldRetry: true,
      statusCode: 408
    });
  }

  static authentication(message: string = 'Authentication required', details?: any): ApiError {
    return new ApiError(message, ErrorCode.AUTHENTICATION_ERROR, {
      details,
      statusCode: 401
    });
  }

  static validation(message: string, details?: any): ApiError {
    return new ApiError(message, ErrorCode.VALIDATION_FAILED, {
      details,
      statusCode: 400
    });
  }

  static serverError(message: string = 'Internal server error', details?: any): ApiError {
    return new ApiError(message, ErrorCode.INTERNAL_ERROR, {
      details,
      statusCode: 500,
      shouldRetry: true
    });
  }

  static fromResponse(response: Response, message?: string): ApiError {
    const statusCode = response.status;
    
    // Determine error type from status code
    if (statusCode === 401 || statusCode === 403) {
      return ApiError.authentication(message || 'Authentication failed');
    } else if (statusCode === 400) {
      return ApiError.validation(message || 'Invalid request');
    } else if (statusCode === 429) {
      return new ApiError(message || 'Rate limit exceeded', ErrorCode.RATE_LIMITED, {
        statusCode,
        shouldRetry: true
      });
    } else if (statusCode >= 500) {
      return ApiError.serverError(message || 'Server error');
    }
    
    // Default error
    return new ApiError(
      message || `Request failed with status ${statusCode}`,
      ErrorCode.UNDEFINED,
      { statusCode }
    );
  }

  static fromError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Network error detection
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ApiError.network();
    }

    // Timeout detection
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return ApiError.timeout();
    }

    // Default to generic error
    return new ApiError(
      error.message || 'An unknown error occurred',
      ErrorCode.UNDEFINED,
      { details: error }
    );
  }
}

/**
 * Process and format API errors consistently
 */
export function processApiError(error: any, options: {
  showToast?: boolean;
  context?: string;
  fallbackMessage?: string;
} = {}): ApiError {
  const { showToast = true, context = '', fallbackMessage = 'An error occurred' } = options;
  
  // Convert to ApiError if it's not already
  const apiError = ApiError.fromError(error);
  
  // Show toast notification if requested
  if (showToast) {
    const contextPrefix = context ? `[${context}] ` : '';
    toast({
      title: "Error",
      description: `${contextPrefix}${apiError.message || fallbackMessage}`,
      variant: "destructive",
    });
  }
  
  // Log error for debugging
  console.error(`API Error ${context ? `in ${context}` : ''}:`, apiError);
  
  return apiError;
}

/**
 * Process API response and handle errors consistently
 */
export async function handleApiResponse<T>(
  response: Response, 
  options: {
    context?: string;
    showToast?: boolean;
    customErrorMessage?: string;
  } = {}
): Promise<T> {
  const { context, showToast = true, customErrorMessage } = options;
  
  if (!response.ok) {
    // Try to parse error details from response
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Could not parse error response' };
    }
    
    // Create appropriate error
    const apiError = ApiError.fromResponse(
      response, 
      errorData?.message || errorData?.error || customErrorMessage
    );
    
    // Add details from response
    apiError.details = errorData;
    
    // Process error with consistent handling
    throw processApiError(apiError, { showToast, context });
  }
  
  // Handle empty responses
  if (response.status === 204) {
    return null as unknown as T;
  }
  
  // Parse JSON response
  try {
    return await response.json();
  } catch (error) {
    throw processApiError(
      new ApiError('Invalid JSON in response', ErrorCode.EXTERNAL_API_ERROR),
      { showToast, context }
    );
  }
}

export default {
  ApiError,
  processApiError,
  handleApiResponse,
  ErrorCode
};
