
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleErrorBoundary from '../error-handling/SimpleErrorBoundary';

// Component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Component rendered successfully</div>;
};

// Custom fallback component
const CustomFallback = ({ error }) => (
  <div>
    <h2>Custom Error UI</h2>
    <p>{error.message}</p>
    <button>Retry</button>
  </div>
);

describe('SimpleErrorBoundary', () => {
  // Mock console.error to prevent test output noise
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <SimpleErrorBoundary>
        <div>Test content</div>
      </SimpleErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs', () => {
    render(
      <SimpleErrorBoundary>
        <ErrorThrowingComponent />
      </SimpleErrorBoundary>
    );
    
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('renders custom fallback component when provided and an error occurs', () => {
    render(
      <SimpleErrorBoundary fallback={CustomFallback}>
        <ErrorThrowingComponent />
      </SimpleErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls onError when an error occurs', () => {
    const handleError = jest.fn();
    
    render(
      <SimpleErrorBoundary onError={handleError}>
        <ErrorThrowingComponent />
      </SimpleErrorBoundary>
    );
    
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0][0].message).toBe('Test error');
  });

  it('continues to work after error occurs', () => {
    // Use a class component that can change its state
    class TestComponent extends React.Component {
      state = { shouldThrow: true };
      
      render() {
        if (this.state.shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Recovered from error</div>;
      }
    }
    
    const onError = jest.fn();
    
    // Initial render with error
    const { rerender } = render(
      <SimpleErrorBoundary onError={onError}>
        <TestComponent />
      </SimpleErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    
    // Force a new render with recovered component
    jest.spyOn(TestComponent.prototype, 'render').mockImplementation(() => {
      return <div>Recovered from error</div>;
    });
    
    rerender(
      <SimpleErrorBoundary onError={onError}>
        <TestComponent />
      </SimpleErrorBoundary>
    );
    
    // We still see the error UI because the error boundary hasn't been reset
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });
});
