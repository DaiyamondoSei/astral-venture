
/**
 * Standard API error types for consistent error handling
 */
export enum ApiErrorType {
  // Network related errors
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  CONNECTION_ERROR = 'connection_error',
  
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  
  // Data errors
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  CONFLICT_ERROR = 'conflict_error',
  
  // Server errors
  SERVER_ERROR = 'server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // Client errors
  BAD_REQUEST = 'bad_request',
  RATE_LIMITED = 'rate_limited',
  
  // Unknown/other errors
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Standardized API error for consistent error handling
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly endpoint?: string;
  public readonly details?: any;
  public readonly retry?: boolean;
  public readonly originalError?: any;
  
  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN_ERROR,
    options: {
      statusCode?: number;
      endpoint?: string;
      details?: any;
      retry?: boolean;
      originalError?: any;
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = options.statusCode;
    this.endpoint = options.endpoint;
    this.details = options.details;
    this.retry = options.retry;
    this.originalError = options.originalError;
    
    // Ensure stack trace works correctly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  
  /**
   * Create an error from a network or API response
   */
  static fromResponse(response: Response, endpoint?: string): ApiError {
    const statusCode = response.status;
    
    // Map status code to appropriate error type
    let type = ApiErrorType.UNKNOWN_ERROR;
    let message = `API error: ${statusCode}`;
    
    switch (statusCode) {
      case 400:
        type = ApiErrorType.BAD_REQUEST;
        message = 'Bad request';
        break;
      case 401:
        type = ApiErrorType.UNAUTHORIZED;
        message = 'Unauthorized';
        break;
      case 403:
        type = ApiErrorType.FORBIDDEN;
        message = 'Forbidden';
        break;
      case 404:
        type = ApiErrorType.NOT_FOUND;
        message = 'Resource not found';
        break;
      case 409:
        type = ApiErrorType.CONFLICT_ERROR;
        message = 'Resource conflict';
        break;
      case 429:
        type = ApiErrorType.RATE_LIMITED;
        message = 'Too many requests';
        break;
      case 500:
        type = ApiErrorType.SERVER_ERROR;
        message = 'Internal server error';
        break;
      case 503:
        type = ApiErrorType.SERVICE_UNAVAILABLE;
        message = 'Service unavailable';
        break;
    }
    
    return new ApiError(message, type, { 
      statusCode, 
      endpoint,
      retry: statusCode === 429 || statusCode >= 500
    });
  }
  
  /**
   * Create an error from a network exception
   */
  static fromNetworkError(error: Error, endpoint?: string): ApiError {
    // Determine if this is a timeout error
    const isTimeout = error.name === 'TimeoutError' || 
                      error.message.includes('timeout') || 
                      error.message.includes('timed out');
    
    const type = isTimeout ? 
      ApiErrorType.TIMEOUT_ERROR : 
      ApiErrorType.NETWORK_ERROR;
    
    return new ApiError(
      isTimeout ? 'Request timed out' : 'Network error',
      type,
      { 
        endpoint, 
        originalError: error,
        retry: true 
      }
    );
  }
}

export default ApiError;
