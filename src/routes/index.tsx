
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import EntryLayout from '@/layouts/EntryLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Main Pages
import DashboardPage from '@/pages/DashboardPage';
import JournalPage from '@/pages/JournalPage';

// Development Routes (only in development)
import DevRoutes from '@/routes/dev';

// Create a protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const MainRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Entry Experience */}
      <Route element={<EntryLayout />}>
        <Route path="/onboarding" element={<div>Onboarding Page (Coming Soon)</div>} />
        <Route path="/entry" element={<div>Entry Experience (Coming Soon)</div>} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chakras" element={<div>Chakras Page (Coming Soon)</div>} />
        <Route path="/meditation" element={<div>Meditation Page (Coming Soon)</div>} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/astral" element={<div>Astral Projection Page (Coming Soon)</div>} />
        <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
      </Route>
      
      {/* Development Routes - only shown in development */}
      {process.env.NODE_ENV === 'development' && <DevRoutes />}
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainRoutes;
