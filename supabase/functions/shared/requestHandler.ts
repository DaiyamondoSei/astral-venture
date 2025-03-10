
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { ValidationError } from '../generate-insights/services/validationService.ts';

/**
 * Standard CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Success response type
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  status: number;
}

/**
 * Response wrapper for Edge Functions
 */
export type EdgeFunctionResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Request handler options
 */
export interface RequestHandlerOptions {
  /**
   * Whether the endpoint requires authentication
   */
  requireAuth?: boolean;
  
  /**
   * Custom error handler function
   */
  errorHandler?: (error: Error) => ErrorResponse;
  
  /**
   * Whether to enable detailed logging
   */
  enableLogging?: boolean;
}

/**
 * Creates a Supabase client for Edge Functions
 * 
 * @returns Supabase client
 */
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Structured logging helper
 * 
 * @param level - Log level
 * @param message - Log message
 * @param data - Additional data to log
 */
export function logMessage(
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
  data?: unknown
) {
  const timestamp = new Date().toISOString();
  const logData = {
    level,
    timestamp,
    message,
    ...(data ? { data } : {})
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logData));
      break;
    case 'warn':
      console.warn(JSON.stringify(logData));
      break;
    case 'debug':
      console.debug(JSON.stringify(logData));
      break;
    default:
      console.log(JSON.stringify(logData));
  }
}

/**
 * Handler function for Edge Function requests
 * 
 * @param req - Request object
 * @param handler - Handler function for the request
 * @param options - Request handler options
 * @returns Response object
 */
export async function handleRequest<T>(
  req: Request,
  handler: (
    req: Request,
    supabase: ReturnType<typeof createSupabaseClient>,
    userId?: string
  ) => Promise<T>,
  options: RequestHandlerOptions = {}
): Promise<Response> {
  const { requireAuth = true, enableLogging = true } = options;
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Authenticate user if required
    let userId: string | undefined;
    
    if (requireAuth) {
      const authorization = req.headers.get('Authorization');
      
      if (!authorization) {
        throw new ValidationError('Missing authorization header', {
          code: 'UNAUTHORIZED',
          statusCode: 401
        });
      }
      
      const token = authorization.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new ValidationError('Invalid token', {
          code: 'UNAUTHORIZED',
          statusCode: 401,
          details: { message: authError?.message }
        });
      }
      
      userId = user.id;
      
      if (enableLogging) {
        logMessage('info', 'Authenticated request', { userId });
      }
    }
    
    // Log request if enabled
    if (enableLogging) {
      logMessage('info', `Processing ${req.method} request`, {
        path: new URL(req.url).pathname,
        authenticated: !!userId
      });
    }
    
    // Call the handler function
    const result = await handler(req, supabase, userId);
    
    // Return successful response
    const response: SuccessResponse<T> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Log error if enabled
    if (enableLogging) {
      logMessage('error', 'Request handler error', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
    
    // Handle ValidationError specially
    if (error instanceof ValidationError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        status: error.statusCode
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: error.statusCode,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Handle custom error handling if provided
    if (options.errorHandler && error instanceof Error) {
      const errorResponse = options.errorHandler(error);
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: errorResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Default error response
    const errorResponse: ErrorResponse = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      status: 500
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
