
/**
 * Shared request handler utilities for edge functions
 */

import { createErrorResponse, ErrorCode, logEvent } from "./responseUtils.ts";

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  logToConsole?: boolean;
  includeDetails?: boolean;
  context?: string;
}

/**
 * Safely handle an Edge Function request with proper error handling
 * 
 * @param req The request object
 * @param handlerFn The handler function
 * @param options Error handling options
 * @returns Response
 */
export async function safelyHandleRequest(
  req: Request,
  handlerFn: (req: Request) => Promise<Response>,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  try {
    // Process the request
    return await handlerFn(req);
  } catch (error) {
    // Log the error
    if (options.logToConsole !== false) {
      console.error("Edge function error:", error);
    }
    
    // Extract error details
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred";
    
    // Get appropriate status code
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as any).statusCode
      : 500;
    
    // Include error details if specified
    const errorDetails = options.includeDetails && error instanceof Error
      ? { stack: error.stack, name: error.name }
      : null;
    
    // Log the error event
    logEvent("error", `Request handler error${options.context ? ` in ${options.context}` : ''}`, {
      message: errorMessage,
      statusCode,
      ...(errorDetails ? { details: errorDetails } : {})
    });
    
    // Return standardized error response
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      errorMessage,
      errorDetails,
      statusCode
    );
  }
}

/**
 * Create a timed handler that tracks execution time
 * 
 * @param handlerFn The handler function
 * @param operationName Name of the operation for logging
 * @returns Handler with timing
 */
export function createTimedHandler(
  handlerFn: (req: Request, startTime: number) => Promise<Response>,
  operationName: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    
    try {
      // Execute the handler with the start time
      const response = await handlerFn(req, startTime);
      
      // Calculate execution time
      const executionTime = performance.now() - startTime;
      
      // Log the timing information
      logEvent("info", `${operationName} completed`, {
        executionTimeMs: executionTime.toFixed(2),
        success: true
      });
      
      return response;
    } catch (error) {
      // Calculate execution time on error
      const executionTime = performance.now() - startTime;
      
      // Log the error with timing information
      logEvent("error", `${operationName} failed`, {
        executionTimeMs: executionTime.toFixed(2),
        error: error instanceof Error ? error.message : String(error),
        success: false
      });
      
      // Re-throw the error for the caller to handle
      throw error;
    }
  };
}
