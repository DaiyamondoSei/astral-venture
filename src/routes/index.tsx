
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { EntryLayout } from '@/layouts/EntryLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ChakraSystemPage from '@/pages/ChakraSystemPage';
import MeditationPage from '@/pages/MeditationPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Protected route wrapper
import { ProtectedRoute } from './ProtectedRoute';

// Dev routes (only loaded in development)
import DevRoutes from './dev';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        {/* Entry experience */}
        <Route element={<EntryLayout />}>
          <Route path="/entry" element={<div>Entry Experience (Coming Soon)</div>} />
          <Route path="/onboarding" element={<div>Onboarding (Coming Soon)</div>} />
        </Route>
        
        {/* Main authenticated routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/chakras" element={
            <ProtectedRoute>
              <ChakraSystemPage />
            </ProtectedRoute>
          } />
          
          <Route path="/meditation" element={
            <ProtectedRoute>
              <MeditationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dreams" element={
            <ProtectedRoute>
              <div>Dream Journal (Coming Soon)</div>
            </ProtectedRoute>
          } />
          
          <Route path="/astral" element={
            <ProtectedRoute>
              <div>Astral Projection (Coming Soon)</div>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Development routes - only loaded in development */}
        {process.env.NODE_ENV === 'development' && DevRoutes()}
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
