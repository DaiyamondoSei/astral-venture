
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { initWebVitals } from './utils/webVitalsMonitor';
import { handleError, ErrorCategory, ErrorSeverity } from './utils/errorHandling';
import './index.css';

// Initialize web vitals in production
if (import.meta.env.PROD) {
  try {
    initWebVitals();
  } catch (error) {
    handleError(error, {
      context: 'App Initialization',
      category: ErrorCategory.UNEXPECTED,
      severity: ErrorSeverity.WARNING,
      showToast: false
    });
  }
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
