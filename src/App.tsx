
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { PerfConfigProvider } from '@/contexts/PerfConfigContext';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { QuantumThemeProvider } from '@/components/visual-foundation';
import { PanelProvider } from '@/contexts/PanelContext';
import SwipeablePanelController from '@/components/panels/SwipeablePanelController';
import SwipeIndicator from '@/components/panels/SwipeIndicator';
import { AuthProvider } from '@/contexts/AuthContext';

import LandingPage from '@/pages/LandingPage';
import HomePage from '@/pages/HomePage';
import EntryAnimationPage from '@/pages/EntryAnimationPage';
import DashboardPage from '@/pages/DashboardPage';
import DesignSystemDemo from '@/pages/DesignSystemDemo';
import NotFoundPage from '@/pages/NotFoundPage';
import OnboardingPage from '@/pages/OnboardingPage';
import PracticePage from '@/pages/PracticePage';
import { useEffect } from 'react';
import { preloadPanelData } from '@/utils/panelDataPreloader';

// Create Query Client with defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Preload panel data when the app starts
  useEffect(() => {
    preloadPanelData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PerfConfigProvider>
        <AdaptivePerformanceProvider>
          <QuantumThemeProvider>
            <AuthProvider>
              <PanelProvider>
                {/* Swipeable panels controller */}
                <SwipeablePanelController />
                
                {/* Swipe indicators */}
                <Routes>
                  <Route 
                    path="/home" 
                    element={
                      <>
                        <SwipeIndicator position="top" />
                        <SwipeIndicator position="bottom" />
                        <HomePage />
                      </>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <>
                        <SwipeIndicator position="top" />
                        <SwipeIndicator position="bottom" />
                        <DashboardPage />
                      </>
                    } 
                  />
                  <Route 
                    path="/practice" 
                    element={
                      <>
                        <SwipeIndicator position="top" />
                        <SwipeIndicator position="bottom" />
                        <PracticePage />
                      </>
                    } 
                  />
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/entry-animation" element={<EntryAnimationPage />} />
                  <Route path="/design-system" element={<DesignSystemDemo />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                
                <Toaster />
              </PanelProvider>
            </AuthProvider>
          </QuantumThemeProvider>
        </AdaptivePerformanceProvider>
      </PerfConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
