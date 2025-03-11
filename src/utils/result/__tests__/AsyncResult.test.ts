
/**
 * Tests for AsyncResult utilities
 */

import {
  mapAsync,
  flatMapAsync,
  foldAsync,
  mapErrorAsync,
  recoverAsync,
  recoverWithAsync,
  allAsync,
  firstSuccessAsync,
  withTimeout,
  retryAsync,
  asyncResultify
} from '../AsyncResult';
import { success, failure } from '../Result';

describe('AsyncResult', () => {
  describe('mapAsync', () => {
    it('should map success values', async () => {
      const result = await mapAsync(
        Promise.resolve(success(42)),
        x => x * 2
      );
      
      expect(result.type).toBe('success');
      expect(result.value).toBe(84);
    });

    it('should pass through failures', async () => {
      const error = new Error('test');
      const result = await mapAsync(
        Promise.resolve(failure(error)),
        x => x * 2
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });

    it('should handle mapping function errors', async () => {
      const error = new Error('mapping error');
      const result = await mapAsync(
        Promise.resolve(success(42)),
        () => { throw error; }
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });
  });

  describe('flatMapAsync', () => {
    it('should chain successes', async () => {
      const result = await flatMapAsync(
        Promise.resolve(success(42)),
        x => Promise.resolve(success(x * 2))
      );
      
      expect(result.type).toBe('success');
      expect(result.value).toBe(84);
    });

    it('should handle chained failures', async () => {
      const error = new Error('chained error');
      const result = await flatMapAsync(
        Promise.resolve(success(42)),
        () => Promise.resolve(failure(error))
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });

    it('should pass through initial failures', async () => {
      const error = new Error('initial error');
      const mockFn = jest.fn();
      
      const result = await flatMapAsync(
        Promise.resolve(failure(error)),
        mockFn
      );
      
      expect(mockFn).not.toHaveBeenCalled();
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });
  });

  describe('foldAsync', () => {
    it('should handle success case', async () => {
      const result = await foldAsync(
        Promise.resolve(success(42)),
        x => `Success: ${x}`,
        e => `Error: ${e.message}`
      );
      
      expect(result).toBe('Success: 42');
    });

    it('should handle failure case', async () => {
      const error = new Error('test error');
      const result = await foldAsync(
        Promise.resolve(failure(error)),
        x => `Success: ${x}`,
        e => `Error: ${e.message}`
      );
      
      expect(result).toBe('Error: test error');
    });
  });

  describe('mapErrorAsync', () => {
    it('should transform failure values', async () => {
      const originalError = new Error('original');
      const transformedError = new Error('transformed');
      
      const result = await mapErrorAsync(
        Promise.resolve(failure(originalError)),
        () => transformedError
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(transformedError);
    });

    it('should pass through success values', async () => {
      const mockFn = jest.fn();
      const result = await mapErrorAsync(
        Promise.resolve(success(42)),
        mockFn
      );
      
      expect(mockFn).not.toHaveBeenCalled();
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });
  });

  describe('recoverAsync', () => {
    it('should recover from failures', async () => {
      const error = new Error('test error');
      const result = await recoverAsync(
        Promise.resolve(failure(error)),
        () => 42
      );
      
      expect(result).toBe(42);
    });

    it('should pass through success values', async () => {
      const mockFn = jest.fn();
      const result = await recoverAsync(
        Promise.resolve(success(42)),
        mockFn
      );
      
      expect(mockFn).not.toHaveBeenCalled();
      expect(result).toBe(42);
    });
  });

  describe('recoverWithAsync', () => {
    it('should recover from failures with another result', async () => {
      const error = new Error('test error');
      const result = await recoverWithAsync(
        Promise.resolve(failure(error)),
        () => Promise.resolve(success(42))
      );
      
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });

    it('should allow recovery to also fail', async () => {
      const originalError = new Error('original');
      const recoveryError = new Error('recovery');
      
      const result = await recoverWithAsync(
        Promise.resolve(failure(originalError)),
        () => Promise.resolve(failure(recoveryError))
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(recoveryError);
    });
  });

  describe('allAsync', () => {
    it('should combine successful results', async () => {
      const result = await allAsync([
        Promise.resolve(success(1)),
        Promise.resolve(success(2)),
        Promise.resolve(success(3))
      ]);
      
      expect(result.type).toBe('success');
      expect(result.value).toEqual([1, 2, 3]);
    });

    it('should fail if any result fails', async () => {
      const error = new Error('test error');
      const result = await allAsync([
        Promise.resolve(success(1)),
        Promise.resolve(failure(error)),
        Promise.resolve(success(3))
      ]);
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });
  });

  describe('firstSuccessAsync', () => {
    it('should return the first success', async () => {
      const result = await firstSuccessAsync([
        Promise.resolve(failure(new Error('error 1'))),
        Promise.resolve(success(42)),
        Promise.resolve(success(43))
      ]);
      
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });

    it('should return the last failure if all fail', async () => {
      const error1 = new Error('error 1');
      const error2 = new Error('error 2');
      
      const result = await firstSuccessAsync([
        Promise.resolve(failure(error1)),
        Promise.resolve(failure(error2))
      ]);
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error2);
    });
  });

  describe('asyncResultify', () => {
    it('should convert async functions to return AsyncResult', async () => {
      const fn = async (x: number) => x * 2;
      const errorFn = async () => { throw new Error('test error'); };
      
      const resultified = asyncResultify(fn);
      const errorResultified = asyncResultify(errorFn);
      
      const successResult = await resultified(21);
      const failureResult = await errorResultified();
      
      expect(successResult.type).toBe('success');
      expect(successResult.value).toBe(42);
      
      expect(failureResult.type).toBe('failure');
      expect(failureResult.error).toBeInstanceOf(Error);
    });
  });

  // These tests are more complex, as they involve timing
  // Only included basic versions for brevity
  describe('timeout and retry', () => {
    it('should timeout long operations', async () => {
      const timeoutError = new Error('timeout');
      const result = await withTimeout(
        new Promise(resolve => setTimeout(() => {
          resolve(success(42));
        }, 50)),
        10,
        timeoutError
      );
      
      expect(result.type).toBe('failure');
      expect(result.error).toBe(timeoutError);
    });

    it('should not timeout fast operations', async () => {
      const result = await withTimeout(
        Promise.resolve(success(42)),
        100,
        new Error('timeout')
      );
      
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          return failure(new Error(`attempt ${attempts}`));
        }
        return success(42);
      };
      
      const result = await retryAsync(
        () => operation(),
        {
          maxRetries: 3,
          initialDelayMs: 10,
          maxDelayMs: 100,
          backoffFactor: 2
        }
      );
      
      expect(attempts).toBe(3);
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });
  });
});
