
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';
import EnhancedErrorBoundary from '../error-handling/EnhancedErrorBoundary';

// Create a component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Components', () => {
  // Suppress console.error during tests to avoid noisy output
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  describe('Basic ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
    
    it('renders error UI when an error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/An unknown error occurred|Test error/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
    
    it('resets the error when the try again button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
      
      // Click the try again button
      fireEvent.click(screen.getByText('Try Again'));
      
      // Rerender with a non-throwing component
      rerender(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
    
    it('uses custom fallback UI when provided', () => {
      const customFallback = <div>Custom Error UI</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });
  });
  
  describe('Enhanced ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <EnhancedErrorBoundary>
          <div>Enhanced Test Content</div>
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('Enhanced Test Content')).toBeInTheDocument();
    });
    
    it('renders error UI when an error occurs', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorThrowingComponent />
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
    
    it('calls onError callback when provided', () => {
      const onErrorMock = jest.fn();
      
      render(
        <EnhancedErrorBoundary onError={onErrorMock}>
          <ErrorThrowingComponent />
        </EnhancedErrorBoundary>
      );
      
      expect(onErrorMock).toHaveBeenCalled();
      expect(onErrorMock.mock.calls[0][0].message).toBe('Test error');
    });
    
    it('resets error on props change when resetOnPropsChange is true', () => {
      const { rerender } = render(
        <EnhancedErrorBoundary resetOnPropsChange={true}>
          <ErrorThrowingComponent />
        </EnhancedErrorBoundary>
      );
      
      // Rerender with different props
      rerender(
        <EnhancedErrorBoundary resetOnPropsChange={true}>
          <ErrorThrowingComponent shouldThrow={false} />
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
    
    it('uses custom fallback UI when provided', () => {
      const customFallback = <div>Enhanced Custom Error UI</div>;
      
      render(
        <EnhancedErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent />
        </EnhancedErrorBoundary>
      );
      
      expect(screen.getByText('Enhanced Custom Error UI')).toBeInTheDocument();
    });
  });
});
