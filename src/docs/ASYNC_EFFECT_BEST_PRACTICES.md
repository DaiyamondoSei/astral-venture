
# Asynchronous Effects Best Practices

This document outlines key best practices for handling asynchronous operations in React components to prevent common issues like memory leaks, race conditions, and uncaught promise rejections.

## Table of Contents

1. [Effect Cleanup](#effect-cleanup)
2. [AbortController Pattern](#abortcontroller-pattern)
3. [Preventing Race Conditions](#preventing-race-conditions)
4. [Error Handling in Async Effects](#error-handling-in-async-effects)
5. [State Updates in Async Effects](#state-updates-in-async-effects)
6. [Managing API Calls](#managing-api-calls)
7. [Handling WebSockets and Event Listeners](#handling-websockets-and-event-listeners)

## Effect Cleanup

### Problem:
When a component unmounts while asynchronous operations (like API calls, timeouts, or subscriptions) are still pending, this can lead to memory leaks, state updates on unmounted components, and uncaught promise rejections.

### Best Practices:

```tsx
// ❌ INCORRECT - No cleanup
useEffect(() => {
  const fetchData = async () => {
    const response = await api.getData();
    setData(response); // Can cause errors if component unmounts before response
  };
  fetchData();
}, []);

// ✅ CORRECT - With cleanup
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      const response = await api.getData();
      if (isMounted) {
        setData(response); // Safe: only updates state if component is still mounted
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  // Cleanup function
  return () => {
    isMounted = false;
  };
}, []);
```

## AbortController Pattern

Modern browsers support the AbortController API, which is the recommended way to cancel fetch requests and other async operations.

```tsx
// ✅ RECOMMENDED - Using AbortController
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      // AbortError is expected when the component unmounts
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  // Cleanup function
  return () => {
    controller.abort();
  };
}, []);
```

## Preventing Race Conditions

Race conditions occur when multiple async operations complete in an unpredictable order.

```tsx
// ❌ POTENTIAL RACE CONDITION
useEffect(() => {
  const fetchData = async () => {
    const response = await api.getData(query);
    setData(response); // Might set older data if a newer request finishes first
  };
  
  fetchData();
}, [query]);

// ✅ PREVENTING RACE CONDITIONS
useEffect(() => {
  let isLatestRequest = true;
  
  const fetchData = async () => {
    const requestQuery = query; // Capture the current query value
    
    try {
      const response = await api.getData(requestQuery);
      
      // Only update state if this is still the latest request
      if (isLatestRequest && requestQuery === query) {
        setData(response);
      }
    } catch (error) {
      if (isLatestRequest) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    isLatestRequest = false;
  };
}, [query]);
```

## Error Handling in Async Effects

Always properly handle errors in asynchronous effects to prevent unhandled promise rejections.

```tsx
// ✅ PROPER ERROR HANDLING
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      // AbortError is expected when the component unmounts
      if (error.name !== 'AbortError') {
        setError(error);
        console.error('Fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
  
  return () => {
    controller.abort();
  };
}, []);
```

## State Updates in Async Effects

When updating state based on previous state inside async effects, use the functional update form to avoid stale state issues.

```tsx
// ❌ INCORRECT - Potential stale state
useEffect(() => {
  const fetchAndUpdateItems = async () => {
    const newItems = await fetchItems();
    setItems([...items, ...newItems]); // Uses potentially stale 'items'
  };
  
  fetchAndUpdateItems();
}, [itemId]);

// ✅ CORRECT - Functional update
useEffect(() => {
  const fetchAndUpdateItems = async () => {
    const newItems = await fetchItems();
    setItems(prevItems => [...prevItems, ...newItems]); // Always uses latest state
  };
  
  fetchAndUpdateItems();
}, [itemId]);
```

## Managing API Calls

Use consistent patterns for API calls across your application.

```tsx
// ✅ RECOMMENDED API CALL PATTERN
const apiCall = async (url, options = {}) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Usage in component
useEffect(() => {
  let isMounted = true;
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const data = await apiCall('/api/data', { signal: controller.signal });
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
    controller.abort();
  };
}, []);
```

## Handling WebSockets and Event Listeners

WebSockets, event listeners, and subscriptions require proper cleanup.

```tsx
// ✅ CORRECT WEBSOCKET HANDLING
useEffect(() => {
  const socket = new WebSocket('wss://example.com');
  
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    setMessages(prev => [...prev, data]);
  });
  
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
    setError('Connection error');
  });
  
  // Connection opened handler
  socket.addEventListener('open', () => {
    setIsConnected(true);
  });
  
  // Return cleanup function
  return () => {
    // Close the connection when component unmounts
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}, []);
```

## General Guidelines

1. **Always provide cleanup functions** for effects that create subscriptions or fetch data.
2. **Use AbortController** for canceling fetch requests.
3. **Track component mount state** to prevent state updates after unmounting.
4. **Handle race conditions** by tracking the latest request.
5. **Properly handle all errors** in async operations.
6. **Use functional updates** when updating state based on previous state in async contexts.
7. **Centralize API call patterns** for consistency.
8. **Add timeouts** to async operations that might never resolve.

By following these best practices, you can avoid common issues like memory leaks, state updates on unmounted components, race conditions, and uncaught promise rejections in your React application.
