
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
  error: { code: string; message: string; details?: any },
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
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
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: any
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  switch (level) {
    case 'debug':
      console.debug(JSON.stringify(logData));
      break;
    case 'info':
      console.info(JSON.stringify(logData));
      break;
    case 'warn':
      console.warn(JSON.stringify(logData));
      break;
    case 'error':
      console.error(JSON.stringify(logData));
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
  fnName: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logMessage('debug', `Function ${fnName} executed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logMessage('error', `Function ${fnName} failed after ${duration}ms`, { error });
    throw error;
  }
}
