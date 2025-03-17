
import React from 'react';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
