
import { toast } from 'sonner';
import { ValidationError, isValidationError } from '../validation/ValidationError';
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';

/**
 * Network status categories for better error handling
 */
enum NetworkStatusCategory {
  INFO = 'info',           // 100-199
  SUCCESS = 'success',     // 200-299
  REDIRECT = 'redirect',   // 300-399
  CLIENT_ERROR = 'client', // 400-499
  SERVER_ERROR = 'server', // 500-599
}

/**
 * Get the category of a status code
 */
function getStatusCategory(status: number): NetworkStatusCategory {
  if (status < 200) return NetworkStatusCategory.INFO;
  if (status < 300) return NetworkStatusCategory.SUCCESS;
  if (status < 400) return NetworkStatusCategory.REDIRECT;
  if (status < 500) return NetworkStatusCategory.CLIENT_ERROR;
  return NetworkStatusCategory.SERVER_ERROR;
}

/**
 * Standard error handling for API responses
 */
export async function handleApiResponse<T>(
  response: Response,
  options: {
    endpoint?: string;
    method?: string;
    showToasts?: boolean;
    throwError?: boolean;
  } = {}
): Promise<T> {
  const { 
    endpoint = 'API', 
    method = 'GET',
    showToasts = true,
    throwError = true
  } = options;

  // Handle successful responses
  if (response.ok) {
    // Check if the response is a stream
    if (response.headers.get('Content-Type')?.includes('stream')) {
      return response as unknown as T;
    }
    
    // For JSON responses
    try {
      return await response.json() as T;
    } catch (error) {
      const message = `Invalid JSON response from ${endpoint}`;
      
      handleError(error, {
        showToast: showToasts,
        category: ErrorCategory.API,
        context: {
          endpoint,
          method,
          status: response.status,
        }
      });
      
      if (throwError) {
        throw new ValidationError(message, {
          field: 'response',
          rule: 'json',
          code: 'INVALID_JSON',
          statusCode: 500,
          originalError: error
        });
      }
      
      return null as T;
    }
  }

  // Handle error responses
  try {
    // Try to parse the error response as JSON
    const errorData = await response.json();
    const statusCategory = getStatusCategory(response.status);
    const isSeverError = statusCategory === NetworkStatusCategory.SERVER_ERROR;
    
    // Create an appropriate error object
    const error = new ValidationError(
      errorData.message || errorData.error || `${response.status}: ${response.statusText}`,
      {
        field: 'response',
        statusCode: response.status,
        details: errorData,
        code: errorData.code || `HTTP_${response.status}`
      }
    );
    
    // Process through central error handling
    handleError(error, {
      showToast: showToasts,
      severity: isSeverError ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      category: ErrorCategory.API,
      context: {
        endpoint,
        method,
        status: response.status,
        responseData: errorData
      }
    });
    
    if (throwError) {
      throw error;
    }
    
    return null as T;
  } catch (parseError) {
    // Handle case where error response is not valid JSON
    const message = `${response.status}: ${response.statusText}`;
    const statusCategory = getStatusCategory(response.status);
    const isSeverError = statusCategory === NetworkStatusCategory.SERVER_ERROR;
    
    const error = new ValidationError(message, {
      field: 'response',
      statusCode: response.status,
      code: `HTTP_${response.status}`
    });
    
    handleError(error, {
      showToast: showToasts,
      severity: isSeverError ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      category: ErrorCategory.API,
      context: {
        endpoint,
        method,
        status: response.status
      }
    });
    
    if (throwError) {
      throw error;
    }
    
    return null as T;
  }
}

/**
 * Process a caught API error
 */
export function processApiError(
  error: unknown,
  options: {
    endpoint?: string;
    method?: string;
    showToasts?: boolean;
    logToServer?: boolean;
    throwError?: boolean;
  } = {}
): never | null {
  const { 
    endpoint = 'API', 
    method = 'GET',
    showToasts = true,
    logToServer = true,
    throwError = true
  } = options;

  let processedError: ValidationError;

  // Convert to ValidationError if it isn't already
  if (isValidationError(error)) {
    processedError = error;
  } else if (error instanceof Error) {
    processedError = ValidationError.fromApiError(error, endpoint);
  } else {
    processedError = new ValidationError(
      `Unknown error from ${endpoint}`,
      {
        field: endpoint,
        details: String(error),
        code: 'UNKNOWN_API_ERROR'
      }
    );
  }

  // Process through central error handling
  handleError(processedError, {
    showToast: showToasts,
    logToServer,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.API,
    context: {
      endpoint,
      method
    }
  });

  if (throwError) {
    throw processedError;
  }

  return null;
}
