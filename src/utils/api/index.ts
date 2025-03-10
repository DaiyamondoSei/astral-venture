
/**
 * API utilities exports
 */

// Core API client functions
export {
  makeRequest,
  get,
  post,
  put,
  patch,
  del,
  invokeEdgeFunction,
  type ApiRequestOptions
} from './apiClient';

// API error handling
export {
  handleApiResponse,
  processApiError
} from './apiErrorHandler';

// Re-export validation errors for convenience when working with APIs
export { ValidationError, isValidationError } from '../validation/ValidationError';
