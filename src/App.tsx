
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { PerformanceProvider } from '@/shared/contexts/PerformanceContext';
import ErrorBoundary from '@/shared/components/error/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import MainRoutes from '@/routes';

// Create a client for React Query with updated config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (replaces cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div className="p-6 text-red-500">Something went wrong. Please refresh the page.</div>}>
      <PerformanceProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <MainRoutes />
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
};

export default App;
export { queryClient };
