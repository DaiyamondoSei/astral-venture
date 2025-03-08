
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PerformanceProvider } from './contexts/PerformanceContext';
import PerformanceMonitor from './components/dev-mode/PerformanceMonitor';
import PerformanceInsights from './components/dev-mode/PerformanceInsights';
import RenderInsights from './components/dev-mode/RenderInsights';
import ComponentRelationships from './components/dev-mode/ComponentRelationships';
import CodeQualityDashboard from './components/dev-mode/CodeQualityDashboard';
import AIAssistantDashboard from './components/dev-mode/AIAssistantDashboard';
import { QuantumParticles } from '@/components/lazy';
import { usePerformanceTracking } from './hooks/usePerformanceTracking';
import { useRenderTracking } from './hooks/useRenderTracking';
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

// Loading component
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <motion.div
      className="text-gray-800 text-2xl font-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-t-2 border-quantum-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-quantum-700">Awakening quantum field...</p>
      </div>
    </motion.div>
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
  useCodeEnhancement('App', {
    complexity: 40,
    dependencies: [
      'BrowserRouter', 'Routes', 'Route', 'AuthProvider', 
      'OnboardingProvider', 'AnimatePresence', 'Toaster', 
      'ErrorBoundary', 'PerformanceProvider'
    ],
    hooks: ['usePerformanceTracking', 'useRenderTracking', 'useCodeEnhancement'],
    childComponents: [
      'BrowserRouter', 'ErrorBoundary', 'AuthProvider', 
      'OnboardingProvider', 'PerformanceMonitor', 'PerformanceInsights',
      'RenderInsights', 'ComponentRelationships', 'CodeQualityDashboard',
      'AIAssistantDashboard'
    ],
    trackRenders: true
  });
  
  return (
    <PerformanceProvider>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingProvider>
            <div className="relative min-h-screen overflow-hidden bg-white text-gray-800">
              {/* Simplified background effect for better performance */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />
              
              <BrowserRouter>
                <AnimatePresence mode="wait">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Index />
                        </motion.div>
                      } />
                      <Route path="/login" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Login />
                        </motion.div>
                      } />
                      <Route path="/entry-animation" element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8 }}
                        >
                          <EntryAnimationPage />
                        </motion.div>
                      } />
                      <Route path="/dream-capture" element={
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.5 }}
                        >
                          <DreamCapture />
                        </motion.div>
                      } />
                      <Route path="/astral-body-demo" element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <AstralBodyDemo />
                        </motion.div>
                      } />
                      <Route path="/dashboard" element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Dashboard />
                        </motion.div>
                      } />
                      <Route path="/preferences" element={
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          <PersonalizationPage />
                        </motion.div>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </BrowserRouter>
              <Toaster />
            </div>
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
      <PerformanceMonitor />
      
      {/* Development mode analysis tools */}
      <PerformanceInsights />
      <RenderInsights />
      <ComponentRelationships />
      <CodeQualityDashboard />
      <AIAssistantDashboard />
    </PerformanceProvider>
  );
}

export default App;
