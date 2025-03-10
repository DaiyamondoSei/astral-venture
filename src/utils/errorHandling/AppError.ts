
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
  VALIDATION = 'validation',
  DATA = 'data',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
  UNEXPECTED = 'unexpected'
}

/**
 * Standard application error structure
 */
export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  userMessage: string;
  suggestedAction?: string;
  context?: Record<string, unknown>;
  originalError?: any;
  stack?: string;
  timestamp: string;
  errorId: string;
  field?: string;
  path?: string[];
  retry?: boolean;
  retryAfter?: number;
  handled: boolean;
}

interface AppErrorOptions {
  code?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  userMessage?: string;
  suggestedAction?: string;
  context?: Record<string, unknown>;
  originalError?: any;
  field?: string;
  path?: string[];
  retry?: boolean;
  retryAfter?: number;
}

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `err_${timestamp}_${randomPart}`;
}

/**
 * Create a standardized application error from any error
 */
export function createAppError(error: unknown, options: AppErrorOptions = {}): AppError {
  // Extract error message from various error types
  let errorMessage = 'An unknown error occurred';
  let errorStack: string | undefined;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else if ('error' in error && typeof error.error === 'string') {
      errorMessage = error.error;
    }
  }
  
  // Determine error category and severity based on error or context
  let category = options.category || ErrorCategory.UNEXPECTED;
  let severity = options.severity || ErrorSeverity.ERROR;
  
  // For network-related errors
  if (error instanceof TypeError && errorMessage.includes('network')) {
    category = ErrorCategory.NETWORK;
  }
  
  // For validation errors
  if (error instanceof Error && 'isValidationError' in error) {
    category = ErrorCategory.VALIDATION;
    severity = ErrorSeverity.WARNING;
  }
  
  // For authentication errors
  if (errorMessage.toLowerCase().includes('auth') || 
      errorMessage.toLowerCase().includes('permission') ||
      errorMessage.toLowerCase().includes('token')) {
    category = ErrorCategory.AUTHENTICATION;
  }
  
  // Create the standardized error
  return {
    message: errorMessage,
    code: options.code,
    severity: severity,
    category: category,
    userMessage: options.userMessage || errorMessage,
    suggestedAction: options.suggestedAction,
    context: options.context || {},
    originalError: error,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    errorId: generateErrorId(),
    field: options.field,
    path: options.path,
    retry: options.retry || false,
    retryAfter: options.retryAfter,
    handled: false
  };
}
