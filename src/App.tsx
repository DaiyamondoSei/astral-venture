import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import EntryAnimationPage from '@/pages/EntryAnimation';
import DreamCapture from '@/pages/DreamCapture';
import AstralBodyDemo from '@/pages/AstralBodyDemo';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/entry-animation" element={<EntryAnimationPage />} />
          <Route path="/dream-capture" element={<DreamCapture />} />
          <Route path="/astral-body-demo" element={<AstralBodyDemo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
