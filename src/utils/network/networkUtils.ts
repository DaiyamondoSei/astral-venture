
import { ApiError } from '../api/ApiError';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    shouldRetry = (error) => error instanceof ApiError && error.statusCode >= 500
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (!shouldRetry(lastError) || attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError!;
}

export function batchRequests<T>(
  requests: (() => Promise<T>)[],
  batchSize = 3
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let completed = 0;
    let currentBatch = 0;
    
    function processBatch() {
      const batch = requests.slice(
        currentBatch * batchSize,
        (currentBatch + 1) * batchSize
      );
      
      if (batch.length === 0) {
        resolve(results);
        return;
      }
      
      Promise.all(batch.map(request => request()))
        .then(batchResults => {
          results.push(...batchResults);
          completed += batchResults.length;
          currentBatch++;
          
          if (completed < requests.length) {
            processBatch();
          } else {
            resolve(results);
          }
        })
        .catch(reject);
    }
    
    processBatch();
  });
}
