
/**
 * Additional utility functions for working with AsyncResult types
 */

import { Result, success, failure, isSuccess, isFailure } from './Result';
import { AsyncResult } from './AsyncResultTypes';
import { 
  mapAsync, 
  flatMapAsync, 
  mapErrorAsync, 
  recoverAsync
} from './AsyncResultCore';

/**
 * Convert a Promise to an AsyncResult
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>, 
  errorMapper?: (error: unknown) => E
): AsyncResult<T, E> {
  try {
    const result = await promise;
    return success(result);
  } catch (error) {
    if (errorMapper) {
      return failure(errorMapper(error));
    }
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Executes a function for both success and failure cases without changing the result
 */
export async function tapAsync<T, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (result: Result<T, E>) => void | Promise<void>
): AsyncResult<T, E> {
  const result = await resultPromise;
  await fn(result);
  return result;
}

/**
 * Executes a function for success case without changing the success value
 */
export async function tapSuccessAsync<T, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (value: T) => void | Promise<void>
): AsyncResult<T, E> {
  const result = await resultPromise;
  
  if (isSuccess(result)) {
    await fn(result.value);
  }
  
  return result;
}

/**
 * Executes a function for failure case without changing the error
 */
export async function tapErrorAsync<T, E>(
  resultPromise: AsyncResult<T, E>,
  fn: (error: E) => void | Promise<void>
): AsyncResult<T, E> {
  const result = await resultPromise;
  
  if (isFailure(result)) {
    await fn(result.error);
  }
  
  return result;
}

/**
 * Type-safe function for filtering results in an array
 */
export async function filterAsync<T, E>(
  resultPromise: AsyncResult<T[], E>,
  predicate: (value: T) => boolean | Promise<boolean>
): AsyncResult<T[], E> {
  return mapAsync(resultPromise, async (array) => {
    const results = await Promise.all(
      array.map(async (item) => ({
        item,
        keep: await predicate(item)
      }))
    );
    return results.filter(({ keep }) => keep).map(({ item }) => item);
  });
}

/**
 * Type-safe function for sorting results in an array
 */
export async function sortAsync<T, E>(
  resultPromise: AsyncResult<T[], E>,
  compareFn: (a: T, b: T) => number
): AsyncResult<T[], E> {
  return mapAsync(resultPromise, (array) => {
    return [...array].sort(compareFn);
  });
}

/**
 * Transform a value and an AsyncResult into a new AsyncResult
 */
export async function combineAsync<T, U, E>(
  value: T,
  resultPromise: AsyncResult<U, E>,
  combineFn: (value: T, result: U) => R | Promise<R>
): AsyncResult<R, E> {
  return flatMapAsync(resultPromise, async (result) => {
    const combined = await combineFn(value, result);
    return success(combined);
  });
}

/**
 * Chain multiple AsyncResult operations, stopping at the first failure
 */
export async function chainAsync<T, E>(
  initial: AsyncResult<T, E>,
  ...operations: ((value: T) => AsyncResult<T, E>)[]
): AsyncResult<T, E> {
  let current = await initial;
  
  if (isFailure(current)) {
    return current;
  }
  
  for (const operation of operations) {
    current = await operation(current.value);
    
    if (isFailure(current)) {
      return current;
    }
  }
  
  return current;
}

/**
 * Time an AsyncResult operation and include timing info in the success result
 */
export async function withTiming<T, E>(
  resultPromise: AsyncResult<T, E>
): AsyncResult<{ result: T, durationMs: number }, E> {
  const startTime = performance.now();
  
  try {
    const result = await resultPromise;
    const endTime = performance.now();
    const durationMs = endTime - startTime;
    
    if (isSuccess(result)) {
      return success({ result: result.value, durationMs });
    } else {
      return failure(result.error);
    }
  } catch (error) {
    return failure(error instanceof Error ? error as unknown as E : new Error(String(error)) as unknown as E);
  }
}

/**
 * Type-safe caching for AsyncResult operations
 */
export function createAsyncResultCache<K, T, E>(
  maxSize: number = 100,
  ttlMs: number = 60000
) {
  const cache = new Map<K, { value: Result<T, E>, timestamp: number }>();
  
  return {
    async getOrFetch(
      key: K,
      fetchFn: () => AsyncResult<T, E>
    ): AsyncResult<T, E> {
      const now = Date.now();
      const cached = cache.get(key);
      
      // Return cached value if it exists and hasn't expired
      if (cached && (now - cached.timestamp < ttlMs)) {
        return Promise.resolve(cached.value);
      }
      
      // Fetch new value
      const result = await fetchFn();
      
      // Cache the result
      cache.set(key, { value: result, timestamp: now });
      
      // Trim cache if it exceeds max size
      if (cache.size > maxSize) {
        const oldestKey = [...cache.entries()]
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        cache.delete(oldestKey);
      }
      
      return result;
    },
    
    invalidate(key: K): void {
      cache.delete(key);
    },
    
    clear(): void {
      cache.clear();
    }
  };
}
