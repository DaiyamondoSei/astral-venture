
import { supabase } from '@/lib/supabaseClient';

// Types for error reporting
export interface ErrorReportOptions {
  componentStack?: string;
  userId?: string;
  source?: 'react-error-boundary' | 'try-catch' | 'promise-rejection' | 'api-error';
  severity?: 'critical' | 'error' | 'warning' | 'info';
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// List of known error messages that should not be reported
const ignoredErrors = [
  'Network request failed',
  'Failed to fetch',
  'Load failed',
  'The user aborted a request',
  'User denied transaction signature',
  'User rejected the request',
  'Extension context invalidated',
  'ResizeObserver loop limit exceeded'
];

/**
 * Determines if an error should be ignored based on its message
 */
function shouldIgnoreError(error: Error): boolean {
  if (!error.message) return false;
  
  return ignoredErrors.some(ignored => error.message.includes(ignored));
}

/**
 * Sanitizes error data to remove sensitive information
 */
function sanitizeErrorData(error: Error, options?: ErrorReportOptions): Record<string, unknown> {
  // Basic error information
  const sanitized: Record<string, unknown> = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...options
  };
  
  // Remove potentially sensitive data
  if (sanitized.metadata) {
    const metadata = { ...sanitized.metadata as Record<string, unknown> };
    
    // Remove known sensitive fields
    ['password', 'token', 'secret', 'apiKey', 'authorization', 'authToken'].forEach(field => {
      if (field in metadata) {
        metadata[field] = '[REDACTED]';
      }
    });
    
    sanitized.metadata = metadata;
  }
  
  return sanitized;
}

/**
 * Reports an error to our error tracking system
 */
export async function reportError(
  error: Error | unknown,
  options?: ErrorReportOptions
): Promise<void> {
  // Convert unknown errors to Error objects
  const errorObject = error instanceof Error ? error : new Error(String(error));
  
  // Skip ignored errors
  if (shouldIgnoreError(errorObject)) {
    console.debug('[Error ignored]', errorObject.message);
    return;
  }
  
  try {
    // In development, always log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Report]', errorObject, options);
    }
    
    // Get user ID if available
    let userId = options?.userId;
    if (!userId) {
      // Try to get user ID from session
      const { data } = await supabase.auth.getSession();
      userId = data?.session?.user?.id;
    }
    
    // Prepare the error data
    const errorData = sanitizeErrorData(errorObject, options);
    
    // Send to Supabase error logging table
    await supabase
      .from('error_logs')
      .insert({
        error_message: errorObject.message,
        error_name: errorObject.name,
        error_stack: errorObject.stack,
        user_id: userId,
        component_stack: options?.componentStack,
        source: options?.source || 'unknown',
        severity: options?.severity || 'error',
        tags: options?.tags || [],
        metadata: errorData.metadata || {},
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        created_at: new Date().toISOString()
      });
    
    // Here you would also send to external error tracking services if needed
    // For example, Sentry, LogRocket, etc.
    
  } catch (reportingError) {
    // Avoid infinite loops if error reporting itself fails
    console.error('[Error Reporting Failed]', reportingError);
  }
}

/**
 * Creates an error handler that can be used in catch blocks
 */
export function createErrorHandler(
  source: ErrorReportOptions['source'], 
  defaultOptions?: Omit<ErrorReportOptions, 'source'>
) {
  return (error: Error | unknown, additionalOptions?: Omit<ErrorReportOptions, 'source'>) => {
    return reportError(error, {
      source,
      ...defaultOptions,
      ...additionalOptions
    });
  };
}

// Set up global error handlers
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;
  
  // Handle uncaught promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, {
      source: 'promise-rejection',
      severity: 'critical'
    });
  });
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      source: 'try-catch',
      severity: 'critical',
      metadata: {
        fileName: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno
      }
    });
  });
}
