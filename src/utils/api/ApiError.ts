
import { AppError, ErrorCategory, ErrorSeverity, createAppError } from '../errorHandling/AppError';

/**
 * HTTP status code categories
 */
export enum HttpStatusCategory {
  INFORMATIONAL = 'informational',  // 100-199
  SUCCESS = 'success',              // 200-299
  REDIRECT = 'redirect',            // 300-399
  CLIENT_ERROR = 'clientError',     // 400-499
  SERVER_ERROR = 'serverError',     // 500-599
}

/**
 * Common API error codes
 */
export enum ApiErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  
  // Request errors
  BAD_REQUEST = 'badRequest',
  NOT_FOUND = 'notFound',
  METHOD_NOT_ALLOWED = 'methodNotAllowed',
  TIMEOUT = 'timeout',
  CONFLICT = 'conflict',
  PRECONDITION_FAILED = 'preconditionFailed',
  PAYLOAD_TOO_LARGE = 'payloadTooLarge',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'internalServerError',
  SERVICE_UNAVAILABLE = 'serviceUnavailable',
  GATEWAY_TIMEOUT = 'gatewayTimeout',
  
  // Network errors
  NETWORK_ERROR = 'networkError',
  ABORT_ERROR = 'abortError',
  
  // Data errors
  VALIDATION_ERROR = 'validationError',
  PARSE_ERROR = 'parseError',
  
  // Rate limiting
  RATE_LIMITED = 'rateLimited',
  
  // Unknown error
  UNKNOWN = 'unknown'
}

/**
 * API error specific context
 */
export interface ApiErrorContext {
  endpoint?: string;
  method?: string;
  requestId?: string;
  statusCode?: number;
  statusText?: string;
  responseData?: unknown;
  requestData?: unknown;
  retryable?: boolean;
  headers?: Record<string, string>;
  duration?: number;  // Request duration in ms
}

/**
 * Extended AppError for API errors
 */
