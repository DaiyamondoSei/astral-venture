
/**
 * Example implementation of the Result pattern for API calls
 * 
 * This demonstrates how to use the Result pattern to handle API calls
 * with proper error handling and type safety.
 */

import { ApiAsyncResult, ErrorSubtype, createError } from '../ResultTypes';
import { AsyncResult } from '../AsyncResult';
import { success, failure } from '../Result';

// Sample API response types
interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiError {
  status: number;
  message: string;
  code?: string;
}

/**
 * Example API client that returns Results
 */
export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Fetch a user by ID with proper error handling
   */
  async getUser(id: string): ApiAsyncResult<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          status: response.status,
          message: response.statusText
        }));
        
        return this.handleHttpError(response.status, errorData);
      }
      
      const userData: User = await response.json();
      return success(userData);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return failure(createError('Network error while fetching user', {
          subtype: ErrorSubtype.NETWORK,
          context: { userId: id }
        }));
      }
      
      // Handle other unexpected errors
      return failure(createError(
        `Unexpected error fetching user: ${error instanceof Error ? error.message : String(error)}`,
        {
          subtype: ErrorSubtype.UNKNOWN,
          cause: error,
          context: { userId: id }
        }
      ));
    }
  }
  
  /**
   * Create a structured error based on HTTP status code
   */
  private handleHttpError(status: number, errorData: ApiError): AsyncResult<never, Error> {
    switch (status) {
      case 401:
      case 403:
        return failure(createError(errorData.message || 'Authentication error', {
          code: errorData.code || 'AUTH_ERROR',
          subtype: ErrorSubtype.AUTH
        }));
        
      case 404:
        return failure(createError(errorData.message || 'Resource not found', {
          code: errorData.code || 'NOT_FOUND',
          subtype: ErrorSubtype.RESOURCE_NOT_FOUND
        }));
        
      case 422:
        return failure(createError(errorData.message || 'Validation error', {
          code: errorData.code || 'VALIDATION_ERROR',
          subtype: ErrorSubtype.VALIDATION
        }));
        
      case 429:
        return failure(createError(errorData.message || 'Too many requests', {
          code: errorData.code || 'RATE_LIMIT',
          subtype: ErrorSubtype.RATE_LIMIT,
          retryable: true
        }));
        
      case 500:
      case 502:
      case 503:
        return failure(createError(errorData.message || 'Server error', {
          code: errorData.code || 'SERVER_ERROR',
          subtype: ErrorSubtype.INTERNAL,
          retryable: true
        }));
        
      default:
        return failure(createError(errorData.message || 'Unknown API error', {
          code: errorData.code || 'UNKNOWN_ERROR',
          subtype: ErrorSubtype.UNKNOWN
        }));
    }
  }
}

/**
 * Example usage
 */
export async function exampleApiUsage(): Promise<void> {
  const api = new ApiClient('https://api.example.com');
  
  // Example of handling the Result directly
  const userResult = await api.getUser('123');
  
  if (userResult.type === 'success') {
    console.log('User:', userResult.value);
  } else {
    console.error('Error:', userResult.error.message);
  }
  
  // Example of using AsyncResult utilities
  import { foldAsync, recoverAsync, mapAsync } from '../AsyncResult';
  
  // Using fold to handle both success and error cases
  const displayName = await foldAsync(
    api.getUser('123'),
    user => `${user.name} <${user.email}>`,
    error => `Unknown user: ${error.message}`
  );
  
  console.log('User display name:', displayName);
  
  // Using map to transform the success case
  const userEmails = await mapAsync(
    api.getUser('123'),
    user => user.email
  );
  
  // Using recover to provide a default value
  const user = await recoverAsync(
    api.getUser('123'),
    error => {
      console.error('Using default user due to error:', error);
      return { id: 'default', name: 'Default User', email: 'default@example.com' };
    }
  );
  
  console.log('User (possibly default):', user);
}
