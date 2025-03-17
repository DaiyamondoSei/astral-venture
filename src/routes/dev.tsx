
import React from 'react';
import { Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PerformanceDemoPage from '@/pages/PerformanceDemoPage';
import ChakraDemoPage from '@/pages/dev/ChakraDemoPage';
import MeditationDemoPage from '@/pages/dev/MeditationDemoPage';
import ComponentLibraryPage from '@/pages/dev/ComponentLibraryPage';

/**
 * Development-only routes
 * 
 * These routes are only available in development mode
 */
const DevRoutes = () => {
  return (
    <>
      {/* Development tools */}
      <Route path="/dev" element={<MainLayout />}>
        <Route path="components" element={<ComponentLibraryPage />} />
        <Route path="chakra-demo" element={<ChakraDemoPage />} />
        <Route path="meditation-demo" element={<MeditationDemoPage />} />
        <Route path="performance" element={<PerformanceDemoPage />} />
      </Route>
    </>
  );
};

export default DevRoutes;
