
/**
 * Shared response utilities for Edge Functions
 */

// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Error codes for consistent error handling
export enum ErrorCode {
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

// Error handling options
export interface ErrorHandlingOptions {
  includeStack?: boolean;
  customMessage?: string;
  defaultStatus?: number;
  context?: string;
}

/**
 * Create a preflight response for OPTIONS requests
 */
export function handleCorsRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Validate required parameters in a request
 * 
 * @param params Object containing parameters to validate
 * @param requiredParams Array of parameter names that must be present
 * @returns Validation result with missing parameters if any
 */
export function validateRequiredParameters(
  params: Record<string, any>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * Validate parameter types
 * 
 * @param params Object containing parameters to validate
 * @param typeMap Object mapping parameter names to expected types
 * @returns Validation result with invalid parameters if any
 */
export function validateParameterTypes(
  params: Record<string, any>,
  typeMap: Record<string, string>
): { isValid: boolean; invalidParams: Array<{name: string, expected: string, received: string}> } {
  const invalidParams: Array<{name: string, expected: string, received: string}> = [];
  
  for (const [paramName, expectedType] of Object.entries(typeMap)) {
    const value = params[paramName];
    
    // Skip validation for undefined or null values - use required param validation for that
    if (value === undefined || value === null) continue;
    
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (actualType !== expectedType) {
      invalidParams.push({
        name: paramName,
        expected: expectedType,
        received: actualType
      });
    }
  }
  
  return {
    isValid: invalidParams.length === 0,
    invalidParams
  };
}

/**
 * Create a success response with standardized format
 * 
 * @param data Response data
 * @param metadata Optional metadata
 * @param additionalHeaders Optional additional headers
 * @returns Formatted success response
 */
export function createSuccessResponse(
  data: any,
  metadata: Record<string, any> = {},
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      metadata,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        ...additionalHeaders
      }
    }
  );
}

/**
 * Create an error response with standardized format
 * 
 * @param code Error code
 * @param message Error message
 * @param details Additional error details
 * @param status HTTP status code
 * @param additionalHeaders Optional additional headers
 * @returns Formatted error response
 */
export function createErrorResponse(
  code: ErrorCode | string | unknown,
  message: string,
  details: Record<string, any> | null = null,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
): Response {
  // Handle case where an Error object is passed as first parameter
  if (code instanceof Error) {
    message = code.message;
    code = ErrorCode.INTERNAL_ERROR;
  } else if (typeof code !== 'string') {
    code = ErrorCode.INTERNAL_ERROR;
  }
  
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
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json", 
        ...additionalHeaders
      }
    }
  );
}

/**
 * Log an event with structured data
 * 
 * @param level Log level
 * @param message Log message
 * @param data Additional data to log
 */
export function logEvent(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data: Record<string, any> = {}
): void {
  const logFunction = level === 'error' 
    ? console.error 
    : level === 'warn' 
      ? console.warn 
      : level === 'debug' 
        ? console.debug 
        : console.info;
  
  logFunction({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  });
}

/**
 * Parse JSON request body with error handling
 * 
 * @param req Request object
 * @returns Parsed JSON body
 * @throws Error if parsing fails
 */
export async function parseJsonBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate a request against required parameters and types
 * 
 * @param req Request object
 * @param requiredParams Array of required parameter names
 * @param typeMap Optional map of parameter types
 * @returns Parsed and validated request data
 * @throws Error if validation fails
 */
export async function validateRequest(
  req: Request, 
  requiredParams: string[],
  typeMap?: Record<string, string>
): Promise<any> {
  const data = await parseJsonBody(req);
  
  // Check required parameters
  const { isValid, missingParams } = validateRequiredParameters(data, requiredParams);
  if (!isValid) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }
  
  // Check parameter types if typeMap provided
  if (typeMap) {
    const { isValid, invalidParams } = validateParameterTypes(data, typeMap);
    if (!isValid) {
      const errors = invalidParams.map(p => 
        `${p.name} should be ${p.expected}, got ${p.received}`
      ).join('; ');
      
      throw new Error(`Invalid parameter types: ${errors}`);
    }
  }
  
  return data;
}
