
/**
 * Testing utilities for Edge Functions
 * This file provides helper functions for testing Edge Functions
 */

// Mock Request creator
export function createMockRequest(
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Request {
  const {
    method = 'GET',
    url = 'http://localhost/',
    headers = {},
    body
  } = options;
  
  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers)
  };
  
  if (body) {
    requestInit.body = JSON.stringify(body);
  }
  
  return new Request(url, requestInit);
}

// Mock environment variables
export function mockEnvVars(
  vars: Record<string, string>
): () => void {
  const originalEnv = { ...Deno.env };
  const originalGet = Deno.env.get;
  
  // Mock the get method
  Deno.env.get = (key: string): string | undefined => {
    return vars[key] || originalGet.call(Deno.env, key);
  };
  
  // Return restore function
  return () => {
    Deno.env = originalEnv;
  };
}

// Parse response
export async function parseResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json() as T;
  }
  return await response.text() as unknown as T;
}

// Test wrapper for edge functions
export interface TestResult<T = any> {
  status: number;
  headers: Headers;
  body: T;
  response: Response;
}

export async function testEdgeFunction<T = any>(
  handler: (req: Request) => Response | Promise<Response>,
  request: Request
): Promise<TestResult<T>> {
  const response = await handler(request);
  const body = await parseResponse<T>(response.clone());
  
  return {
    status: response.status,
    headers: response.headers,
    body,
    response
  };
}