export class ApiError extends Error implements AppError {
  message: string;
  code: ApiErrorCode;
  severity: ErrorSeverity;
  category: ErrorCategory;
  originalError?: unknown;
  statusCode?: number;
  statusText?: string;
  endpoint?: string;
  method?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
  userActionable: boolean;
  suggestedAction?: string;
  retryable: boolean;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.UNKNOWN,
    statusCode?: number,
    originalError?: unknown,
    context?: ApiErrorContext
  ) {
    super(message);
    this.name = 'ApiError';
    this.message = message;
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.endpoint = context?.endpoint;
    this.method = context?.method;
    this.context = context;
    this.retryable = context?.retryable ?? this.isRetryable(statusCode);
    
    // Set severity based on status code
    this.severity = this.getSeverityFromStatus(statusCode);
    
    // Set category based on error type
    this.category = ErrorCategory.API;
    
    // Determine if the error is recoverable
    this.recoverable = this.isRecoverable(statusCode, code);
    
    // Determine if the user can take action
    this.userActionable = this.isUserActionable(statusCode, code);
    
    // Set suggested action based on error type
    this.suggestedAction = this.getSuggestedAction(code, statusCode);
    
    // Ensure prototype chain is properly maintained
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Determine if an error should be retried based on status code
   */
  private isRetryable(statusCode?: number): boolean {
    if (!statusCode) return false;
    
    // 5xx errors and specific 4xx errors may be retryable
    return (
      (statusCode >= 500 && statusCode < 600) || // Server errors
      statusCode === 408 || // Request Timeout
      statusCode === 429   // Too Many Requests
    );
  }

  /**
   * Get error severity based on status code
   */
  private getSeverityFromStatus(statusCode?: number): ErrorSeverity {
    if (!statusCode) return ErrorSeverity.ERROR;
    
    if (statusCode >= 500) return ErrorSeverity.ERROR;
    if (statusCode >= 400) return ErrorSeverity.WARNING;
    return ErrorSeverity.INFO;
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverable(statusCode?: number, code?: ApiErrorCode): boolean {
    if (code === ApiErrorCode.NETWORK_ERROR) return true; // Network can recover
    if (code === ApiErrorCode.TIMEOUT) return true; // Timeouts can be retried
    if (code === ApiErrorCode.RATE_LIMITED) return true; // Rate limits pass eventually
    
    if (!statusCode) return false;
    
    // Most 4xx errors are not recoverable without user action
    if (statusCode >= 400 && statusCode < 500) {
      return statusCode === 401 || // Unauthorized (can log in again)
             statusCode === 408 || // Timeout (can retry)
             statusCode === 429;   // Rate limit (can wait and retry)
    }
    
    // Most 5xx errors are potentially recoverable
    return statusCode >= 500 && statusCode < 600;
  }

  /**
   * Determine if user can take action to fix the error
   */
  private isUserActionable(statusCode?: number, code?: ApiErrorCode): boolean {
    if (code === ApiErrorCode.NETWORK_ERROR) return true; // User can check connection
    if (code === ApiErrorCode.VALIDATION_ERROR) return true; // User can fix input
    
    if (!statusCode) return false;
    
    // Most 4xx errors are user actionable
    return statusCode >= 400 && statusCode < 500;
  }

  /**
   * Get suggested action for the user
   */
  private getSuggestedAction(code?: ApiErrorCode, statusCode?: number): string | undefined {
    switch (code) {
      case ApiErrorCode.UNAUTHORIZED:
        return 'Please log in again to continue.';
      case ApiErrorCode.FORBIDDEN:
        return 'You do not have permission for this action.';
      case ApiErrorCode.NETWORK_ERROR:
        return 'Please check your internet connection and try again.';
      case ApiErrorCode.TIMEOUT:
        return 'The request timed out. Please try again.';
      case ApiErrorCode.RATE_LIMITED:
        return 'You have made too many requests. Please wait a moment and try again.';
      case ApiErrorCode.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      default:
        if (statusCode && statusCode >= 500) {
          return 'There was a server error. Please try again later.';
        }
        return undefined;
    }
  }

  /**
   * Convert any error to an ApiError
   */
  static from(error: unknown, context?: ApiErrorContext): ApiError {
    // If it's already an ApiError, enhance it with additional context if provided
    if (error instanceof ApiError) {
      if (context) {
        return new ApiError(
          error.message,
          error.code,
          error.statusCode || context.statusCode,
          error.originalError,
          { ...error.context, ...context } as ApiErrorContext
        );
      }
      return error;
    }
    
    // Handle fetch Response objects
    if (error instanceof Response) {
      return new ApiError(
        `HTTP Error: ${error.status} ${error.statusText}`,
        ApiError.codeFromStatus(error.status),
        error.status,
        error,
        {
          ...context,
          statusCode: error.status,
          statusText: error.statusText,
          endpoint: error.url
        }
      );
    }
    
    // Handle standard errors
    if (error instanceof Error) {
      // Check for network errors
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        return new ApiError(
          'Network error: Unable to connect to the server',
          ApiErrorCode.NETWORK_ERROR,
          undefined,
          error,
          context
        );
      }
      
      // Check for abort errors
      if (error.name === 'AbortError') {
        return new ApiError(
          'Request was aborted',
          ApiErrorCode.ABORT_ERROR,
          undefined,
          error,
          context
        );
      }
      
      // Generic error conversion
      return new ApiError(
        error.message,
        ApiErrorCode.UNKNOWN,
        context?.statusCode,
        error,
        context
      );
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return new ApiError(
        error,
        ApiErrorCode.UNKNOWN,
        context?.statusCode,
        error,
        context
      );
    }
    
    // Handle unknown errors
    return new ApiError(
      'Unknown API error',
      ApiErrorCode.UNKNOWN,
      context?.statusCode,
      error,
      context
    );
  }

  /**
   * Convert HTTP status code to ApiErrorCode
   */
  static codeFromStatus(status: number): ApiErrorCode {
    switch (status) {
      case 400: return ApiErrorCode.BAD_REQUEST;
      case 401: return ApiErrorCode.UNAUTHORIZED;
      case 403: return ApiErrorCode.FORBIDDEN;
      case 404: return ApiErrorCode.NOT_FOUND;
      case 405: return ApiErrorCode.METHOD_NOT_ALLOWED;
      case 408: return ApiErrorCode.TIMEOUT;
      case 409: return ApiErrorCode.CONFLICT;
      case 412: return ApiErrorCode.PRECONDITION_FAILED;
      case 413: return ApiErrorCode.PAYLOAD_TOO_LARGE;
      case 429: return ApiErrorCode.RATE_LIMITED;
      case 500: return ApiErrorCode.INTERNAL_SERVER_ERROR;
      case 503: return ApiErrorCode.SERVICE_UNAVAILABLE;
      case 504: return ApiErrorCode.GATEWAY_TIMEOUT;
      default:
        if (status >= 400 && status < 500) return ApiErrorCode.BAD_REQUEST;
        if (status >= 500) return ApiErrorCode.INTERNAL_SERVER_ERROR;
        return ApiErrorCode.UNKNOWN;
    }
  }

  /**
   * Get the HTTP status category from a status code
   */
  static categoryFromStatus(status: number): HttpStatusCategory {
    if (status >= 100 && status < 200) return HttpStatusCategory.INFORMATIONAL;
    if (status >= 200 && status < 300) return HttpStatusCategory.SUCCESS;
    if (status >= 300 && status < 400) return HttpStatusCategory.REDIRECT;
    if (status >= 400 && status < 500) return HttpStatusCategory.CLIENT_ERROR;
    if (status >= 500 && status < 600) return HttpStatusCategory.SERVER_ERROR;
    return HttpStatusCategory.UNKNOWN;
  }
}
