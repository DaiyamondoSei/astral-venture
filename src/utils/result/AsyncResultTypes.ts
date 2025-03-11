
/**
 * AsyncResult Type - Represents an asynchronous operation that will
 * eventually result in either a successful result or a failure
 */
import { Result } from './Result';

/**
 * AsyncResult is a Promise that resolves to a Result
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;
