
import { ValidationError } from './ValidationError';

/**
 * Result of API validation
 */
export interface ApiValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Options for API parameter validation
 */
export interface ApiValidationOptions {
  allowExtraParams?: boolean;
  throwOnError?: boolean;
}

/**
 * Validate required parameters in an API request body
 * 
 * @param body - Request body to validate
 * @param requiredParams - Array of required parameter names
 * @param options - Validation options
 * @returns Validation result
 * @throws ValidationError if throwOnError is true and validation fails
 */
export function validateRequiredParameters<T extends Record<string, unknown>>(
  body: unknown,
  requiredParams: string[],
  options: ApiValidationOptions = {}
): ApiValidationResult<T> {
  const { allowExtraParams = false, throwOnError = false } = options;
  
  // Ensure body is an object
  if (typeof body !== 'object' || body === null) {
    const error = `Request body must be an object, got ${body === null ? 'null' : typeof body}`;
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'body',
        body,
        'INVALID_REQUEST_BODY'
      );
    }
    
    return { isValid: false, errors: [error] };
  }
  
  // Check for missing required parameters
  const requestBody = body as Record<string, unknown>;
  const missingParams: string[] = [];
  
  for (const param of requiredParams) {
    if (requestBody[param] === undefined) {
      missingParams.push(param);
    }
  }
  
  if (missingParams.length > 0) {
    const error = `Missing required parameters: ${missingParams.join(', ')}`;
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'body',
        missingParams,
        'MISSING_PARAMETERS'
      );
    }
    
    return { 
      isValid: false, 
      errors: [error],
      data: requestBody as T
    };
  }
  
  // Check for extra parameters if not allowed
  if (!allowExtraParams) {
    const extraParams = Object.keys(requestBody).filter(
      key => !requiredParams.includes(key)
    );
    
    if (extraParams.length > 0) {
      const error = `Unexpected parameters: ${extraParams.join(', ')}`;
      
      if (throwOnError) {
        throw new ValidationError(
          error,
          'body',
          extraParams,
          'EXTRA_PARAMETERS'
        );
      }
      
      return { 
        isValid: false, 
        errors: [error],
        data: requestBody as T
      };
    }
  }
  
  return {
    isValid: true,
    data: requestBody as T
  };
}

/**
 * Validate that a JWT token is present and properly formatted
 * 
 * @param token - JWT token to validate
 * @param options - Validation options
 * @returns Validation result
 * @throws ValidationError if throwOnError is true and validation fails
 */
export function validateJwtToken(
  token: string | undefined | null,
  options: ApiValidationOptions = {}
): ApiValidationResult<string> {
  const { throwOnError = false } = options;
  
  // Check if token exists
  if (!token) {
    const error = 'Missing JWT token';
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'token',
        token,
        'MISSING_TOKEN'
      );
    }
    
    return { isValid: false, errors: [error] };
  }
  
  // Check token format (basic format check, not verification)
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  
  if (!jwtRegex.test(token)) {
    const error = 'Invalid JWT token format';
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'token',
        token,
        'INVALID_TOKEN_FORMAT'
      );
    }
    
    return { isValid: false, errors: [error] };
  }
  
  return {
    isValid: true,
    data: token
  };
}

/**
 * Extracts the JWT token from an Authorization header
 * 
 * @param authorization - Authorization header value
 * @param options - Validation options
 * @returns Validation result with the extracted token
 * @throws ValidationError if throwOnError is true and validation fails
 */
export function extractJwtFromHeader(
  authorization: string | undefined | null,
  options: ApiValidationOptions = {}
): ApiValidationResult<string> {
  const { throwOnError = false } = options;
  
  // Check if authorization header exists
  if (!authorization) {
    const error = 'Missing Authorization header';
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'authorization',
        authorization,
        'MISSING_AUTHORIZATION'
      );
    }
    
    return { isValid: false, errors: [error] };
  }
  
  // Check if it's a Bearer token
  if (!authorization.startsWith('Bearer ')) {
    const error = 'Authorization header must use Bearer scheme';
    
    if (throwOnError) {
      throw new ValidationError(
        error,
        'authorization',
        authorization,
        'INVALID_AUTHORIZATION_FORMAT'
      );
    }
    
    return { isValid: false, errors: [error] };
  }
  
  // Extract the token
  const token = authorization.replace('Bearer ', '');
  
  // Validate the token
  return validateJwtToken(token, options);
}
