
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import EntryLayout from '@/layouts/EntryLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EntryAnimationPage from '@/pages/EntryAnimationPage';
import ChakraPage from '@/pages/ChakraPage';
import JournalPage from '@/pages/JournalPage';
import ProfilePage from '@/pages/ProfilePage';
import MeditationPage from '@/pages/MeditationPage';
import ReflectionPage from '@/pages/ReflectionPage';

// Dev Routes (only loaded in development)
import DevRoutes from './dev';

import { useAuth } from '@/shared/hooks/useAuth';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-quantum-900">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-quantum-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } />
        </Route>
        
        {/* Entry Experience */}
        <Route element={<EntryLayout />}>
          <Route path="/entry" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <EntryAnimationPage />
          } />
        </Route>
        
        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <DashboardPage />
          } />
          <Route path="/chakras" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <ChakraPage />
          } />
          <Route path="/journal" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <JournalPage />
          } />
          <Route path="/profile" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <ProfilePage />
          } />
          <Route path="/meditation" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <MeditationPage />
          } />
          <Route path="/reflection" element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <ReflectionPage />
          } />
        </Route>
        
        {/* Development Routes (only in dev mode) */}
        {process.env.NODE_ENV === 'development' && <DevRoutes />}
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
