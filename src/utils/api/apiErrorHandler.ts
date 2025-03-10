
import { AppError, ErrorSeverity, ErrorCategory, createAppError } from '../errorHandling/AppError';
import { ApiError, ApiErrorCode } from './ApiError';
import { handleError } from '../errorHandling/handleError';
import { ValidationError } from '../validation/ValidationError';

/**
 * Processes an API response and handles any errors
 * @param response The fetch Response object
 * @param options Processing options
 * @returns Parsed response data
 */
export async function handleApiResponse<T>(
  response: Response,
  options: {
    endpoint?: string;
    method?: string;
    expectedStatus?: number | number[];
    throwOnError?: boolean;
  } = {}
): Promise<T> {
  const {
    endpoint,
    method = 'GET',
    expectedStatus = 200,
    throwOnError = true
  } = options;

  // Check if response status is as expected
  const isStatusExpected = Array.isArray(expectedStatus)
    ? expectedStatus.includes(response.status)
    : response.status === expectedStatus;

  // Return parsed response if status is as expected
  if (isStatusExpected) {
    // Handle different content types
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text() as unknown as T;
    } else {
      // For binary data, return the response directly
      return response as unknown as T;
    }
  }

  // Handle error response
  let errorData: any;
  
  try {
    // Try to parse error response as JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = await response.text();
    }
  } catch (e) {
    // If parsing fails, use status text
    errorData = response.statusText;
  }

  // Create ApiError with details
  const apiError = new ApiError(
    errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`,
    ApiError.codeFromStatus(response.status),
    response.status,
    errorData,
    {
      endpoint,
      method,
      statusCode: response.status,
      statusText: response.statusText,
      responseData: errorData,
      retryable: response.status >= 500 || response.status === 429
    }
  );

  // Process through error handler
  const error = processApiError(apiError);
  
  // Optionally throw the error
  if (throwOnError) {
    throw error;
  }
  
  return error as unknown as T;
}

/**
 * Process an API error through the central error handling system
 * @param error The original error
 * @returns Processed AppError
 */
export function processApiError(error: unknown): AppError {
  // Convert to ApiError if not already
  const apiError = error instanceof ApiError
    ? error
    : ApiError.from(error);
  
  // Map API error to AppError
  const appError = createAppError(apiError, {
    severity: mapApiErrorToSeverity(apiError),
    category: ErrorCategory.API,
    code: apiError.code,
    context: {
      statusCode: apiError.statusCode,
      endpoint: apiError.endpoint,
      method: apiError.method
    },
    recoverable: apiError.recoverable,
    userActionable: apiError.userActionable,
    suggestedAction: apiError.suggestedAction
  });
  
  // Send through error handling system
  return handleError(appError, { 
    throwError: false,
    showToast: shouldShowToast(apiError)
  });
}

/**
 * Map API error code to error severity
 */
function mapApiErrorToSeverity(error: ApiError): ErrorSeverity {
  // Default mapping based on status code
  if (error.statusCode) {
    if (error.statusCode >= 500) return ErrorSeverity.ERROR;
    if (error.statusCode >= 400) return ErrorSeverity.WARNING;
    return ErrorSeverity.INFO;
  }
  
  // Mapping based on error code
  switch (error.code) {
    case ApiErrorCode.NETWORK_ERROR:
    case ApiErrorCode.INTERNAL_SERVER_ERROR:
    case ApiErrorCode.SERVICE_UNAVAILABLE:
    case ApiErrorCode.GATEWAY_TIMEOUT:
      return ErrorSeverity.ERROR;
      
    case ApiErrorCode.UNAUTHORIZED:
    case ApiErrorCode.FORBIDDEN:
    case ApiErrorCode.NOT_FOUND:
    case ApiErrorCode.VALIDATION_ERROR:
    case ApiErrorCode.RATE_LIMITED:
      return ErrorSeverity.WARNING;
      
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Determine if an error should show a toast notification
 */
function shouldShowToast(error: ApiError): boolean {
  // Don't show toasts for validation errors (handled by forms)
  if (error.code === ApiErrorCode.VALIDATION_ERROR) {
    return false;
  }
  
  // Don't show for 404 errors (might be expected in some cases)
  if (error.statusCode === 404) {
    return false;
  }
  
  return true;
}

export default {
  handleApiResponse,
  processApiError
};
