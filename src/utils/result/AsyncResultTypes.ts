
/**
 * AsyncResult Type - Represents an asynchronous operation that will
 * eventually result in either a successful result or a failure
 */
import { Result } from './Result';

/**
 * AsyncResult is a Promise that resolves to a Result
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/**
 * Options for the retry functionality
 */
export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  shouldRetry?: (error: any, retryCount: number) => boolean;
  onRetry?: (error: any, retryCount: number) => void;
  backoffFactor?: number;
}

/**
 * Default options for the retry functionality
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffFactor: 2
};

/**
 * Options for the timeout functionality
 */
export interface TimeoutOptions {
  timeoutMs: number;
  timeoutMessage?: string;
}
