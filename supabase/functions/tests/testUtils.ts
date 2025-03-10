
/**
 * Testing utilities for Edge Functions
 * This file provides helper functions for testing Edge Functions
 */

import { EdgeFunctionResponse } from "../shared/responseUtils.ts";

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

// Create authenticated test request
export function createAuthenticatedRequest(
  userId: string,
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
): Request {
  const headers = {
    'Authorization': `Bearer test-token-for-${userId}`,
    ...options.headers
  };
  
  return createMockRequest({
    ...options,
    headers
  });
}

// Assert response success
export function assertSuccessResponse<T>(
  result: TestResult<EdgeFunctionResponse<T>>
): T {
  if (!result.body.success) {
    throw new Error(`Expected success response but got error: ${result.body.error?.message}`);
  }
  return result.body.data as T;
}

// Assert response error
export function assertErrorResponse(
  result: TestResult<EdgeFunctionResponse<any>>,
  expectedCode?: string,
  expectedStatus?: number
): void {
  if (result.body.success) {
    throw new Error(`Expected error response but got success`);
  }
  
  if (expectedCode && result.body.error?.code !== expectedCode) {
    throw new Error(`Expected error code ${expectedCode} but got ${result.body.error?.code}`);
  }
  
  if (expectedStatus && result.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus} but got ${result.status}`);
  }
}
