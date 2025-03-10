import { toast } from 'sonner';
import { ValidationError, isValidationError } from './validation/ValidationError';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_PROCESSING = 'data_processing',
  USER_INPUT = 'user_input',
  PERFORMANCE = 'performance',
  UNEXPECTED = 'unexpected',
  RESOURCE = 'resource',
  VALIDATION = 'validation',
  USER_INTERFACE = 'user_interface'
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error category */
  category?: ErrorCategory;
  /** Context where the error occurred */
  context?: string;
  /** Custom error message to display */
  customMessage?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Additional metadata for logging */
  metadata?: Record<string, unknown>;
  /** Optional callback for custom error handling */
  onError?: (error: unknown) => void;
  /** Whether to retry the operation */
  retry?: boolean;
  /** Optional retry count */
  retryCount?: number;
  /** Optional retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * Default error handling options
 */
const defaultOptions: ErrorHandlingOptions = {
  severity: ErrorSeverity.ERROR,
  category: ErrorCategory.UNEXPECTED,
  showToast: true
};

/**
 * Centralized error handler
 * 
 * @param error - The error that occurred
 * @param options - Error handling options
 */
export function handleError(
  error: unknown,
  options: ErrorHandlingOptions | string = {}
): void {
  // Convert string context to options object
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { ...defaultOptions, context: options }
    : { ...defaultOptions, ...options };
  
  // Extract error details
  let errorMessage = 'An unknown error occurred';
  let errorDetails: string | undefined;
  let statusCode = 500;
  
  if (isValidationError(error)) {
    errorMessage = error.message;
    errorDetails = error.toString();
    statusCode = error.statusCode || 400;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  // Use custom message if provided
  const displayMessage = opts.customMessage ?? errorMessage;
  
  // Log error with contextual information
  console.error(
    `[${opts.severity?.toUpperCase() ?? 'ERROR'}] [${opts.category}]`,
    opts.context ? `(${opts.context})` : '',
    errorMessage,
    {
      details: errorDetails,
      metadata: opts.metadata
    }
  );
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const toastType = opts.severity === ErrorSeverity.CRITICAL || opts.severity === ErrorSeverity.ERROR
      ? 'error'
      : opts.severity === ErrorSeverity.WARNING
        ? 'warning'
        : 'info';
    
    toast[toastType](displayMessage, {
      description: opts.context ? `Error in ${opts.context}` : undefined,
      position: 'bottom-right'
    });
  }
  
  // Call custom error handler if provided
  if (opts.onError) {
    opts.onError(error);
  }
}

/**
 * Create a safe async function that catches and handles errors
 * 
 * @param fn - The function to wrap
 * @param options - Error handling options
 * @returns A wrapped function that handles errors
 */
export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions | string = {}
): (...args: T) => Promise<R | undefined> {
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { context: options }
    : options;
    
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, opts);
      return undefined;
    }
  };
}

/**
 * Create a safe function that catches and handles errors
 * 
 * @param fn - The function to wrap
 * @param options - Error handling options
 * @returns A wrapped function that handles errors
 */
export function createSafeFunction<T extends any[], R>(
  fn: (...args: T) => R,
  options: ErrorHandlingOptions | string = {}
): (...args: T) => R | undefined {
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { context: options }
    : options;
    
  return (...args: T): R | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, opts);
      return undefined;
    }
  };
}

/**
 * Process API response with error handling
 * 
 * @param response - Fetch response object
 * @param errorOptions - Error handling options
 * @returns Parsed response data
 * @throws Error if response is not OK
 */
export async function processApiResponse<T>(
  response: Response,
  errorOptions: ErrorHandlingOptions | string = {}
): Promise<T> {
  const opts: ErrorHandlingOptions = typeof errorOptions === 'string' 
    ? { context: errorOptions }
    : errorOptions;
    
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse JSON, just use status text
      errorData = { error: response.statusText };
    }
    
    const errorMessage = errorData?.error ?? errorData?.message ?? `API error: ${response.status}`;
    
    // Create error with API details
    const error = new Error(errorMessage);
    
    // Add response details to error
    Object.assign(error, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData
    });
    
    // Handle the error with our error handling system
    handleError(error, {
      ...opts,
      category: ErrorCategory.NETWORK,
      metadata: {
        status: response.status,
        url: response.url,
        errorData
      }
    });
    
    throw error;
  }
  
  return response.json();
}

/**
 * Capture and report an exception to monitoring systems
 * 
 * @param error - The error to capture
 * @param context - Optional context information
 */
export function captureException(error: unknown, context?: string): void {
  // In a real app, this would send to a monitoring service like Sentry
  console.error('EXCEPTION CAPTURED:', context ? `[${context}]` : '', error);
  
  // Here we would integrate with external error tracking
  // Example: Sentry.captureException(error, { extra: { context } });
}

export default {
  handleError,
  createSafeAsyncFunction,
  createSafeFunction,
  processApiResponse,
  captureException,
  ErrorSeverity,
  ErrorCategory
};
