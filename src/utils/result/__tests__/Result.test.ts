
/**
 * Tests for the Result pattern implementation
 */

import {
  Result,
  success,
  failure,
  isSuccess,
  isFailure,
  map,
  flatMap,
  mapError,
  recover,
  recoverWith,
  unwrap,
  unwrapOr,
  tryCatch,
  fromPromise,
  fromNullable,
  all,
  combine,
  firstSuccess,
  tap,
  tapError
} from '../Result';

describe('Result', () => {
  describe('success and failure', () => {
    it('should create successful result', () => {
      const result = success(42);
      expect(result.type).toBe('success');
      expect(result.value).toBe(42);
    });

    it('should create failure result', () => {
      const error = new Error('test error');
      const result = failure(error);
      expect(result.type).toBe('failure');
      expect(result.error).toBe(error);
    });
  });

  describe('type guards', () => {
    it('should identify success results', () => {
      const successResult = success(42);
      const failureResult = failure(new Error());
      
      expect(isSuccess(successResult)).toBe(true);
      expect(isSuccess(failureResult)).toBe(false);
    });

    it('should identify failure results', () => {
      const successResult = success(42);
      const failureResult = failure(new Error());
      
      expect(isFailure(failureResult)).toBe(true);
      expect(isFailure(successResult)).toBe(false);
    });
  });

  describe('transformations', () => {
    it('should map success values', () => {
      const result = success(42);
      const mapped = map(result, x => x * 2);
      
      expect(isSuccess(mapped)).toBe(true);
      expect((mapped as any).value).toBe(84);
    });

    it('should not map failure values', () => {
      const error = new Error('test error');
      const result = failure(error);
      const mapped = map(result, x => x * 2);
      
      expect(isFailure(mapped)).toBe(true);
      expect((mapped as any).error).toBe(error);
    });

    it('should flatMap success values', () => {
      const result = success(42);
      const flatMapped = flatMap(result, x => success(x * 2));
      
      expect(isSuccess(flatMapped)).toBe(true);
      expect((flatMapped as any).value).toBe(84);
    });

    it('should handle flatMap returning failure', () => {
      const result = success(42);
      const error = new Error('transformed error');
      const flatMapped = flatMap(result, _ => failure(error));
      
      expect(isFailure(flatMapped)).toBe(true);
      expect((flatMapped as any).error).toBe(error);
    });

    it('should mapError on failure values', () => {
      const originalError = new Error('original');
      const newError = new Error('transformed');
      const result = failure(originalError);
      const mapped = mapError(result, _ => newError);
      
      expect(isFailure(mapped)).toBe(true);
      expect((mapped as any).error).toBe(newError);
    });
  });

  describe('recovery', () => {
    it('should recover from failures', () => {
      const result = failure(new Error());
      const recovered = recover(result, _ => 42);
      
      expect(recovered).toBe(42);
    });

    it('should return value on success without recovery', () => {
      const result = success(42);
      const recovered = recover(result, _ => 0);
      
      expect(recovered).toBe(42);
    });

    it('should recoverWith from failures', () => {
      const result = failure(new Error());
      const recovered = recoverWith(result, _ => success(42));
      
      expect(isSuccess(recovered)).toBe(true);
      expect((recovered as any).value).toBe(42);
    });
  });

  describe('unwrapping', () => {
    it('should unwrap success values', () => {
      const result = success(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw when unwrapping failures', () => {
      const error = new Error('test error');
      const result = failure(error);
      
      expect(() => unwrap(result)).toThrow(error);
    });

    it('should unwrapOr with default on failures', () => {
      const result = failure(new Error());
      expect(unwrapOr(result, 42)).toBe(42);
    });

    it('should unwrapOr with value on success', () => {
      const result = success(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });
  });

  describe('error handling', () => {
    it('should catch errors with tryCatch', () => {
      const success = tryCatch(() => 42);
      const failure = tryCatch(() => { throw new Error('test error'); });
      
      expect(isSuccess(success)).toBe(true);
      expect(isFailure(failure)).toBe(true);
    });

    it('should convert promises to results', async () => {
      const successPromise = Promise.resolve(42);
      const failurePromise = Promise.reject(new Error('test error'));
      
      const successResult = await fromPromise(successPromise);
      const failureResult = await fromPromise(failurePromise);
      
      expect(isSuccess(successResult)).toBe(true);
      expect(isFailure(failureResult)).toBe(true);
    });

    it('should handle nullable values', () => {
      const presentResult = fromNullable(42, () => new Error());
      const nullResult = fromNullable(null, () => new Error('null'));
      const undefinedResult = fromNullable(undefined, () => new Error('undefined'));
      
      expect(isSuccess(presentResult)).toBe(true);
      expect(isFailure(nullResult)).toBe(true);
      expect(isFailure(undefinedResult)).toBe(true);
    });
  });

  describe('combinators', () => {
    it('should combine multiple results with all', () => {
      const allSuccess = all([success(1), success(2), success(3)]);
      const withFailure = all([success(1), failure(new Error()), success(3)]);
      
      expect(isSuccess(allSuccess)).toBe(true);
      expect((allSuccess as any).value).toEqual([1, 2, 3]);
      expect(isFailure(withFailure)).toBe(true);
    });

    it('should combine two results', () => {
      const bothSuccess = combine(success(1), success('a'));
      const withFailure = combine(success(1), failure(new Error()));
      
      expect(isSuccess(bothSuccess)).toBe(true);
      expect((bothSuccess as any).value).toEqual([1, 'a']);
      expect(isFailure(withFailure)).toBe(true);
    });

    it('should return first success with firstSuccess', () => {
      const noSuccess = firstSuccess([
        failure(new Error('1')), 
        failure(new Error('2'))
      ]);
      const withSuccess = firstSuccess([
        failure(new Error()), 
        success(42), 
        success(43)
      ]);
      
      expect(isFailure(noSuccess)).toBe(true);
      expect(isSuccess(withSuccess)).toBe(true);
      expect((withSuccess as any).value).toBe(42);
    });
  });

  describe('side effects', () => {
    it('should execute tap for success', () => {
      const mockFn = jest.fn();
      const result = success(42);
      const tapped = tap(result, mockFn);
      
      expect(mockFn).toHaveBeenCalledWith(42);
      expect(tapped).toBe(result);
    });

    it('should execute tapError for failure', () => {
      const mockFn = jest.fn();
      const error = new Error();
      const result = failure(error);
      const tapped = tapError(result, mockFn);
      
      expect(mockFn).toHaveBeenCalledWith(error);
      expect(tapped).toBe(result);
    });
  });
});
