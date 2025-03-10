
/**
 * Shared Edge Function Utilities
 * This file contains common utilities for Supabase Edge Functions
 */

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Standard response types
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Handle CORS preflight requests
 * @param req Request object
 * @returns Response or null if not a preflight request
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Create a success response with standardized format
 * @param data Response data
 * @returns Formatted Response
 */
export function createSuccessResponse<T>(data: T): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Create an error response with standardized format
 * @param error Error details
 * @param status HTTP status code
 * @returns Formatted Response
 */
export function createErrorResponse(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Extract and verify authorization token from request
 * @param req Request object
 * @returns Token or null if not present/valid
 */
export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
}

/**
 * Log structured information
 * @param level Log level
 * @param message Message to log
 * @param data Additional data
 */
export function logMessage(
  level: LogLevel = LogLevel.INFO,
  message: string,
  options: {
    context?: string;
    requestId?: string;
    userId?: string;
    duration?: number;
    data?: Record<string, unknown>;
    error?: Error;
  } = {}
): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...options
  };
  
  // Add error details if provided
  if (options.error) {
    logEntry.error = {
      message: options.error.message,
      stack: options.error.stack,
      ...(options.error as any).code && { code: (options.error as any).code },
      ...(options.error as any).details && { details: (options.error as any).details }
    };
  }
  
  // Stringify the log entry
  const logString = JSON.stringify(logEntry);
  
  // Output to appropriate console method
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(logString);
      break;
    case LogLevel.INFO:
      console.info(logString);
      break;
    case LogLevel.WARN:
      console.warn(logString);
      break;
    case LogLevel.ERROR:
      console.error(logString);
      break;
  }
}

/**
 * Measure execution time of async functions
 * @param fn Function to measure
 * @param fnName Function name for logging
 * @returns Result of the function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  fnName: string,
  options: {
    context?: string;
    requestId?: string;
    userId?: string;
    logLevel?: LogLevel;
    includeResult?: boolean;
  } = {}
): Promise<T> {
  const start = Date.now();
  let result: T;
  
  try {
    result = await fn();
    const duration = Date.now() - start;
    
    logMessage(
      options.logLevel || LogLevel.DEBUG,
      `Function ${fnName} executed in ${duration}ms`,
      {
        context: options.context,
        requestId: options.requestId,
        userId: options.userId,
        duration,
        data: options.includeResult ? { result } : undefined
      }
    );
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    logMessage(
      LogLevel.ERROR,
      `Function ${fnName} failed after ${duration}ms`,
      {
        context: options.context,
        requestId: options.requestId,
        userId: options.userId,
        duration,
        error: error instanceof Error ? error : new Error(String(error))
      }
    );
    
    throw error;
  }
}

/**
 * Validate request data with error handling
 * @param validator Function that validates data
 * @param data Data to validate
 * @param context Context for error logging
 * @returns Validated data
 */
export function validateRequest<T>(
  validator: (data: unknown) => T,
  data: unknown,
  context: string
): T {
  try {
    return validator(data);
  } catch (error) {
    logMessage(LogLevel.ERROR, `Validation error in ${context}`, { error: error as Error });
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`Validation error: ${String(error)}`);
  }
}

/**
 * Process a request with standard error handling
 * @param fn Request handler function
 * @param requestId Optional request identifier
 * @returns Response object
 */
export async function processRequest(
  fn: () => Promise<Response>,
  requestId?: string
): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log the error
    logMessage(LogLevel.ERROR, 'Error processing request', {
      requestId,
      error: error instanceof Error ? error : new Error(errorMessage)
    });
    
    // Determine error type for response
    if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      return createErrorResponse(
        ErrorCode.AUTHENTICATION_ERROR,
        'Authentication failed',
        { message: errorMessage },
        401
      );
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
      return createErrorResponse(
        ErrorCode.AUTHORIZATION_ERROR,
        'You do not have permission to perform this action',
        { message: errorMessage },
        403
      );
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('missing')) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        'The requested resource was not found',
        { message: errorMessage },
        404
      );
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid request data',
        { message: errorMessage },
        400
      );
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return createErrorResponse(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded, please try again later',
        { message: errorMessage },
        429
      );
    }
    
    // Default to internal server error
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      { message: errorMessage },
      500
    );
  }
}

/**
 * Standard handler for processing API requests
 * @param req Request object
 * @param handler Function to handle the request
 * @returns Response object
 */
export async function handleApiRequest(
  req: Request,
  handler: (body: unknown, headers: Headers) => Promise<Response>
): Promise<Response> {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Parse request body
    let body: unknown;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await req.json();
    } else if (contentType?.includes('multipart/form-data')) {
      // For form data, we'd need proper form data parsing
      body = await req.formData();
    } else if (contentType?.includes('text/plain')) {
      body = await req.text();
    } else {
      // Default to trying JSON
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }
    
    // Process the request
    return await processRequest(
      async () => handler(body, req.headers),
      requestId
    );
  } catch (error) {
    logMessage(LogLevel.ERROR, 'Error processing API request', {
      requestId,
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    return createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to process request',
      { message: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}
