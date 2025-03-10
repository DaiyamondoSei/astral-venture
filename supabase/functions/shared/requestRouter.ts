
/**
 * Edge function request router with middleware support
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsRequest, createErrorResponse, ErrorCode, logEvent } from "./responseUtils.ts";
import { AuthenticationError, ValidationError, RequestHandlerOptions } from "./types.ts";

/**
 * Request handler type
 */
export type RequestHandler = (req: Request, ctx: RequestContext) => Promise<Response> | Response;

/**
 * Middleware type
 */
export type Middleware = (handler: RequestHandler) => RequestHandler;

/**
 * Request context containing extracted data and utilities
 */
export interface RequestContext {
  /** Path parameters extracted from the URL */
  params: Record<string, string>;
  /** Query parameters from the URL */
  query: URLSearchParams;
  /** Path segments from the URL */
  segments: string[];
  /** User ID if authenticated */
  userId?: string;
  /** Headers from the request */
  headers: Headers;
  /** Method from the request */
  method: string;
}

/**
 * Route definition
 */
export interface Route {
  /** HTTP method (GET, POST, etc.) */
  method: string | string[];
  /** Path pattern with parameter placeholders */
  pattern: string;
  /** Request handler function */
  handler: RequestHandler;
  /** Middleware functions to apply */
  middleware?: Middleware[];
  /** Route-specific options */
  options?: RequestHandlerOptions;
}

/**
 * Create a router for handling API requests
 * 
 * @param routes - List of route definitions
 * @param globalMiddleware - Global middleware to apply to all routes
 * @returns A request handler function
 */
export function createRouter(
  routes: Route[],
  globalMiddleware: Middleware[] = []
): (req: Request) => Promise<Response> {
  // Compile route patterns
  const compiledRoutes = routes.map(route => {
    const { pattern, ...rest } = route;
    const segments = pattern.split('/').filter(Boolean);
    const paramNames: string[] = [];
    
    // Extract parameter names from the pattern
    const regexSegments = segments.map(segment => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment;
    });
    
    // Create regex pattern for matching
    const regexPattern = new RegExp(`^/?${regexSegments.join('/')}/?$`);
    
    return {
      ...rest,
      paramNames,
      regexPattern,
      segments
    };
  });
  
  // Create request handler function
  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return handleCorsRequest();
    }
    
    try {
      // Parse URL
      const url = new URL(req.url);
      const path = url.pathname;
      const queryParams = url.searchParams;
      const segments = path.split('/').filter(Boolean);
      
      // Log request
      logEvent('info', `[Router] ${req.method} ${path}`);
      
      // Find matching route
      for (const route of compiledRoutes) {
        const { method, regexPattern, paramNames, handler, middleware = [], options = {} } = route;
        
        // Check if method matches
        const methods = Array.isArray(method) ? method : [method];
        if (!methods.includes(req.method)) {
          continue;
        }
        
        // Check if path matches
        const match = path.match(regexPattern);
        if (!match) {
          continue;
        }
        
        // Extract path parameters
        const params: Record<string, string> = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        
        // Create request context
        const context: RequestContext = {
          params,
          query: queryParams,
          segments,
          headers: req.headers,
          method: req.method
        };
        
        // Apply middleware to handler
        let finalHandler = handler;
        
        // Apply route-specific middleware
        for (let i = middleware.length - 1; i >= 0; i--) {
          finalHandler = middleware[i](finalHandler);
        }
        
        // Apply global middleware
        for (let i = globalMiddleware.length - 1; i >= 0; i--) {
          finalHandler = globalMiddleware[i](finalHandler);
        }
        
        // Handle the request
        return await finalHandler(req, context);
      }
      
      // No route matched
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED, 
        `Route not found: ${req.method} ${path}`,
        null,
        404
      );
    } catch (error) {
      // Handle known error types
      if (error instanceof ValidationError) {
        return createErrorResponse(
          ErrorCode.VALIDATION_FAILED,
          error.message,
          { field: error.field },
          400
        );
      }
      
      if (error instanceof AuthenticationError) {
        return createErrorResponse(
          ErrorCode.AUTHENTICATION_ERROR,
          error.message,
          null,
          401
        );
      }
      
      // Log the error
      console.error('Unhandled error in router:', error);
      
      // Return generic error response
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred',
        { message: error instanceof Error ? error.message : String(error) },
        500
      );
    }
  };
}

/**
 * Create a middleware for validating request authentication
 * 
 * @param options - Authentication options
 * @returns Middleware function
 */
export function authMiddleware(options: { adminOnly?: boolean } = {}): Middleware {
  return (handler: RequestHandler) => {
    return async (req: Request, ctx: RequestContext): Promise<Response> => {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Authorization header missing or invalid');
      }
      
      const token = authHeader.split(' ')[1];
      
      // Here you would validate the token and get the user ID
      // For now, we'll just use a placeholder
      // const { data: { user }, error } = await supabase.auth.getUser(token);
      
      // if (error || !user) {
      //   throw new AuthenticationError('Invalid token');
      // }
      
      // Update context with user ID
      ctx.userId = 'user-id-here'; // Placeholder
      
      // Optional admin check
      // if (options.adminOnly && user.role !== 'admin') {
      //   throw new AuthenticationError('Admin access required');
      // }
      
      return handler(req, ctx);
    };
  };
}

/**
 * Create a middleware for logging request/response details
 * 
 * @returns Middleware function
 */
export function loggingMiddleware(): Middleware {
  return (handler: RequestHandler) => {
    return async (req: Request, ctx: RequestContext): Promise<Response> => {
      const startTime = performance.now();
      const path = new URL(req.url).pathname;
      
      try {
        const response = await handler(req, ctx);
        const duration = performance.now() - startTime;
        
        logEvent('info', `[${req.method}] ${path} - ${response.status} (${duration.toFixed(2)}ms)`);
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        logEvent('error', `[${req.method}] ${path} - Failed (${duration.toFixed(2)}ms)`, {
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
  };
}

/**
 * Create and start the router server
 * 
 * @param routes - List of route definitions
 * @param globalMiddleware - Global middleware to apply to all routes
 */
export function startRouter(
  routes: Route[],
  globalMiddleware: Middleware[] = []
): void {
  const router = createRouter(routes, globalMiddleware);
  serve(router);
}

export default {
  createRouter,
  startRouter,
  authMiddleware,
  loggingMiddleware
};
