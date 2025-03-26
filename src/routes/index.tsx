
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import EntryLayout from '@/layouts/EntryLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import EntryAnimation from '@/pages/EntryAnimation';
import HomePage from '@/pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import ChakraSystemPage from '@/pages/ChakraSystemPage';
import MeditationPage from '@/pages/MeditationPage';
import ProfilePage from '@/pages/ProfilePage';
import PerformanceDemoPage from '@/pages/PerformanceDemoPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import AstralProjectionPage from '@/pages/astral-projection/AstralProjectionPage';

// Development routes - conditionally loaded in development
import DevRoutes from './dev';

const AppRoutes = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Routes>
      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Onboarding routes */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Entry animation routes */}
      <Route element={<EntryLayout />}>
        <Route path="/entry" element={<EntryAnimation />} />
      </Route>

      {/* Main app routes - protected by auth */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chakra-system" element={<ChakraSystemPage />} />
        <Route path="/meditation" element={<MeditationPage />} />
        <Route path="/astral-projection" element={<AstralProjectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/performance" element={<PerformanceDemoPage />} />
      </Route>

      {/* Development routes - only available in development mode */}
      {isDevelopment && <DevRoutes />}
    </Routes>
  );
};

export default AppRoutes;
