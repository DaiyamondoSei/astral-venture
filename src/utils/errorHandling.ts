
import { toast } from '@/components/ui/use-toast';
import { ValidationError } from './typeValidation';

/**
 * Error severity levels for different types of errors
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',  // Application-breaking errors
  ERROR = 'error',        // Standard errors that prevent functionality
  WARNING = 'warning',    // Issues that don't break functionality but need attention
  INFO = 'info',          // Informational errors for logging purposes
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',       // Input validation failures
  NETWORK = 'network',            // API/network related errors
  AUTHENTICATION = 'authentication', // Auth errors
  AUTHORIZATION = 'authorization',  // Permission errors
  DATA_PROCESSING = 'data_processing', // Data handling errors
  RENDERING = 'rendering',         // UI rendering errors
  RESOURCE = 'resource',           // Resource loading errors
  UNEXPECTED = 'unexpected',       // Unexpected errors
  BOUNDARY = 'boundary',           // Error boundary catches
}

/**
 * Options for error handling configuration
 */
export interface ErrorHandlingOptions {
  /** Context where the error occurred for better tracking */
  context: string;
  /** Whether to show a toast notification to the user */
  showToast?: boolean;
  /** Severity level of the error */
  severity?: ErrorSeverity;
  /** Category of the error */
  category?: ErrorCategory;
  /** Custom error message to display instead of the original one */
  customMessage?: string;
  /** Whether to include the stack trace in the console output */
  includeStack?: boolean;
  /** Additional metadata to log with the error */
  metadata?: Record<string, any>;
  /** User-facing action that can be taken to resolve the error */
  recoveryAction?: {
    label: string;
    action: () => void;
  };
}

/**
 * Structured error object with additional context
 */
export interface StructuredError extends Error {
  /** Original error object if this is a wrapped error */
  originalError?: Error;
  /** Error category for classification */
  category?: ErrorCategory;
  /** Severity level of the error */
  severity?: ErrorSeverity;
  /** Context where the error occurred */
  context?: string;
  /** Additional data related to the error */
  metadata?: Record<string, any>;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Timestamp when the error occurred */
  timestamp: Date;
}

/**
 * Create a structured error object with additional context
 * @param error Original error or message
 * @param options Options for the structured error
 * @returns A structured error object
 */
export function createStructuredError(
  error: unknown,
  options: Omit<ErrorHandlingOptions, 'showToast' | 'includeStack'>
): StructuredError {
  const { 
    context, 
    severity = ErrorSeverity.ERROR,
    category = ErrorCategory.UNEXPECTED,
    customMessage,
    metadata 
  } = options;

  // Extract error details
  let errorMessage = 'An unknown error occurred';
  let errorStack = '';
  let originalError: Error | undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || '';
    originalError = error;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error !== null && typeof error === 'object') {
    errorMessage = String(error);
  }

  // Use custom message if provided
  const message = customMessage || errorMessage;

  // Create structured error
  const structuredError = new Error(message) as StructuredError;
  structuredError.originalError = originalError;
  structuredError.category = category;
  structuredError.severity = severity;
  structuredError.context = context;
  structuredError.metadata = metadata;
  structuredError.timestamp = new Date();
  
  // Preserve stack trace if available
  if (errorStack) {
    structuredError.stack = errorStack;
  }

  return structuredError;
}

/**
 * Determine error category based on error type
 * @param error The error to categorize
 * @returns The appropriate error category
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof ValidationError || 
     (error instanceof Error && error.message.toLowerCase().includes('validation'))) {
    return ErrorCategory.VALIDATION;
  }
  
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();
    
    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('api') ||
      errorMessage.includes('request') ||
      errorName.includes('network')
    ) {
      return ErrorCategory.NETWORK;
    }
    
    // Auth errors
    if (
      errorMessage.includes('auth') ||
      errorMessage.includes('login') ||
      errorMessage.includes('unauthorized') ||
      errorName.includes('auth')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    // Permission errors
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('access denied')
    ) {
      return ErrorCategory.AUTHORIZATION;
    }

    // Rendering errors
    if (
      errorMessage.includes('render') ||
      errorMessage.includes('component') ||
      errorMessage.includes('element') ||
      errorName.includes('react')
    ) {
      return ErrorCategory.RENDERING;
    }
    
    // Resource errors
    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('resource') ||
      errorMessage.includes('load') ||
      errorMessage.includes('file')
    ) {
      return ErrorCategory.RESOURCE;
    }
  }
  
  return ErrorCategory.UNEXPECTED;
}

/**
 * Centralized error handler for consistent error handling across the application
 * @param error The error object or message string
 * @param options Options for handling the error or a string representing the context
 * @returns The structured error that was processed
 */
