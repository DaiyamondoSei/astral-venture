
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
  USER_INTERFACE = 'user_interface',
  TYPE_ERROR = 'type_error',    // Added for type errors
  CONSTRAINT_ERROR = 'constraint_error'  // Added for constraint violations
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
  /** Whether to throw the error after handling */
  rethrow?: boolean;
  /** Whether this is a validation error */
  isValidation?: boolean;
  /** Whether to include validation details in toast */
  includeValidationDetails?: boolean;
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
 * Determine error category from error type
 */
function determineErrorCategory(error: unknown): ErrorCategory {
  if (isValidationError(error)) {
    if (error.rule === 'type-check') {
      return ErrorCategory.TYPE_ERROR;
    }
    if (error.rule === 'required' || error.rule?.includes('min') || error.rule?.includes('max') || error.rule === 'pattern') {
      return ErrorCategory.CONSTRAINT_ERROR;
    }
    return ErrorCategory.VALIDATION;
  }
  
  if (error instanceof TypeError) {
    return ErrorCategory.TYPE_ERROR;
  }
  
  if (error instanceof SyntaxError) {
    return ErrorCategory.DATA_PROCESSING;
  }
  
  if (error instanceof ReferenceError) {
    return ErrorCategory.UNEXPECTED;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle fetch errors
    if ('status' in error && 'statusText' in error) {
      return ErrorCategory.NETWORK;
    }
    
    // Handle authentication errors
    if ('code' in error && typeof error.code === 'string' && 
        (error.code.includes('auth') || error.code.includes('permission'))) {
      return ErrorCategory.AUTHENTICATION;
    }
  }
  
  return ErrorCategory.UNEXPECTED;
}

/**
 * Determine error severity based on category
 */
function determineErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.ERROR;
    
    case ErrorCategory.VALIDATION:
    case ErrorCategory.USER_INPUT:
    case ErrorCategory.CONSTRAINT_ERROR:
      return ErrorSeverity.WARNING;
    
    case ErrorCategory.UNEXPECTED:
    case ErrorCategory.TYPE_ERROR:
      return ErrorSeverity.CRITICAL;
    
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Format validation details for display
 */
function formatValidationDetails(error: ValidationError): string {
  if (error.details) {
    return error.details;
  }
  
  if (error.rule === 'type-check') {
    return `Expected ${error.expectedType}, received ${typeof error.originalError}`;
  }
  
  if (error.rule === 'required') {
    return 'This field is required';
  }
  
  if (error.rule?.includes('min')) {
    return `Value is below the minimum allowed`;
  }
  
  if (error.rule?.includes('max')) {
    return `Value exceeds the maximum allowed`;
  }
  
  return '';
}

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
  
  // Determine error category if not specified
  if (!opts.category) {
    opts.category = determineErrorCategory(error);
  }
  
  // Determine severity if not specified
  if (!opts.severity) {
    opts.severity = determineErrorSeverity(opts.category);
  }
  
  // Extract error details
  let errorMessage = 'An unknown error occurred';
  let errorDetails: string | undefined;
  let statusCode = 500;
  let fieldName: string | undefined;
  
  if (isValidationError(error)) {
    errorMessage = error.message;
    errorDetails = formatValidationDetails(error);
    statusCode = error.statusCode || 400;
    fieldName = error.field;
    
    // Mark as validation error
    opts.isValidation = true;
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
      metadata: {
        ...opts.metadata,
        field: fieldName
      }
    }
  );
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const toastType = opts.severity === ErrorSeverity.CRITICAL || opts.severity === ErrorSeverity.ERROR
      ? 'error'
      : opts.severity === ErrorSeverity.WARNING
        ? 'warning'
        : 'info';
    
    const description = opts.isValidation && opts.includeValidationDetails && errorDetails
      ? errorDetails
      : opts.context 
        ? `Error in ${opts.context}` 
        : undefined;
    
    toast[toastType](displayMessage, {
      description,
      position: 'bottom-right'
    });
  }
  
  // Call custom error handler if provided
  if (opts.onError) {
    opts.onError(error);
  }
  
  // Rethrow the error if requested
  if (opts.rethrow) {
    throw error;
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
    
    // Create validation error with API details
    const error = ValidationError.fromApiError(
      errorMessage,
      response.status,
      errorData
    );
    
    // Handle the error with our error handling system
    handleError(error, {
      ...opts,
      category: ErrorCategory.NETWORK,
      metadata: {
        status: response.status,
        url: response.url,
        errorData
      },
      rethrow: true
    });
  }
  
  return response.json();
}

/**
 * Validate data against a schema and handle validation errors
 * 
 * @param data - Data to validate
 * @param validator - Validation function
 * @param options - Error handling options
 * @returns Validated data
 */
export function validateData<T>(
  data: unknown,
  validator: (data: unknown) => T,
  options: ErrorHandlingOptions = {}
): T {
  try {
    return validator(data);
  } catch (error) {
    handleError(error, {
      ...options,
      category: ErrorCategory.VALIDATION,
      isValidation: true,
      includeValidationDetails: true,
      rethrow: true
    });
    
    // This will never execute due to rethrow, but TypeScript requires a return
    throw error;
  }
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
  validateData,
  captureException,
  ErrorSeverity,
  ErrorCategory
};
