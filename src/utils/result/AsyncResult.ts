
/**
 * AsyncResult Pattern Implementation
 * 
 * A robust type-safe approach for handling asynchronous operations that may succeed or fail.
 * This pattern builds on the Result type and provides utility functions for working with
 * Promises that resolve to Result types.
 */

// Re-export types
export { AsyncResult, RetryOptions, DEFAULT_RETRY_OPTIONS } from './AsyncResultTypes';

// Re-export core functions
export {
  mapAsync,
  flatMapAsync,
  foldAsync,
  mapErrorAsync,
  asyncResultify
} from './AsyncResultCore';

// Re-export advanced functions
export {
  recoverAsync,
  recoverWithAsync,
  allAsync,
  firstSuccessAsync,
  withTimeout,
  retryAsync
} from './AsyncResultAdvanced';
