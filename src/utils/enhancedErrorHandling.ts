
import { toast } from '@/components/ui/use-toast';

// Error categories for better organization
export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  DATA = 'data',
  UI = 'ui',
  RUNTIME = 'runtime',
  UNKNOWN = 'unknown'
}

// Error context interface for structured error reporting
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Enhanced error with additional metadata
export class EnhancedError extends Error {
  category: ErrorCategory;
  context: ErrorContext;
  timestamp: number;
  isFatal: boolean;
  
  constructor(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: ErrorContext = {},
    isFatal: boolean = false
  ) {
    super(message);
    this.name = 'EnhancedError';
    this.category = category;
    this.context = context;
    this.timestamp = Date.now();
    this.isFatal = isFatal;
  }
}

// Main error handler that can be used by ErrorBoundaries
export class ErrorHandler {
  static handle(
    error: unknown, 
    context: ErrorContext = {},
    showToast: boolean = true
  ): void {
    // Convert standard errors to enhanced errors
    const enhancedError = error instanceof EnhancedError
      ? error
      : new EnhancedError(
          error instanceof Error ? error.message : String(error),
          ErrorCategory.UNKNOWN,
          context
        );
    
    // Log the error
    console.error(
      `[${enhancedError.category}] Error in ${context.component || 'unknown'}:`,
      enhancedError.message,
      { context: enhancedError.context, timestamp: enhancedError.timestamp }
    );
    
    // Show toast notification if requested
    if (showToast) {
      toast({
        title: `Error in ${context.component || 'application'}`,
        description: enhancedError.message.length > 100
          ? `${enhancedError.message.substring(0, 100)}...`
          : enhancedError.message,
        variant: "destructive"
      });
    }
    
    // Here you could add reporting to error monitoring services
    // like Sentry, LogRocket, etc.
  }
  
  static createErrorReporter(defaultContext: ErrorContext) {
    return (error: unknown, additionalContext: Partial<ErrorContext> = {}) => {
      this.handle(
        error,
        { ...defaultContext, ...additionalContext }
      );
    };
  }
}

// Helper function to categorize network errors
export function categorizeNetworkError(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;
  
  // Check for network connectivity issues
  if (
    error.message && (
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('offline') ||
      error.message.includes('timeout')
    )
  ) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for authentication issues
  if (
    error.status === 401 ||
    error.status === 403 ||
    (error.message && (
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden') ||
      error.message.includes('permission')
    ))
  ) {
    return ErrorCategory.AUTH;
  }
  
  // Check for data-related issues
  if (
    error.status === 404 ||
    error.status === 400 ||
    error.status === 422 ||
    (error.message && (
      error.message.includes('not found') ||
      error.message.includes('validation') ||
      error.message.includes('invalid')
    ))
  ) {
    return ErrorCategory.DATA;
  }
  
  return ErrorCategory.UNKNOWN;
}

// Function to log structured errors for analytics
export function logErrorForAnalytics(
  category: string, 
  context: Record<string, any>, 
  friendlyMessage: string
): void {
  console.info(`[ErrorAnalytics] ${category}: ${friendlyMessage}`, context);
  
  // Here you would typically send this to your analytics service
  // For now, we just log it to the console
}
