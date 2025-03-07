
import { toast } from '@/components/ui/use-toast';

/**
 * Utility function to handle errors consistently across the application
 * @param error The error to handle
 * @param context Additional context about where the error occurred
 * @param showToast Whether to show a toast notification
 */
export function handleError(error: unknown, context: string, showToast = true): void {
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Log error with context
  console.error(`Error in ${context}:`, error);
  
  // Show toast if requested
  if (showToast) {
    toast({
      title: `Error in ${context}`,
      description: errorMessage.length > 100 
        ? `${errorMessage.substring(0, 100)}...` 
        : errorMessage,
      variant: "destructive"
    });
  }
}

/**
 * Utility to create a safe async function that catches errors
 * @param fn The async function to wrap
 * @param context Context for error reporting
 * @param showToast Whether to show toast on error
 * @returns The wrapped function that won't throw
 */
export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  showToast = true
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, showToast);
      return null;
    }
  };
}