export const handleError = (
  error: unknown,
  options: ErrorHandlingOptions | string
): StructuredError => {
  // Normalize options
  const opts: ErrorHandlingOptions = typeof options === 'string' 
    ? { context: options } 
    : options;
  
  const {
    context,
    showToast = true,
    severity = ErrorSeverity.ERROR,
    category: explicitCategory,
    customMessage,
    includeStack = true,
    metadata = {},
    recoveryAction,
  } = opts;

  // Determine error category if not explicitly provided
  const category = explicitCategory || categorizeError(error);
  
  // Create structured error
  const structuredError = createStructuredError(error, {
    context,
    severity,
    category,
    customMessage,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });

  // Extract error details for logging
  const errorMessage = structuredError.message;
  const errorStack = structuredError.stack || '';

  // Log to console based on severity
  const prefix = `[${severity.toUpperCase()}] [${category}] Error in ${context}:`;
  
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error(prefix, includeStack ? structuredError : errorMessage);
      break;
    case ErrorSeverity.WARNING:
      console.warn(prefix, includeStack ? structuredError : errorMessage);
      break;
    case ErrorSeverity.INFO:
      console.info(prefix, includeStack ? structuredError : errorMessage);
      break;
    default:
      console.error(prefix, includeStack ? structuredError : errorMessage);
  }

  // Show toast notification if enabled
  if (showToast) {
    // Truncate long error messages for toast
    const truncatedMessage = errorMessage.length > 100 
      ? `${errorMessage.substring(0, 100)}...` 
      : errorMessage;
    
    const toastVariant = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR 
      ? 'destructive' 
      : severity === ErrorSeverity.WARNING 
        ? 'warning'
        : 'default';

    toast({
      title: getErrorTitleByCategory(category, context),
      description: truncatedMessage,
      variant: toastVariant,
      duration: severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
      action: recoveryAction ? {
        label: recoveryAction.label,
        onClick: recoveryAction.action
      } : undefined,
    });
  }

  return structuredError;
};

/**
 * Get appropriate error title based on category
 */
function getErrorTitleByCategory(category: ErrorCategory, context: string): string {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return `Validation Error in ${context}`;
    case ErrorCategory.NETWORK:
      return `Network Error`;
    case ErrorCategory.AUTHENTICATION:
      return `Authentication Error`;
    case ErrorCategory.AUTHORIZATION:
      return `Permission Denied`;
    case ErrorCategory.DATA_PROCESSING:
      return `Data Processing Error`;
    case ErrorCategory.RENDERING:
      return `Display Error in ${context}`;
    case ErrorCategory.RESOURCE:
      return `Resource Error`;
    case ErrorCategory.BOUNDARY:
      return `Component Error in ${context}`;
    case ErrorCategory.UNEXPECTED:
    default:
      return `Error in ${context}`;
  }
}

/**
 * Create a safe async function that handles errors internally
 * @param fn The async function to wrap
 * @param options Error handling options or context string
 * @returns A wrapped function that catches errors
 */
export const createSafeAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlingOptions | string,
  fallbackValue: ReturnType<T> | null = null
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> => {
  // Normalize options
  const opts: ErrorHandlingOptions & { 
    retry?: () => Promise<void>; 
    maxRetries?: number; 
  } = typeof options === 'string' ? { context: options } : { ...options };

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Try to retry the operation if configured
      if (opts.retry && opts.maxRetries && opts.maxRetries > 0) {
        let retryCount = 0;
        
        while (retryCount < opts.maxRetries) {
          try {
            retryCount++;
            console.info(`Retrying operation (${retryCount}/${opts.maxRetries})...`);
            // Wait for retry operation (e.g., refreshing tokens)
            await opts.retry();
            // Try the original function again
            return await fn(...args);
          } catch (retryError) {
            // Last retry failed, give up
            if (retryCount >= opts.maxRetries) {
              handleError(error, {
                ...opts,
                metadata: {
                  ...opts.metadata,
                  retriesAttempted: retryCount,
                  args: JSON.stringify(args),
                }
              });
              return fallbackValue;
            }
          }
        }
      }
      
      handleError(error, opts);
      return fallbackValue;
    }
  };
};

/**
 * Create a safe synchronous function that handles errors internally
 * @param fn The function to wrap
 * @param options Error handling options or context string
 * @returns A wrapped function that catches errors
 */
export const createSafeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  options: ErrorHandlingOptions | string,
  fallbackValue: ReturnType<T> | null = null
): (...args: Parameters<T>) => ReturnType<T> | null => {
  return (...args: Parameters<T>): ReturnType<T> | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, options);
      return fallbackValue;
    }
  };
};

/**
 * Enhanced React Error Boundary component props
 */
export interface ErrorBoundaryProps {
  /** Child components that might throw errors */
  children: React.ReactNode;
  /** Component to render when an error occurs */
  fallback: React.ReactNode | ((error: Error, resetError: () => void) => React.ReactNode);
  /** Function to call when an error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Error boundary key to force remounting */
  resetKey?: any;
}

/**
 * Process standard API response with error handling
 * @param response The fetch Response object
 * @param context Context for error reporting
 * @returns Parsed JSON response
 * @throws Error if the response is not OK with detailed information
 */
export async function processApiResponse<T>(
  response: Response, 
  context: string
): Promise<T> {
  if (!response.ok) {
    // Try to parse error details from response
    let errorDetails: any = {};
    try {
      errorDetails = await response.json();
    } catch (e) {
      // If we can't parse JSON, use text content
      try {
        errorDetails = { message: await response.text() };
      } catch (textError) {
        // If we can't get text either, use status
        errorDetails = { message: `HTTP error ${response.status}` };
      }
    }

    // Create structured error with HTTP details
    const error = createStructuredError(
      new Error(errorDetails.message || `API request failed with status ${response.status}`),
      {
        context,
        category: ErrorCategory.NETWORK,
        severity: 
          response.status >= 500 ? ErrorSeverity.ERROR :
          response.status === 401 ? ErrorSeverity.WARNING :
          response.status === 403 ? ErrorSeverity.WARNING :
          ErrorSeverity.ERROR,
        metadata: {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorDetails
        }
      }
    );

    // Add status code for specific handling
    error.statusCode = response.status;
    
    throw error;
  }

  return await response.json() as T;
}
