
/**
 * Error codes for API responses
 */
export enum ErrorCode {
  INTERNAL_ERROR = 'internal_error',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  VALIDATION_FAILED = 'validation_failed',
  MISSING_PARAMETERS = 'missing_parameters',
  RATE_LIMITED = 'rate_limited',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  FORBIDDEN = 'forbidden',
}

/**
 * Creates a standardized error response
 * 
 * @param code - Error code
 * @param message - Error message
 * @param data - Additional error data
 * @param status - HTTP status code
 * @param headers - Optional response headers
 * @returns Response object with error details
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  data: Record<string, unknown> | null = null,
  status: number = 400,
  headers: Record<string, string> = {}
): Response {
  const body = {
    success: false,
    error: {
      code,
      message,
      ...(data ? { details: data } : {})
    }
  };
  
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

/**
 * Creates a standardized success response
 * 
 * @param data - Response data
 * @param metadata - Optional metadata
 * @param status - HTTP status code
 * @param headers - Optional response headers
 * @returns Response object with success result
 */
export function createSuccessResponse(
  data: Record<string, unknown> | Array<unknown>,
  metadata: Record<string, unknown> = {},
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const body = {
    success: true,
    data,
    ...(Object.keys(metadata).length > 0 ? { metadata } : {})
  };
  
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

/**
 * Result of parameter validation
 */
export interface ValidationResult {
  isValid: boolean;
  missingParams?: string[];
}

/**
 * Validates that required parameters are present in a request body
 * 
 * @param body - Request body object
 * @param requiredParams - Array of required parameter names
 * @returns Validation result
 */
export function validateRequiredParameters(
  body: Record<string, unknown>,
  requiredParams: string[]
): ValidationResult {
  const missingParams: string[] = [];
  
  for (const param of requiredParams) {
    if (body[param] === undefined) {
      missingParams.push(param);
    }
  }
  
  return {
    isValid: missingParams.length === 0,
    missingParams: missingParams.length > 0 ? missingParams : undefined
  };
}

/**
 * Log events for monitoring and debugging
 * 
 * @param level - Log level
 * @param message - Log message
 * @param data - Additional log data
 */
export function logEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data ? { data } : {})
  };
  
  switch (level) {
    case 'info':
      console.log(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
  }
}
