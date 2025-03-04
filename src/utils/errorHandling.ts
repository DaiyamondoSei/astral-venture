
import { toast } from '@/hooks/use-toast';

/**
 * ErrorHandlingUtils
 * 
 * Provides consistent error handling mechanisms for the application.
 */

/**
 * Safely handles asynchronous operations with consistent error handling
 * @param asyncFn - The async function to execute
 * @param errorMessage - Default error message to show on failure
 * @returns A promise with the result or null if there was an error
 */
export const tryCatchAsync = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = "An unexpected error occurred"
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error: any) {
    const message = error.message || errorMessage;
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
    
    console.error(`Error in async operation: ${message}`, error);
    return null;
  }
};

/**
 * Creates a wrapped version of a function that includes error handling
 * @param fn - The function to wrap with error handling
 * @param errorMessage - Default error message to show on failure
 * @returns The wrapped function with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorMessage: string = "An unexpected error occurred"
): ((...args: Parameters<T>) => ReturnType<T> | null) => {
  return (...args: Parameters<T>): ReturnType<T> | null => {
    try {
      return fn(...args);
    } catch (error: any) {
      const message = error.message || errorMessage;
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      
      console.error(`Error in function: ${message}`, error);
      return null;
    }
  };
};
