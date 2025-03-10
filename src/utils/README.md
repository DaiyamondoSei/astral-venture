
# Error Handling and Performance Monitoring System

This directory contains utilities for error handling and performance monitoring in the application.

## Error Handling

The error handling system provides a standardized way to handle errors across the application. It includes:

- `AppError`: A base error class that extends the standard Error class with additional metadata
- `ValidationError`: A specialized error class for validation failures
- `handleError`: A centralized function for handling errors consistently
- Error display utilities for showing toast notifications
- Error classification utilities for categorizing errors

### Usage

```typescript
import { handleError, handleValidationError, handleApiError } from '@/utils/errorHandling/handleError';

// General error handling
try {
  // Some code that might throw an error
} catch (error) {
  handleError(error, { 
    context: 'LoadingUserData',
    showToast: true
  });
}

// API error handling
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error('API request failed');
  }
} catch (error) {
  handleApiError(error, {
    customMessage: 'Failed to load data. Please try again.'
  });
}

// Validation error handling
try {
  const email = validateEmail(formData.email);
} catch (error) {
  handleValidationError(error, {
    includeValidationDetails: true
  });
}
```

## Performance Monitoring

The performance monitoring system tracks component render times and web vitals metrics. It includes:

- `performanceMonitor`: A singleton instance for tracking component metrics
- `metricsReporter`: A utility for reporting metrics to the server
- `usePerformanceTracking`: A React hook for component-level performance tracking
- Web Vitals monitoring for core metrics (FCP, LCP, CLS, FID, TTFB)

### Usage

```typescript
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';

function MyComponent() {
  const { startTiming, endTiming, startInteractionTiming } = usePerformanceTracking({
    componentName: 'MyComponent',
    autoStart: true,
    logSlowRenders: true
  });
  
  const handleClick = () => {
    const endTimingFn = startInteractionTiming('button-click');
    // Do something
    endTimingFn();
  };
  
  return (
    <button onClick={handleClick}>Click Me</button>
  );
}
```

## Edge Functions

The system includes edge functions for server-side processing:

- `track-performance`: Receives and stores performance metrics on the server
- Shared utilities for response handling, caching, and authentication

## Database Schema

Performance data is stored in two main tables:

- `performance_metrics`: Component-level render metrics
- `web_vitals`: Core Web Vitals metrics

## Configuration

Performance monitoring can be configured through the `PerfConfigContext` provider, which allows for adaptive performance based on device capabilities.
