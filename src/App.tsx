
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { ErrorPreventionProvider } from './contexts/ErrorPreventionContext';
import { PerfConfigProvider } from './contexts/PerfConfigContext';
import PerformanceMonitor from './components/dev-mode/PerformanceMonitor';
import PerformanceInsights from './components/dev-mode/PerformanceInsights';
import RenderInsights from './components/dev-mode/RenderInsights';
import PerfConfigDashboard from './components/dev-mode/PerfConfigDashboard';
import { useCodeEnhancement } from './hooks/useCodeEnhancement';

// Lazy load the pages for better performance
const Index = lazy(() => import('@/pages/index'));
const Login = lazy(() => import('@/pages/Login'));
const EntryAnimationPage = lazy(() => import('@/pages/EntryAnimation'));
const DreamCapture = lazy(() => import('@/pages/DreamCapture'));
const AstralBodyDemo = lazy(() => import('@/pages/AstralBodyDemo'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PersonalizationPage = lazy(() => import('./pages/PersonalizationPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading component - simplified to reduce dependencies and improve performance
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="text-gray-800 text-2xl font-light">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-quantum-400 rounded-full animate-spin" />
        <p className="mt-4 text-quantum-700">
          Awakening quantum field...
        </p>
      </div>
    </div>
  </div>
);

/**
 * Main App Component
 * 
 * Sets up the application's routing and global providers.
 * Wraps the entire app in an ErrorBoundary for graceful error handling.
 * Now with integrated performance tracking and code quality analysis.
 */
function App() {
  // Use the combined code enhancement hook
  useCodeEnhancement('App');

  return (
    <PerfConfigProvider initialConfig={{ 
      enablePerformanceTracking: true,
      enableRenderTracking: true,
      enableValidation: true,
      enablePropTracking: false,
      enableDebugLogging: false
    }}>
      <PerformanceProvider>
        <ErrorPreventionProvider>
          <ErrorBoundary>
            <AuthProvider>
              <OnboardingProvider>
                <div className="relative min-h-screen overflow-hidden bg-white text-gray-800">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white"></div>
                  
                  <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/entry-animation" element={<EntryAnimationPage />} />
                        <Route path="/dream-capture" element={<DreamCapture />} />
                        <Route path="/astral-body-demo" element={<AstralBodyDemo />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/preferences" element={<PersonalizationPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                  
                  <Toaster />
                </div>
              </OnboardingProvider>
            </AuthProvider>
          </ErrorBoundary>
          
          {/* Performance monitoring tools - only shown in development */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <PerfConfigDashboard />
              <PerformanceMonitor />
              <PerformanceInsights />
              <RenderInsights />
            </>
          )}
        </ErrorPreventionProvider>
      </PerformanceProvider>
    </PerfConfigProvider>
  );
}

export default App;
