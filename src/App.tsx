import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import EntryAnimationPage from '@/pages/EntryAnimation';
import DreamCapture from '@/pages/DreamCapture';
import AstralBodyDemo from '@/pages/AstralBodyDemo';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import PersonalizationPage from './pages/PersonalizationPage';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Main App Component
 * 
 * Sets up the application's routing and global providers.
 * Wraps the entire app in an ErrorBoundary for graceful error handling.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OnboardingProvider>
          <BrowserRouter>
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
          </BrowserRouter>
          <Toaster />
        </OnboardingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
