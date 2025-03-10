
import { supabase } from '@/lib/supabaseClient'; 

interface ErrorMetadata {
  componentName?: string;
  operationName?: string;
  userId?: string;
  additionalContext?: Record<string, unknown>;
  severity?: 'error' | 'warning' | 'info';
  tags?: string[];
}

interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  operationName?: string;
  userId?: string;
  context?: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
  tags: string[];
  timestamp: string;
  environment: string;
  browserInfo?: Record<string, unknown>;
}

/**
 * Centralized error reporting system
 * 
 * Captures and reports errors to appropriate channels with context
 */
export function captureException(
  error: Error | unknown,
  errorInfo?: React.ErrorInfo,
  metadata?: ErrorMetadata
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const componentStack = errorInfo?.componentStack;
  
  // Create structured error report
  const errorReport: ErrorReport = {
    message: errorMessage,
    stack: errorStack,
    componentName: metadata?.componentName,
    operationName: metadata?.operationName,
    userId: metadata?.userId || getCurrentUserId(),
    context: {
      ...metadata?.additionalContext,
      componentStack,
    },
    severity: metadata?.severity || 'error',
    tags: metadata?.tags || [],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    browserInfo: getBrowserInfo(),
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', errorReport);
  }
  
  // Send to error tracking service
  void reportErrorToService(errorReport);
}

/**
 * Get the current user ID if available
 */
function getCurrentUserId(): string | undefined {
  try {
    const session = supabase.auth.session();
    return session?.user?.id;
  } catch (e) {
    return undefined;
  }
}

/**
 * Get browser and environment information
 */
function getBrowserInfo(): Record<string, unknown> {
  try {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      url: window.location.href,
      referrer: document.referrer,
    };
  } catch (e) {
    return {};
  }
}

/**
 * Report error to backend service
 */
async function reportErrorToService(errorReport: ErrorReport): Promise<void> {
  try {
    // In a real implementation, this would send to your error tracking service
    // For now, we'll just log it in development and store in Supabase in production
    if (process.env.NODE_ENV === 'production') {
      await supabase
        .from('error_logs')
        .insert({
          message: errorReport.message,
          stack: errorReport.stack,
          component_name: errorReport.componentName,
          operation_name: errorReport.operationName,
          user_id: errorReport.userId,
          context: errorReport.context,
          severity: errorReport.severity,
          tags: errorReport.tags,
          browser_info: errorReport.browserInfo
        });
    }
  } catch (e) {
    // Avoid infinite loops by not reporting errors in the error reporter
    console.error('Failed to report error:', e);
  }
}

/**
 * Create a function-specific error reporter
 */
export function createErrorReporter(defaultMetadata: ErrorMetadata) {
  return (error: Error | unknown, additionalMetadata?: ErrorMetadata) => {
    captureException(error, undefined, {
      ...defaultMetadata,
      ...additionalMetadata,
      additionalContext: {
        ...defaultMetadata.additionalContext,
        ...additionalMetadata?.additionalContext,
      },
      tags: [
        ...(defaultMetadata.tags || []),
        ...(additionalMetadata?.tags || []),
      ],
    });
  };
}

/**
 * Higher-order function that adds error reporting to any async function
 */
export function withErrorReporting<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metadata: ErrorMetadata
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, undefined, {
        ...metadata,
        additionalContext: {
          ...metadata.additionalContext,
          functionArgs: args,
        },
      });
      throw error;
    }
  }) as T;
}

export default {
  captureException,
  createErrorReporter,
  withErrorReporting,
};
