
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PerfConfigProvider } from './contexts/PerfConfigContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { ConsciousnessProvider } from './contexts/ConsciousnessContext';
import LoadingScreen from './components/LoadingScreen';
import PerformanceMonitor from './components/dev-mode/PerformanceMonitor';

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DreamCapturePage = lazy(() => import('./pages/DreamCapture'));
const EntryAnimationPage = lazy(() => import('./pages/EntryAnimation'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MeditationPage = lazy(() => import('./pages/MeditationPage'));
const ReflectionPage = lazy(() => import('./pages/ReflectionPage'));
const ChakraPage = lazy(() => import('./pages/ChakraPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <PerfConfigProvider>
      <PerformanceProvider>
        <ConsciousnessProvider>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dream-capture" element={<DreamCapturePage />} />
                <Route path="/entry-animation" element={<EntryAnimationPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/meditation" element={<MeditationPage />} />
                <Route path="/reflection" element={<ReflectionPage />} />
                <Route path="/chakra" element={<ChakraPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            {/* Performance Monitor (only visible in development) */}
            <PerformanceMonitor />
          </Router>
        </ConsciousnessProvider>
      </PerformanceProvider>
    </PerfConfigProvider>
  );
}

export default App;
