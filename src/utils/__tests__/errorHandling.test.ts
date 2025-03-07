
import { handleError, createSafeAsyncFunction, createSafeFunction, ErrorSeverity } from '../errorHandling';
import { toast } from '@/components/ui/use-toast';

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  });

  describe('handleError', () => {
    it('should handle Error objects correctly', () => {
      const testError = new Error('Test error message');
      handleError(testError, 'TestContext');
      
      // Check if console.error was called with the correct arguments
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error in TestContext:'),
        testError
      );
      
      // Check if toast was called with the correct arguments
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error in TestContext',
          description: 'Test error message',
          variant: 'destructive'
        })
      );
    });

    it('should handle string errors correctly', () => {
      handleError('String error message', 'TestContext');
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error in TestContext:'),
        'String error message'
      );
      
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error in TestContext',
          description: 'String error message',
          variant: 'destructive'
        })
      );
    });

    it('should handle unknown errors correctly', () => {
      handleError(null, 'TestContext');
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error in TestContext:'),
        null
      );
      
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error in TestContext',
          description: 'An unknown error occurred',
          variant: 'destructive'
        })
      );
    });

    it('should use the correct severity level for logging', () => {
      handleError('Warning message', { context: 'TestContext', severity: ErrorSeverity.WARNING });
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      
      handleError('Info message', { context: 'TestContext', severity: ErrorSeverity.INFO });
      expect(console.info).toHaveBeenCalled();
    });

    it('should not show toast when showToast is false', () => {
      handleError('No toast error', { context: 'TestContext', showToast: false });
      expect(toast).not.toHaveBeenCalled();
    });

    it('should truncate long error messages in toast', () => {
      const longMessage = 'a'.repeat(200);
      handleError(longMessage, 'TestContext');
      
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/^a{100}\.\.\.$/),
        })
      );
    });
  });

  describe('createSafeAsyncFunction', () => {
    it('should return the result of the wrapped function on success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const safeFn = createSafeAsyncFunction(mockFn, 'TestContext');
      
      const result = await safeFn('arg1', 'arg2');
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('success');
    });

    it('should handle errors and return null on failure', async () => {
      const mockError = new Error('Async function failed');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const safeFn = createSafeAsyncFunction(mockFn, 'TestContext');
      
      const result = await safeFn();
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalled();
    });

    it('should retry the specified number of times before failing', async () => {
      const mockError = new Error('Retry function failed');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockRetry = jest.fn().mockResolvedValue(undefined);
      
      const safeFn = createSafeAsyncFunction(mockFn, {
        context: 'RetryContext',
        retry: mockRetry,
        maxRetries: 3
      });
      
      const result = await safeFn();
      
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial attempt + 3 retries
      expect(mockRetry).toHaveBeenCalledTimes(3);
      expect(result).toBeNull();
    });

    it('should stop retrying if retry function throws', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Main function error'));
      const mockRetry = jest.fn().mockRejectedValue(new Error('Retry function error'));
      
      const safeFn = createSafeAsyncFunction(mockFn, {
        context: 'FailedRetryContext',
        retry: mockRetry,
        maxRetries: 3
      });
      
      const result = await safeFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1); // Only initial attempt
      expect(mockRetry).toHaveBeenCalledTimes(1); // Only first retry attempt
      expect(result).toBeNull();
    });
  });

  describe('createSafeFunction', () => {
    it('should return the result of the wrapped function on success', () => {
      const mockFn = jest.fn().mockReturnValue('success');
      const safeFn = createSafeFunction(mockFn, 'TestContext');
      
      const result = safeFn('arg1', 'arg2');
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('success');
    });

    it('should handle errors and return null on failure', () => {
      const mockFn = jest.fn().mockImplementation(() => {
        throw new Error('Sync function failed');
      });
      
      const safeFn = createSafeFunction(mockFn, 'TestContext');
      const result = safeFn();
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
      expect(toast).toHaveBeenCalled();
    });
  });
});
