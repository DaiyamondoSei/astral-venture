
import { renderHook, act } from '@testing-library/react';
import { useDimensions } from '../useDimensions';

describe('useDimensions Hook', () => {
  // Create a mock container element
  let mockContainer: HTMLDivElement;
  const mockIsMounted = { current: true };
  
  beforeEach(() => {
    mockContainer = document.createElement('div');
    
    // Mock the container dimensions
    Object.defineProperty(mockContainer, 'offsetWidth', { value: 500 });
    Object.defineProperty(mockContainer, 'offsetHeight', { value: 300 });
    
    // Add to document for testing
    document.body.appendChild(mockContainer);
    
    // Reset isMounted flag
    mockIsMounted.current = true;
    
    // Mock window.requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
    
    // Mock window.cancelAnimationFrame
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  
  afterEach(() => {
    document.body.removeChild(mockContainer);
    jest.restoreAllMocks();
  });

  it('should initialize with null dimensions', () => {
    const containerRef = { current: null };
    const { result } = renderHook(() => useDimensions(containerRef, true, mockIsMounted));
    
    expect(result.current.dimensions).toBeNull();
  });

  it('should update dimensions correctly when container is available', () => {
    const containerRef = { current: mockContainer };
    const { result } = renderHook(() => useDimensions(containerRef, true, mockIsMounted));
    
    // Call updateDimensions manually to simulate initialization
    act(() => {
      result.current.updateDimensions();
    });
    
    expect(result.current.dimensions).toEqual({ width: 500, height: 300 });
  });

  it('should not update dimensions when component is unmounted', () => {
    const containerRef = { current: mockContainer };
    mockIsMounted.current = false;
    
    const { result } = renderHook(() => useDimensions(containerRef, true, mockIsMounted));
    
    act(() => {
      result.current.updateDimensions();
    });
    
    expect(result.current.dimensions).toBeNull();
  });

  it('should handle resize events when responsive is true', () => {
    const containerRef = { current: mockContainer };
    const { result } = renderHook(() => useDimensions(containerRef, true, mockIsMounted));
    
    // Simulate initial render
    act(() => {
      result.current.updateDimensions();
    });
    
    // Change container dimensions
    Object.defineProperty(mockContainer, 'offsetWidth', { value: 600 });
    Object.defineProperty(mockContainer, 'offsetHeight', { value: 400 });
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.dimensions).toEqual({ width: 600, height: 400 });
  });

  it('should not handle resize events when responsive is false', () => {
    const containerRef = { current: mockContainer };
    const { result } = renderHook(() => useDimensions(containerRef, false, mockIsMounted));
    
    // Simulate initial render
    act(() => {
      result.current.updateDimensions();
    });
    
    expect(result.current.dimensions).toEqual({ width: 500, height: 300 });
    
    // Change container dimensions
    Object.defineProperty(mockContainer, 'offsetWidth', { value: 600 });
    Object.defineProperty(mockContainer, 'offsetHeight', { value: 400 });
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Dimensions should not change since responsive is false
    expect(result.current.dimensions).toEqual({ width: 500, height: 300 });
  });

  it('should handle errors gracefully when measuring dimensions', () => {
    console.error = jest.fn();
    
    // Create a container that will throw an error when accessing properties
    const errorContainer = {};
    const containerRef = { current: errorContainer as HTMLDivElement };
    
    const { result } = renderHook(() => useDimensions(containerRef, true, mockIsMounted));
    
    act(() => {
      result.current.updateDimensions();
    });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error measuring container dimensions:'),
      expect.any(Error)
    );
    expect(result.current.dimensions).toBeNull();
  });
});
