
// Standardized response utilities for Edge Functions

// Standard CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard response types
export type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    processingTime?: number;
    version?: string;
  };
};

// Error codes for consistent error handling
export enum ErrorCode {
  // Authentication errors (400-499)
  UNAUTHORIZED = 'auth/unauthorized',
  FORBIDDEN = 'auth/forbidden',
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  
  // Request validation errors (400-499)
  VALIDATION_FAILED = 'request/validation-failed',
  MISSING_PARAMETERS = 'request/missing-parameters',
  INVALID_PARAMETERS = 'request/invalid-parameters',
  
  // Resource errors (400-499)
  NOT_FOUND = 'resource/not-found',
  ALREADY_EXISTS = 'resource/already-exists',
  
  // Server errors (500-599) 
  INTERNAL_ERROR = 'server/internal-error',
  SERVICE_UNAVAILABLE = 'server/service-unavailable',
  EXTERNAL_SERVICE_ERROR = 'server/external-service-error',
  DATABASE_ERROR = 'server/database-error',
  
  // Rate limiting
  RATE_LIMITED = 'request/rate-limited',
}

// Status code mapping
const errorCodeToStatusCode: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.MISSING_PARAMETERS]: 400,
  [ErrorCode.INVALID_PARAMETERS]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.RATE_LIMITED]: 429,
};

// Function to create a success response
export function createSuccessResponse<T>(data: T, meta?: ApiResponse<T>['meta']): Response {
  const startTime = new Date().getTime();
  
  const responseBody: ApiResponse<T> = {
    status: 'success',
    data,
    meta: {
      ...meta,
      processingTime: new Date().getTime() - startTime,
      version: '1.0',
    },
  };
  
  return new Response(
    JSON.stringify(responseBody),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200,
    }
  );
}

// Function to create an error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown
): Response {
  const responseBody: ApiResponse<null> = {
    status: 'error',
    error: {
      code,
      message,
      details,
    },
    meta: {
      version: '1.0',
    },
  };
  
  return new Response(
    JSON.stringify(responseBody),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: errorCodeToStatusCode[code],
    }
  );
}

// Helper to handle CORS preflight requests
export function handleCorsRequest(): Response {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

// Validation utilities
export function validateRequiredParameters(
  params: Record<string, unknown>, 
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingParams.length === 0,
    missingParams,
  };
}
